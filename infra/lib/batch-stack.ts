import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import * as logs from "aws-cdk-lib/aws-logs";
import * as rds from "aws-cdk-lib/aws-rds";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as sns from "aws-cdk-lib/aws-sns";
import * as subscriptions from "aws-cdk-lib/aws-sns-subscriptions";
import { Construct } from "constructs";
import { StageConfig } from "./config";
import { backendContainerOptions } from "./constructs/backend-container";

export interface BatchStackProps extends cdk.StackProps {
  readonly config: StageConfig;
  readonly imageTag: string;
  readonly vpc: ec2.IVpc;
  readonly cluster: ecs.ICluster;
  readonly batchSecurityGroup: ec2.ISecurityGroup;
  readonly repository: ecr.IRepository;
  readonly database: rds.DatabaseInstance;
  readonly databaseSecret: secretsmanager.ISecret;
  readonly jwtSecret: secretsmanager.ISecret;
  readonly jwtRefreshSecret: secretsmanager.ISecret;
}

/**
 * 日次バッチ (EventBridge -> ECS RunTask)。
 *
 * API と同じイメージを使い、command override で起動するジョブを切り替える。
 * このタスク定義は以下の用途を兼ねる:
 *   - 日次分析ジョブ   : node dist/batch/main.js daily-report
 *   - 疎通確認         : node dist/batch/main.js smoke
 *   - マイグレーション : pnpm prisma migrate deploy
 */
export class BatchStack extends cdk.Stack {
  public readonly taskDefinition: ecs.FargateTaskDefinition;
  public readonly failureTopic: sns.Topic;

  constructor(scope: Construct, id: string, props: BatchStackProps) {
    super(scope, id, props);

    const { config } = props;
    const family = `re-spla-analysis-${config.stageName}-batch`;

    const logGroup = new logs.LogGroup(this, "BatchLogGroup", {
      retention: config.logRetention,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.taskDefinition = new ecs.FargateTaskDefinition(this, "BatchTaskDef", {
      family,
      cpu: config.batch.cpu,
      memoryLimitMiB: config.batch.memoryLimitMiB,
      runtimePlatform: {
        cpuArchitecture: ecs.CpuArchitecture.X86_64,
        operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
      },
    });

    this.taskDefinition.addContainer("batch", {
      ...backendContainerOptions({
        repository: props.repository,
        imageTag: props.imageTag,
        logGroup,
        streamPrefix: "batch",
        database: props.database,
        databaseSecret: props.databaseSecret,
        databaseName: config.database.databaseName,
        jwtSecret: props.jwtSecret,
        jwtRefreshSecret: props.jwtRefreshSecret,
        frontendUrl: config.api.frontendUrl,
        command: config.batch.command,
      }),
    });

    new events.Rule(this, "DailyReportRule", {
      description: "Generate analysis summaries for every user (daily)",
      // 実ジョブ (daily-report) 実装前は false。config で切り替える。
      enabled: config.batch.ruleEnabled,
      schedule: events.Schedule.expression(config.batch.scheduleExpression),
      targets: [
        new targets.EcsTask({
          cluster: props.cluster,
          taskDefinition: this.taskDefinition,
          taskCount: 1,
          assignPublicIp: true,
          subnetSelection: { subnetType: ec2.SubnetType.PUBLIC },
          securityGroups: [props.batchSecurityGroup],
          containerOverrides: [
            {
              containerName: "batch",
              command: config.batch.command,
            },
          ],
          // 失敗はリトライせず通知する (冪等性は upsert で担保するが、
          // 同じ原因で連続失敗しても通知が増えるだけのため)
          retryAttempts: 0,
        }),
      ],
    });

    this.failureTopic = new sns.Topic(this, "BatchFailureTopic", {
      displayName: `re-spla-analysis ${config.stageName} batch failures`,
    });

    if (config.alertEmail) {
      this.failureTopic.addSubscription(new subscriptions.EmailSubscription(config.alertEmail));
    }

    // バッチタスクが 0 以外の終了コードで停止したら通知する。
    // EventBridge が RunTask するときの group は既定で `family:<family>`。
    new events.Rule(this, "BatchFailureRule", {
      description: "Notify when a batch task exits with a non-zero code",
      eventPattern: {
        source: ["aws.ecs"],
        detailType: ["ECS Task State Change"],
        detail: {
          clusterArn: [props.cluster.clusterArn],
          lastStatus: ["STOPPED"],
          group: [`family:${family}`],
          containers: {
            exitCode: [{ "anything-but": [0] }],
          },
        },
      },
      targets: [
        new targets.SnsTopic(this.failureTopic, {
          message: events.RuleTargetInput.fromText(
            `Batch task failed: ${events.EventField.fromPath("$.detail.taskArn")} (stoppedReason: ${events.EventField.fromPath("$.detail.stoppedReason")})`
          ),
        }),
      ],
    });

    new cdk.CfnOutput(this, "BatchTaskDefinitionFamily", { value: family });
  }
}
