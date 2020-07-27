pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                echo 'Building..'
                npm install
                npm run build
            }
        }
        stage('Test') {
            steps {
                echo 'Testing..'
                npm run lint
                npm run test:jenkins
                npm run cover
            }
        }
        stage('Development Publish') {
            when {
                branch "dev"
            }
            steps {
                echo 'Publishing Development....'
            }
        }
        stage('Release Publish') {
            when {
                branch "master"
            }
            steps {
                echo 'Publishing Release....'
            }
        }
    }
}