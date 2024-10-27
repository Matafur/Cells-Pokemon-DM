#!groovy

@Library("workflowlibs") _

pipeline {

    agent none

    options {
        ansiColor colorMapName: 'XTerm'
        buildDiscarder(logRotator(
        numToKeepStr:
            env.BRANCH_NAME ==~ /master/ ? '10' :
            env.BRANCH_NAME ==~ /develop/ ? '5' :
            env.BRANCH_NAME ==~ /release\/.*/ ? '10' :
            env.BRANCH_NAME ==~ /feature\/.|bugfix\/.|hotfix\/.|PR-./ ? '3' : '1',
        ))
        disableConcurrentBuilds(abortPrevious: true)
        skipDefaultCheckout()        
    }

    stages {
        stage('Checkout Global Library') {
            steps {
                script{
                    globalBootstrap {
                        libraryName   = "cellsworkflowlibs"
                        libraryBranch = "master"

                        entrypointParams = [
                            type                  : "cellsLitComponent",
                            lint                  :  true,
                            sonarQube             :  true,
                            test                  :  true,
                            publish               :  true,
                            deploySecGCP          :  true
                        ]
                    }
                }
            }
        }
    }
}
