pipeline {
    agent any
    triggers {
        githubPush() // This explicitly enables the GitHub hook for this pipeline, ensuring it runs on every push to the repository
    }
    stages {
        stage('Checkout Code') {
            steps {
                // Delete everything including hidden files in the current directory
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
