pipeline {
    agent any

    //the stages start here
    stages {
        stage('Build Docker Image') {
            steps {
               // Remove existing image if it exists
                sh 'docker rmi -f web-server || true'
                // This builds the image from your Dockerfile
                sh 'docker build -t my-web-app .'
            }
        }
        stage('Deploy Container') {
            steps {
                // Remove existing container if it exists
                sh 'docker rm -f web-server || true'
                // Run the new container on port 8090
                sh 'docker run -d -p 8090:80 --name web-server my-web-app'
            }
        }
    }
}
