pipeline {
    agent any

    stages {
        stage('Checkout Code') {
            steps {
                // Delete everything including hidden files in the current
                sh 'find . -maxdepth 1 -not -name "." -exec rm -rf {} +'
                // Clone the fresh code
                sh 'git clone https://github.com/ashuthind1208/new-jenkins-project .'
            }
        }
        stage('Build Docker Image') {
            steps {
                sh 'docker build -t my-web-app .'
            }
        }
        stage('Deploy Container') {
            steps {
                sh 'docker rm -f web-server || true'
                sh 'docker run -d -p 3000:3000 --name web-server my-web-app'
            }
        }
    }
}
