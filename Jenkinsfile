pipeline {
    agent {
        label "node"
    }

    stages {
        stage('Doc') {
            steps {
                git 'https://devcentral.nasqueron.org/source/infra-www.git'

                sh '''
                npm install
                npm run build
                cd dist
                rm -rf _external
                tar czf ../www-nasqueron-infra.tar.gz *
                '''
            }
            post {
                success {
                    archiveArtifacts artifacts: 'www-nasqueron-infra.tar.gz'
                }
            }
        }

        stage('Publish') {
            steps {
                sshPublisher(
                    failOnError: true,
                    publishers: [
                        sshPublisherDesc(
                            configName: 'ysul-deploy',
                            transfers: [
                                sshTransfer(
                                    sourceFiles: 'www-nasqueron-infra.tar.gz',
                                    remoteDirectory: 'workspace',
                                    cleanRemote: true,
                                    execCommand: 'tar xzvf workspace/www-nasqueron-infra.tar.gz -C /var/wwwroot/nasqueron.org/infra/'
                                )
                            ]
                        )
                    ]
                )
            }
        }
    }
}

