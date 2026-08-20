import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as logs from "aws-cdk-lib/aws-logs";

export type StageName = "dev" | "prod";

export interface StageConfig {
  readonly stageName: StageName;
  readonly region: string;
  readonly vpc: {
    /** NAT Gateway を使わない構成なので AZ を増やしてもコストは増えない */
    readonly maxAzs: number;
  };
  readonly database: {
    readonly instanceSize: ec2.InstanceSize;
    readonly allocatedStorageGb: number;
    readonly backupRetentionDays: number;
    readonly deletionProtection: boolean;
    readonly removalPolicy: cdk.RemovalPolicy;
    readonly databaseName: string;
  };
  readonly api: {
    readonly cpu: number;
    readonly memoryLimitMiB: number;
    readonly desiredCount: number;
    readonly containerPort: number;
    /**
     * CORS 許可オリジン。CloudFront のドメインは AppStack から参照すると
     * 循環参照になるため、初回デプロイ後に確定した値をここに書く。
     */
    readonly frontendUrl: string;
    /** ACM 証明書 (ap-northeast-1) がある場合のみ HTTPS リスナーを作る */
    readonly certificateArn?: string;
  };
  readonly batch: {
    /**
     * 実際の分析ジョブ (daily-report) を実装するまでは false。
     * 未実装のジョブを毎日叩いて失敗通知が飛び続けるのを避けるため。
     */
    readonly ruleEnabled: boolean;
    /** EventBridge の cron は UTC 固定。JST 5:00 = UTC 20:00 */
    readonly scheduleExpression: string;
    readonly command: string[];
    readonly cpu: number;
    readonly memoryLimitMiB: number;
  };
  readonly frontend: {
    /**
     * true にすると CloudFront の /api/* を ALB に流す (同一オリジン構成)。
     * バックエンド側に app.setGlobalPrefix('api') が必要なので既定は false。
     */
    readonly proxyApiThroughCloudFront: boolean;
    readonly removalPolicy: cdk.RemovalPolicy;
    readonly autoDeleteObjects: boolean;
  };
  readonly logRetention: logs.RetentionDays;
  /** 指定するとバッチ失敗時に SNS からメールが飛ぶ */
  readonly alertEmail?: string;
}

const dev: StageConfig = {
  stageName: "dev",
  region: "ap-northeast-1",
  vpc: { maxAzs: 2 },
  database: {
    instanceSize: ec2.InstanceSize.MICRO,
    allocatedStorageGb: 20,
    backupRetentionDays: 1,
    deletionProtection: false,
    removalPolicy: cdk.RemovalPolicy.DESTROY,
    databaseName: "re_spla_analysis_db",
  },
  api: {
    cpu: 256,
    memoryLimitMiB: 512,
    desiredCount: 1,
    containerPort: 3000,
    frontendUrl: "http://localhost:5173",
  },
  batch: {
    ruleEnabled: false,
    scheduleExpression: "cron(0 20 * * ? *)",
    command: ["node", "dist/batch/main.js", "daily-report"],
    cpu: 256,
    memoryLimitMiB: 512,
  },
  frontend: {
    proxyApiThroughCloudFront: false,
    removalPolicy: cdk.RemovalPolicy.DESTROY,
    autoDeleteObjects: true,
  },
  logRetention: logs.RetentionDays.ONE_WEEK,
};

const prod: StageConfig = {
  ...dev,
  stageName: "prod",
  database: {
    ...dev.database,
    backupRetentionDays: 7,
    deletionProtection: true,
    removalPolicy: cdk.RemovalPolicy.RETAIN,
  },
  frontend: {
    proxyApiThroughCloudFront: false,
    removalPolicy: cdk.RemovalPolicy.RETAIN,
    autoDeleteObjects: false,
  },
  logRetention: logs.RetentionDays.TWO_WEEKS,
};

const configs: Record<StageName, StageConfig> = { dev, prod };

export function isStageName(value: string): value is StageName {
  return value === "dev" || value === "prod";
}

export function getStageConfig(stage: string): StageConfig {
  if (!isStageName(stage)) {
    throw new Error(`Unknown stage: ${stage}. Use -c stage=dev or -c stage=prod.`);
  }
  return configs[stage];
}
