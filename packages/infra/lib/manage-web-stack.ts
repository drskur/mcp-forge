import {
  aws_lambda,
  CfnOutput, Duration,
  RemovalPolicy,
  Stack,
  StackProps,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  Architecture,
  Code,
  LayerVersion,
  Runtime,
} from "aws-cdk-lib/aws-lambda";
import { HttpApi, HttpMethod } from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { RestApi, LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import { NagSuppressions } from "cdk-nag";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { GoFunction } from "@aws-cdk/aws-lambda-go-alpha";
import { PolicyStatement, Effect } from "aws-cdk-lib/aws-iam";

export class ManageWebStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // DynamoDB One Table 생성
    const mainTable = new Table(this, "MainTable", {
      tableName: "ManageWebMainTable",
      partitionKey: {
        name: "PK",
        type: AttributeType.STRING,
      },
      sortKey: {
        name: "SK",
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY, // 개발 환경용, 프로덕션에서는 RETAIN 사용
      pointInTimeRecoverySpecification: {
        pointInTimeRecoveryEnabled: true,
        recoveryPeriodInDays: 7,
      },
    });

    // GSI: Entity 타입별 생성일 기준 정렬 조회용
    mainTable.addGlobalSecondaryIndex({
      indexName: "EntityByCreatedAt",
      partitionKey: {
        name: "EntityType",
        type: AttributeType.STRING,
      },
      sortKey: {
        name: "CreatedAtId",
        type: AttributeType.STRING,
      },
    });

    const webAdapterLayer = LayerVersion.fromLayerVersionArn(
      this,
      "WebAdapterLayer",
      `arn:aws:lambda:${this.region}:753240598075:layer:LambdaAdapterLayerX86:25`
    );
    const manageWebFunction = new aws_lambda.Function(
      this,
      "ManageWebFunction",
      {
        code: Code.fromAsset("../manage-web", {
          exclude: ["node_modules", ".git", "*.log", ".env*"],
          bundling: {
            local: {
              tryBundle(outputDir: string) {
                try {
                  const execSync = require("child_process").execSync;
                  // 빌드 실행
                  execSync("npm run build", {
                    cwd: "../manage-web",
                    stdio: "inherit",
                  });
                  // 필요한 파일들 복사
                  execSync(`cp -r ../manage-web/.output/* ${outputDir}/`, {
                    stdio: "inherit",
                  });
                  execSync(`cp ../manage-web/run.sh ${outputDir}/`, {
                    stdio: "inherit",
                  });
                  return true;
                } catch (err) {
                  console.error("Local bundling failed:", err);
                  return false;
                }
              },
            },
            // Docker fallback
            image: Runtime.NODEJS_22_X.bundlingImage,
            command: [
              "bash",
              "-c",
              [
                "cd /asset-input",
                "npm ci --production",
                "npm run build",
                "cp -r .output/* /asset-output/",
                "cp run.sh /asset-output/",
              ].join(" && "),
            ],
            user: "root",
          },
        }),
        handler: "run.sh",
        runtime: Runtime.NODEJS_22_X,
        memorySize: 2048,
        layers: [webAdapterLayer],
        architecture: Architecture.X86_64,
        environment: {
          AWS_LWA_PORT: "3000",
          AWS_LAMBDA_EXEC_WRAPPER: "/opt/bootstrap",
          AWS_LWA_ENABLE_COMPRESSION: "true",
          TABLE_NAME: mainTable.tableName,
        },
        logRetention: RetentionDays.ONE_WEEK,
      }
    );

    // Lambda 함수에 DynamoDB 읽기/쓰기 권한 부여
    mainTable.grantReadWriteData(manageWebFunction);

    const mcpServerFunction = new GoFunction(this, "McpServerFunction", {
      entry: "../mcp-server/main.go",
      architecture: Architecture.X86_64,
      runtime: Runtime.PROVIDED_AL2023,
      layers: [webAdapterLayer],
      logRetention: RetentionDays.ONE_WEEK,
      memorySize: 1024,
      timeout: Duration.seconds(10),
      environment: {
        AWS_LWA_PORT: "8080",
        AWS_LWA_ENABLE_COMPRESSION: "true",
        TABLE_NAME: mainTable.tableName,
      },
    });

    // Lambda 함수에 DynamoDB 읽기/쓰기 권한 부여
    mainTable.grantReadWriteData(mcpServerFunction);

    // MCP Server Function에 Lambda invoke 권한 추가
    mcpServerFunction.addToRolePolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        "lambda:InvokeFunction",
        "lambda:InvokeAsync"
      ],
      resources: ["*"] // 모든 Lambda 함수 호출 허용
    }));

    // MCP Server Function에 Step Functions invoke 권한 추가
    mcpServerFunction.addToRolePolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        "states:StartExecution",
        "states:StartSyncExecution",
        "states:StopExecution",
        "states:DescribeExecution",
        "states:GetExecutionHistory"
      ],
      resources: ["*"] // 모든 Step Functions 실행 허용
    }));

    // MCP Server용 REST API 생성
    const mcpRestApi = new RestApi(this, "McpServerRestApi", {
      restApiName: "mcp-server-api",
      description: "REST API for MCP Server",
      deployOptions: {
        stageName: "prod",
      },
    });

    // MCP Server Lambda 통합
    const mcpLambdaIntegration = new LambdaIntegration(mcpServerFunction);

    // MCP Server REST API 라우트 설정 - root에 전체 proxy 설정
    const mcpProxyResource = mcpRestApi.root.addResource("{proxy+}");

    // 모든 메서드에 대해 Lambda 통합 추가
    mcpRestApi.root.addMethod("ANY", mcpLambdaIntegration);
    mcpProxyResource.addMethod("ANY", mcpLambdaIntegration);

    // HTTP API 생성
    const httpApi = new HttpApi(this, "ManageWebHttpApi", {
      apiName: "manage-web-api",
      description: "HTTP API for Manage Web application",
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
      integration: lambdaIntegration,
    });

    // 루트 경로 추가
    httpApi.addRoutes({
      path: "/",
      methods: [HttpMethod.ANY],
      integration: lambdaIntegration,
    });

    // API 엔드포인트 출력
    new CfnOutput(this, "ApiEndpoint", {
      value: httpApi.url!,
      description: "HTTP API endpoint URL",
    });

    // DynamoDB 테이블 이름 출력
    new CfnOutput(this, "DynamoDBTableName", {
      value: mainTable.tableName,
      description: "DynamoDB table name for one table design",
    });

    // MCP Server REST API 엔드포인트 출력
    new CfnOutput(this, "McpServerApiEndpoint", {
      value: mcpRestApi.url,
      description: "MCP Server REST API endpoint URL",
    });

    // CDK Nag Suppressions
    NagSuppressions.addResourceSuppressions(
      manageWebFunction,
      [
        {
          id: "AwsSolutions-IAM4",
          reason:
            "Lambda functions use AWS managed policy AWSLambdaBasicExecutionRole by default for CloudWatch Logs",
        },
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
          reason:
            "Lambda function needs wildcard permissions to access DynamoDB GSI indexes for querying servers by creation date",
        },
      ]
    );

    // HTTP API Nag Suppressions
    NagSuppressions.addResourceSuppressions(
      httpApi,
      [
        {
          id: "AwsSolutions-APIG4",
          reason:
            "Authorization will be implemented later with Cognito. This is a development phase API.",
        },
        {
          id: "AwsSolutions-APIG1",
          reason: "Access logging will be enabled in production phase",
        },
      ],
      true
    );

    // MCP Server Function IAM Nag Suppressions
    NagSuppressions.addResourceSuppressions(
      mcpServerFunction,
      [
        {
          id: "AwsSolutions-IAM4",
          reason:
            "Lambda functions use AWS managed policy AWSLambdaBasicExecutionRole by default for CloudWatch Logs",
        },
      ],
      true
    );

    // MCP Server Function DynamoDB GSI 접근을 위한 wildcard 권한 Suppression
    NagSuppressions.addResourceSuppressionsByPath(
      this,
      "/ManageWebStack/McpServerFunction/ServiceRole/DefaultPolicy/Resource",
      [
        {
          id: "AwsSolutions-IAM5",
          reason:
            "Lambda function needs wildcard permissions to access DynamoDB GSI indexes, invoke any Lambda function, and execute any Step Functions state machine",
        },
      ]
    );

    // MCP Server REST API Nag Suppressions
    NagSuppressions.addResourceSuppressions(
      mcpRestApi,
      [
        {
          id: "AwsSolutions-APIG2",
          reason:
            "Request validation will be implemented at the application level for flexibility",
        },
        {
          id: "AwsSolutions-APIG4",
          reason:
            "Authorization will be implemented later with Cognito. This is a development phase API.",
        },
        {
          id: "AwsSolutions-COG4",
          reason:
            "Cognito user pool authorizer will be added in production phase",
        },
        {
          id: "AwsSolutions-APIG3",
          reason: "WAF will be added in production phase for DDoS protection",
        },
        {
          id: "AwsSolutions-APIG1",
          reason: "Access logging will be enabled in production phase",
        },
        {
          id: "AwsSolutions-APIG6",
          reason: "CloudWatch logging will be enabled in production phase",
        },
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
          reason:
            "LogRetention Lambda is created by CDK for CloudWatch Logs retention management",
        },
      ]
    );

    NagSuppressions.addResourceSuppressionsByPath(
      this,
      "/ManageWebStack/LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8a/ServiceRole/DefaultPolicy/Resource",
      [
        {
          id: "AwsSolutions-IAM5",
          reason:
            "LogRetention Lambda needs wildcard permissions for CloudWatch Logs management",
        },
      ]
    );
  }
}
