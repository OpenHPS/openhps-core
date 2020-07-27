pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                echo 'Building..'
                sh 'npm install'
                sh 'npm run clean'
                sh 'npm run build:typescript'
                sh 'npm run build:webpack'
            }
        }
        stage('Documentation') {
            when {
                branch "master"
            }
            steps {
                echo 'Building Documentation..'
                sh 'npm run build:typedoc'
            }
        }
        stage('Test') {
            steps {
                echo 'Testing..'
                sh 'npm run lint'
                sh 'npm run test:jenkins'
                sh 'npm run cover'
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