import {aws_lambda, CfnOutput, Stack, StackProps, RemovalPolicy} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {Architecture, Code, LayerVersion, Runtime} from "aws-cdk-lib/aws-lambda";
import {HttpApi, HttpMethod} from "aws-cdk-lib/aws-apigatewayv2";
import {HttpLambdaIntegration} from "aws-cdk-lib/aws-apigatewayv2-integrations";
import {NagSuppressions} from "cdk-nag";
import {LogGroup, RetentionDays} from "aws-cdk-lib/aws-logs";
import {CfnStage} from "aws-cdk-lib/aws-apigatewayv2";
import {AttributeType, BillingMode, Table} from "aws-cdk-lib/aws-dynamodb";

export class ManageWebStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        // DynamoDB One Table 생성
        const mainTable = new Table(this, "MainTable", {
            tableName: "ManageWebMainTable",
            partitionKey: {
                name: "PK",
                type: AttributeType.STRING
            },
            sortKey: {
                name: "SK",
                type: AttributeType.STRING
            },
            billingMode: BillingMode.PAY_PER_REQUEST,
            removalPolicy: RemovalPolicy.DESTROY, // 개발 환경용, 프로덕션에서는 RETAIN 사용
            pointInTimeRecoverySpecification: {
                pointInTimeRecoveryEnabled: true,
                recoveryPeriodInDays: 7,
            }
        });

        // GSI: Entity 타입별 생성일 기준 정렬 조회용
        mainTable.addGlobalSecondaryIndex({
            indexName: "EntityByCreatedAt",
            partitionKey: {
                name: "EntityType",
                type: AttributeType.STRING
            },
            sortKey: {
                name: "CreatedAtId",
                type: AttributeType.STRING
            }
        });

        const webAdapterLayer = LayerVersion.fromLayerVersionArn(
            this,
            "WebAdapterLayer",
            `arn:aws:lambda:${this.region}:753240598075:layer:LambdaAdapterLayerX86:25`
        )
        const manageWebFunction = new aws_lambda.Function(this, "ManageWebFunction", {
            code: Code.fromAsset("../manage-web", {
                exclude: ["node_modules", ".git", "*.log", ".env*"],
                bundling: {
                    local: {
                        tryBundle(outputDir: string) {
                            try {
                                const execSync = require('child_process').execSync;
                                // 빌드 실행
                                execSync('npm run build', {
                                    cwd: '../manage-web',
                                    stdio: 'inherit'
                                });
                                // 필요한 파일들 복사
                                execSync(`cp -r ../manage-web/.output/* ${outputDir}/`, {stdio: 'inherit'});
                                execSync(`cp ../manage-web/run.sh ${outputDir}/`, {stdio: 'inherit'});
                                return true;
                            } catch (err) {
                                console.error('Local bundling failed:', err);
                                return false;
                            }
                        }
                    },
                    // Docker fallback
                    image: Runtime.NODEJS_22_X.bundlingImage,
                    command: [
                        'bash', '-c',
                        [
                            'cd /asset-input',
                            'npm ci --production',
                            'npm run build',
                            'cp -r .output/* /asset-output/',
                            'cp run.sh /asset-output/'
                        ].join(' && ')
                    ],
                    user: "root"
                }
            }),
            handler: "run.sh",
            runtime: Runtime.NODEJS_22_X,
            memorySize: 1024,
            layers: [webAdapterLayer],
            architecture: Architecture.X86_64,
            environment: {
                AWS_LWA_PORT: "3000",
                AWS_LAMBDA_EXEC_WRAPPER: "/opt/bootstrap",
                AWS_LWA_ENABLE_COMPRESSION: "true",
                TABLE_NAME: mainTable.tableName
            },
            logRetention: RetentionDays.ONE_MONTH,
        });

        // Lambda 함수에 DynamoDB 읽기/쓰기 권한 부여
        mainTable.grantReadWriteData(manageWebFunction);

        // API Gateway 액세스 로그용 CloudWatch 로그 그룹 생성
        const apiLogGroup = new LogGroup(this, "ManageWebApiLogGroup", {
            logGroupName: `/aws/apigateway/manage-web-api`,
            retention: RetentionDays.ONE_MONTH
        });

        // HTTP API 생성
        const httpApi = new HttpApi(this, "ManageWebHttpApi", {
            apiName: "manage-web-api",
            description: "HTTP API for Manage Web application"
        });

        // Lambda 통합 생성
        const lambdaIntegration = new HttpLambdaIntegration(
            "ManageWebIntegration",
            manageWebFunction
        );

        // 모든 경로와 메서드에 대해 라우트 추가
        httpApi.addRoutes({
            path: "/{proxy+}",
            methods: [HttpMethod.ANY],
            integration: lambdaIntegration
        });

        // 루트 경로 추가
        httpApi.addRoutes({
            path: "/",
            methods: [HttpMethod.ANY],
            integration: lambdaIntegration
        });

        // API Gateway 액세스 로깅 설정
        const defaultStage = httpApi.defaultStage?.node.defaultChild as CfnStage;
        if (defaultStage) {
            defaultStage.accessLogSettings = {
                destinationArn: apiLogGroup.logGroupArn,
                format: JSON.stringify({
                    requestId: "$context.requestId",
                    ip: "$context.identity.sourceIp",
                    requestTime: "$context.requestTime",
                    httpMethod: "$context.httpMethod",
                    routeKey: "$context.routeKey",
                    status: "$context.status",
                    protocol: "$context.protocol",
                    responseLength: "$context.responseLength",
                    error: "$context.error.message",
                    integrationError: "$context.integrationErrorMessage"
                })
            };
        }

        // API 엔드포인트 출력
        new CfnOutput(this, "ApiEndpoint", {
            value: httpApi.url!,
            description: "HTTP API endpoint URL"
        });

        // DynamoDB 테이블 이름 출력
        new CfnOutput(this, "DynamoDBTableName", {
            value: mainTable.tableName,
            description: "DynamoDB table name for one table design"
        });

        // CDK Nag Suppressions
        NagSuppressions.addResourceSuppressions(
            manageWebFunction,
            [
                {
                    id: "AwsSolutions-IAM4",
                    reason: "Lambda functions use AWS managed policy AWSLambdaBasicExecutionRole by default for CloudWatch Logs"
                }
            ],
            true
        );

        // DynamoDB GSI 접근을 위한 wildcard 권한 Suppression
        NagSuppressions.addResourceSuppressionsByPath(
            this,
            "/ManageWebStack/ManageWebFunction/ServiceRole/DefaultPolicy/Resource",
            [
                {
                    id: "AwsSolutions-IAM5",
                    reason: "Lambda function needs wildcard permissions to access DynamoDB GSI indexes for querying servers by creation date"
                }
            ]
        );

        // API Gateway 인증 관련 Nag Suppression
        NagSuppressions.addResourceSuppressions(
            httpApi,
            [
                {
                    id: "AwsSolutions-APIG4",
                    reason: "Authorization will be implemented later with Cognito. This is a development phase API."
                }
            ],
            true
        );

        // LogRetention Lambda 함수에 대한 Nag Suppressions
        NagSuppressions.addResourceSuppressionsByPath(
            this,
            "/ManageWebStack/LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8a/ServiceRole/Resource",
            [
                {
                    id: "AwsSolutions-IAM4",
                    reason: "LogRetention Lambda is created by CDK for CloudWatch Logs retention management"
                }
            ]
        );

        NagSuppressions.addResourceSuppressionsByPath(
            this,
            "/ManageWebStack/LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8a/ServiceRole/DefaultPolicy/Resource",
            [
                {
                    id: "AwsSolutions-IAM5",
                    reason: "LogRetention Lambda needs wildcard permissions for CloudWatch Logs management"
                }
            ]
        );
    }
}
