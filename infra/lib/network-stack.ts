import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";
import { StageConfig } from "./config";

export interface NetworkStackProps extends cdk.StackProps {
  readonly config: StageConfig;
}

/**
 * VPC とセキュリティグループ。
 *
 * NAT Gateway (約 $45/月) を避けるため、ECS タスクは public subnet に
 * パブリック IP 付きで置き、ECR / CloudWatch Logs / Secrets Manager へは
 * Internet Gateway 経由で到達する。DB だけを isolated subnet に隔離し、
 * 到達制御はセキュリティグループで行う。
 *
 * private subnet + VPC エンドポイント構成は interface 型を4つ張ると
 * 約 $28/月かかり、個人規模では NAT を避ける旨みが薄いため採用していない。
 */
export class NetworkStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;
  public readonly albSecurityGroup: ec2.SecurityGroup;
  public readonly serviceSecurityGroup: ec2.SecurityGroup;
  public readonly batchSecurityGroup: ec2.SecurityGroup;
  public readonly databaseSecurityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props: NetworkStackProps) {
    super(scope, id, props);

    this.vpc = new ec2.Vpc(this, "Vpc", {
      maxAzs: props.config.vpc.maxAzs,
      natGateways: 0,
      subnetConfiguration: [
        {
          name: "public",
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
        {
          name: "isolated",
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          cidrMask: 24,
        },
      ],
      restrictDefaultSecurityGroup: true,
    });

    // ALB の SG も AppStack ではなくここで作る。
    // AppStack 側で作ると「ALB SG (App) -> API SG (Network)」の許可ルールが
    // クロススタック参照になり、App -> Network の依存と合わせて循環参照になる。
    this.albSecurityGroup = new ec2.SecurityGroup(this, "AlbSg", {
      vpc: this.vpc,
      description: "Public ALB for the API",
      allowAllOutbound: true,
    });
    this.albSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      "HTTP from anywhere"
    );
    this.albSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      "HTTPS from anywhere"
    );

    this.serviceSecurityGroup = new ec2.SecurityGroup(this, "ServiceSg", {
      vpc: this.vpc,
      description: "ECS service (API) tasks",
      allowAllOutbound: true,
    });

    this.batchSecurityGroup = new ec2.SecurityGroup(this, "BatchSg", {
      vpc: this.vpc,
      description: "ECS batch tasks",
      allowAllOutbound: true,
    });

    this.databaseSecurityGroup = new ec2.SecurityGroup(this, "DatabaseSg", {
      vpc: this.vpc,
      description: "RDS MySQL",
      allowAllOutbound: false,
    });

    // DB へのインバウンドは API タスクとバッチタスクからのみ。
    // ALB -> API のインバウンドは AppStack 側 (ALB 作成時) で追加される。
    this.databaseSecurityGroup.addIngressRule(
      this.serviceSecurityGroup,
      ec2.Port.tcp(3306),
      "API tasks"
    );
    this.databaseSecurityGroup.addIngressRule(
      this.batchSecurityGroup,
      ec2.Port.tcp(3306),
      "Batch tasks"
    );
  }
}
