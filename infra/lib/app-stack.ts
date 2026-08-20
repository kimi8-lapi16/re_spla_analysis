import * as cdk from "aws-cdk-lib";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecsPatterns from "aws-cdk-lib/aws-ecs-patterns";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as logs from "aws-cdk-lib/aws-logs";
import * as rds from "aws-cdk-lib/aws-rds";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";
import { StageConfig } from "./config";
import { backendContainerOptions } from "./constructs/backend-container";

export interface AppStackProps extends cdk.StackProps {
  readonly config: StageConfig;
  readonly imageTag: string;
  readonly vpc: ec2.IVpc;
  readonly albSecurityGroup: ec2.ISecurityGroup;
  readonly serviceSecurityGroup: ec2.ISecurityGroup;
  readonly repository: ecr.IRepository;
  readonly database: rds.DatabaseInstance;
  readonly databaseSecret: secretsmanager.ISecret;
  readonly jwtSecret: secretsmanager.ISecret;
  readonly jwtRefreshSecret: secretsmanager.ISecret;
}

/**
 * API 実行環境 (ECS Fargate + ALB)。
 *
 * ECS クラスタはバッチからも使うため公開している。
 */
export class AppStack extends cdk.Stack {
  public readonly cluster: ecs.Cluster;
  public readonly loadBalancerDnsName: string;

  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props);

    const { config } = props;

    this.cluster = new ecs.Cluster(this, "Cluster", {
      vpc: props.vpc,
      // Container Insights は個人利用ではコストに見合わない
      containerInsightsV2: ecs.ContainerInsights.DISABLED,
    });

    const logGroup = new logs.LogGroup(this, "ApiLogGroup", {
      retention: config.logRetention,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const taskDefinition = new ecs.FargateTaskDefinition(this, "ApiTaskDef", {
      family: `re-spla-analysis-${config.stageName}-api`,
      cpu: config.api.cpu,
      memoryLimitMiB: config.api.memoryLimitMiB,
      runtimePlatform: {
        // イメージのビルド環境と揃える。ARM64 にする場合は
        // docker build --platform linux/arm64 でビルドすること。
        cpuArchitecture: ecs.CpuArchitecture.X86_64,
        operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
      },
    });

    taskDefinition.addContainer("api", {
      ...backendContainerOptions({
        repository: props.repository,
        imageTag: props.imageTag,
        logGroup,
        streamPrefix: "api",
        database: props.database,
        databaseSecret: props.databaseSecret,
        databaseName: config.database.databaseName,
        jwtSecret: props.jwtSecret,
        jwtRefreshSecret: props.jwtRefreshSecret,
        frontendUrl: config.api.frontendUrl,
        containerPort: config.api.containerPort,
      }),
      portMappings: [{ containerPort: config.api.containerPort }],
    });

    const certificate = config.api.certificateArn
      ? acm.Certificate.fromCertificateArn(this, "ApiCertificate", config.api.certificateArn)
      : undefined;

    // ALB は明示的に作る。L3 パターンに作らせると ALB の SG が AppStack 側に
    // でき、API タスク SG (NetworkStack) への許可ルールが循環参照になる。
    const loadBalancer = new elbv2.ApplicationLoadBalancer(this, "ApiAlb", {
      vpc: props.vpc,
      internetFacing: true,
      securityGroup: props.albSecurityGroup,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
    });

    const service = new ecsPatterns.ApplicationLoadBalancedFargateService(this, "ApiService", {
      cluster: this.cluster,
      taskDefinition,
      desiredCount: config.api.desiredCount,
      loadBalancer,
      // NAT Gateway を使わないため、タスク自体を public subnet に置く
      assignPublicIp: true,
      taskSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      securityGroups: [props.serviceSecurityGroup],
      certificate,
      listenerPort: certificate ? 443 : 80,
      redirectHTTP: certificate !== undefined,
      healthCheckGracePeriod: cdk.Duration.seconds(60),
      minHealthyPercent: 100,
      maxHealthyPercent: 200,
      circuitBreaker: { rollback: true },
    });

    service.targetGroup.configureHealthCheck({
      path: "/health",
      healthyHttpCodes: "200",
      interval: cdk.Duration.seconds(30),
      timeout: cdk.Duration.seconds(5),
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 3,
    });

    // タスク入れ替え時に古いタスクの接続を長時間保持しない
    service.targetGroup.setAttribute("deregistration_delay.timeout_seconds", "30");

    this.loadBalancerDnsName = loadBalancer.loadBalancerDnsName;

    new cdk.CfnOutput(this, "ApiUrl", {
      value: `${certificate ? "https" : "http"}://${this.loadBalancerDnsName}`,
    });
    new cdk.CfnOutput(this, "ClusterName", { value: this.cluster.clusterName });
  }
}
