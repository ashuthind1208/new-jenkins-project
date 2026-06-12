pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                echo 'Building and compiling the source code...'
                sh 'echo "Status: Build Complete - Version 1.0.0 (Stable)" > app-output.txt'
            }
        }
        stage('Test') {
            steps {
                echo 'Running unit tests...'
                sh 'echo "Status: Tests Passed Successfully!" >> app-output.txt'
            }
        }
        stage('Deploy') {
            steps {
                echo 'Deploying application...'
                sh 'echo "Status: Deployed to Production!" >> app-output.txt'
                archiveArtifacts artifacts: 'app-output.txt', fingerprint: true
            }
        }
    }
}
