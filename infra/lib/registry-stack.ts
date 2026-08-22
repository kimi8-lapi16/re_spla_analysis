import * as cdk from "aws-cdk-lib";
import * as ecr from "aws-cdk-lib/aws-ecr";
import { Construct } from "constructs";
import { StageConfig } from "./config";

export interface RegistryStackProps extends cdk.StackProps {
  readonly config: StageConfig;
}

/**
 * ECR リポジトリ。
 *
 * ECS サービスは「イメージが既に push されている」ことを前提に起動するため、
 * AppStack とは分けて先にデプロイできるようにしている。
 * デプロイ順: Network -> Registry -> (イメージ push) -> Data -> App -> Batch -> Frontend
 */
export class RegistryStack extends cdk.Stack {
  public readonly repository: ecr.Repository;

  constructor(scope: Construct, id: string, props: RegistryStackProps) {
    super(scope, id, props);

    const destroyable = props.config.registry.removalPolicy === cdk.RemovalPolicy.DESTROY;

    this.repository = new ecr.Repository(this, "BackendRepository", {
      repositoryName: `re-spla-analysis-backend-${props.config.stageName}`,
      imageScanOnPush: true,
      imageTagMutability: ecr.TagMutability.MUTABLE,
      removalPolicy: props.config.registry.removalPolicy,
      // イメージが残っているリポジトリは削除できず cdk destroy が失敗するため、
      // 使い捨て前提のステージでは中身ごと消す
      emptyOnDelete: destroyable,
      lifecycleRules: [
        {
          description: "Keep only the latest 10 images",
          maxImageCount: 10,
        },
      ],
    });

    new cdk.CfnOutput(this, "RepositoryUri", {
      value: this.repository.repositoryUri,
    });
  }
}
