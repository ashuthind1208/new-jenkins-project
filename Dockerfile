# Use the official Node.js 18 image as the base image
FROM node:18    
WORKDIR /app
# Copy package.json and package-lock.json to the working directory
COPY package*.json ./
# Install dependencies
RUN npm install
# Copy the rest of the application code to the working directory
COPY . .
# Expose the application port
EXPOSE 3000
# Start the application
CMD ["node", "index.js"]
