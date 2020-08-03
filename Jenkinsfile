pipeline {
    agent any
    triggers {
        githubPush()
    }
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
        stage('Quality') {
            steps {
                echo 'Checking code quality ...'
                sh 'npm run lint'
            }
        }
        stage('Documentation') {
            steps {
                echo 'Building Documentation..'
                sh 'npm run build:typedoc'
            }
        }
        stage('Test') {
            steps {
                echo 'Testing ...'
                sh 'npm run test:jenkins'
            }
        }
        stage('Publish') {
            parallel {
                stage('Publish Development') {
                    when {
                        branch "dev"
                    }
                    steps {
                        echo 'Publishing Development ...'
                        sh 'npm run publish:development'
                        sshagent(['git-openhps-ssh']) {
                            sh 'git push origin HEAD:dev'
                        }
                    }
                }
                stage('Publish Release') {
                    when {
                        branch "master"
                    }
                    steps {
                        echo 'Publishing Release ...'
                        sh 'npm run publish:release'
                        sh 'git push origin HEAD:master'
                        sshagent(['git-openhps-ssh']) {
                            sh "git push origin master"
                        }
                    }
                }
            }
        }
    }
    post {
        always {
            junit 'artifacts/test/xunit.xml'
            cobertura coberturaReportFile: 'artifacts/coverage/cobertura-coverage.xml'
            publishHTML (target: [
                allowMissing: false,
                alwaysLinkToLastBuild: false,
                keepAll: true,
                reportDir: 'docs',
                reportFiles: '*.*',
                reportName: "Documentatin"
            ])
            deleteDir()
        }
        success {
            archiveArtifacts artifacts: 'dist/openhps-core.js', fingerprint: true
            archiveArtifacts artifacts: 'dist/openhps-core.min.js', fingerprint: true
        }
    }
}