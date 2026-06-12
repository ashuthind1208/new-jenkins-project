require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const { createClient } = require('redis');

const app = express();
app.use(express.json());

console.log("Current working directory:", process.cwd());

// 1. Initialize MySQL Connection Pool
const dbPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    ssl: { rejectUnauthorized: false } // Required for Azure Flexible Server SSL enforcement
});

// 2. Initialize Azure Managed Redis Client over TLS
// 2. Initialize Azure Managed Redis Client over TLS with Keep-Alive policies
const redisClient = createClient({
    url: `rediss://default:${process.env.REDIS_KEY}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    socket: { 
        tls: true, 
        rejectUnauthorized: false,
        keepAlive: 5000,          // Keeps the connection from dropping silently
        connectTimeout: 10000     // Allows adequate time for the TLS handshake
    },
    disableOfflineQueue: true     // Prevents the client from hanging if the cluster topology check delays
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.connect().then(() => console.log('Connected to Azure Managed Redis successfully.'));

// 3. Database Bootstrap Route (Run this once to create the schema)
app.get('/api/init', async (req, res) => {
    try {
        await dbPool.query(`
            CREATE TABLE IF NOT EXISTS checkins (
                id INT AUTO_INCREMENT PRIMARY KEY,
                employee_name VARCHAR(255) NOT NULL,
                status_message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        res.send({ status: "Database table initialized successfully." });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// 4. POST Route: Write Data directly to Database, invalidate old cache
app.post('/api/checkin', async (req, res) => {
    const { name, message } = req.body;
    if (!name || !message) return res.status(400).send({ error: "Missing name or message" });

    try {
        // Insert into MySQL
        const [result] = await dbPool.query(
            'INSERT INTO checkins (employee_name, status_message) VALUES (?, ?)',
            [name, message]
        );
        
        // Evict the summary list cache so next fetch reflects new data
        await redisClient.del('all_checkins');

        res.status(201).send({ 
            success: true, 
            insertedId: result.insertId,
            message: "Data securely stored in private database tier." 
        });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// 5. GET Route: Read with Cache-Aside Strategy (Redis ➔ DB fallback)
app.get('/api/checkins', async (req, res) => {
    try {
        // Step A: Check Redis Cache
        const cachedData = await redisClient.get('all_checkins');
        if (cachedData) {
            return res.send({ source: 'Azure Managed Redis (Cache Hit!)', data: JSON.parse(cachedData) });
        }

        // Step B: Cache Miss - Query MySQL Database
        console.log('Cache miss! Fetching from MySQL...');
        const [rows] = await dbPool.query('SELECT * FROM checkins ORDER BY created_at DESC');

        // Step C: Save result to Redis with an expiration window (e.g., 60 seconds)
        await redisClient.setEx('all_checkins', 60, JSON.stringify(rows));

        res.send({ source: 'Azure Database Flexible Server (Cache Miss)', data: rows });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Application actively listening on port ${PORT}`));