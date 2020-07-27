pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                echo 'Building ...'
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
                echo 'Testing ...'
                sh 'npm run lint'
                sh 'npm run test:jenkins'
            }
        }
        stage('Publish Development') {
            when {
                branch "dev"
            }
            steps {
                echo 'Publishing Development ...'
                sh 'npm run publish:development'
            }
        }
        stage('Publish Release') {
            when {
                branch "master"
            }
            steps {
                echo 'Publishing Release ...'
                sh 'npm run publish:release'
            }
        }
    }
    post {
        always {
            junit 'coverage/cobertura-coverage.xml'
        }
    }
}