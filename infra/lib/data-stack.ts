import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as rds from "aws-cdk-lib/aws-rds";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";
import { StageConfig } from "./config";

export interface DataStackProps extends cdk.StackProps {
  readonly config: StageConfig;
  readonly vpc: ec2.IVpc;
  readonly databaseSecurityGroup: ec2.ISecurityGroup;
}

/**
 * RDS とアプリケーションシークレット。
 *
 * DATABASE_URL は接続情報を URL に組み立てる必要があるが、Secrets Manager の
 * 自動生成パスワードを URL に埋める都合上、記号を除外して生成している
 * (コンテナ側の docker-entrypoint.sh で URL エンコードせずに連結するため)。
 */
export class DataStack extends cdk.Stack {
  public readonly database: rds.DatabaseInstance;
  public readonly databaseSecret: secretsmanager.ISecret;
  public readonly jwtSecret: secretsmanager.Secret;
  public readonly jwtRefreshSecret: secretsmanager.Secret;

  constructor(scope: Construct, id: string, props: DataStackProps) {
    super(scope, id, props);

    const { config } = props;

    // URL に埋め込んでも壊れない文字だけでパスワードを生成する
    const excludeCharacters = " %+~`#$&*()|[]{}:;<>?!'/@\"\\,^-=";

    this.database = new rds.DatabaseInstance(this, "Database", {
      engine: rds.DatabaseInstanceEngine.mysql({
        // マイナーバージョンは自動アップグレードに任せるため major のみ指定する。
        // cdk synth が "EngineVersion: '8.0' is not one of [...]" と警告するが、
        // RDS はメジャーのみの指定を受け付けるため無視してよい。
        version: rds.MysqlEngineVersion.VER_8_0,
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.BURSTABLE4_GRAVITON,
        config.database.instanceSize
      ),
      vpc: props.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      securityGroups: [props.databaseSecurityGroup],
      credentials: rds.Credentials.fromGeneratedSecret("admin", {
        excludeCharacters,
      }),
      databaseName: config.database.databaseName,
      allocatedStorage: config.database.allocatedStorageGb,
      storageType: rds.StorageType.GP3,
      storageEncrypted: true,
      multiAz: false,
      publiclyAccessible: false,
      autoMinorVersionUpgrade: true,
      allowMajorVersionUpgrade: false,
      backupRetention: cdk.Duration.days(config.database.backupRetentionDays),
      deleteAutomatedBackups: config.stageName !== "prod",
      deletionProtection: config.database.deletionProtection,
      removalPolicy: config.database.removalPolicy,
      // 個人利用ではコストに見合わないため無効
      enablePerformanceInsights: false,
    });

    if (!this.database.secret) {
      throw new Error("Database secret was not generated");
    }
    this.databaseSecret = this.database.secret;

    this.jwtSecret = new secretsmanager.Secret(this, "JwtSecret", {
      description: "JWT access token signing key",
      generateSecretString: {
        passwordLength: 64,
        excludePunctuation: true,
      },
    });

    this.jwtRefreshSecret = new secretsmanager.Secret(this, "JwtRefreshSecret", {
      description: "JWT refresh token signing key",
      generateSecretString: {
        passwordLength: 64,
        excludePunctuation: true,
      },
    });

    new cdk.CfnOutput(this, "DatabaseEndpoint", {
      value: this.database.instanceEndpoint.hostname,
    });
    new cdk.CfnOutput(this, "DatabaseSecretName", {
      value: this.databaseSecret.secretName,
    });
  }
}
