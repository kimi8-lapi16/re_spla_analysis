import * as ecr from "aws-cdk-lib/aws-ecr";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as logs from "aws-cdk-lib/aws-logs";
import * as rds from "aws-cdk-lib/aws-rds";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";

export interface BackendContainerOptionsProps {
  readonly repository: ecr.IRepository;
  readonly imageTag: string;
  readonly logGroup: logs.ILogGroup;
  readonly streamPrefix: string;
  readonly database: rds.DatabaseInstance;
  readonly databaseSecret: secretsmanager.ISecret;
  readonly databaseName: string;
  readonly jwtSecret: secretsmanager.ISecret;
  readonly jwtRefreshSecret: secretsmanager.ISecret;
  readonly frontendUrl: string;
  readonly containerPort?: number;
  readonly command?: string[];
}

/**
 * API とバッチで同一イメージ・同一の環境変数を使うため、コンテナ定義を共通化する。
 *
 * DATABASE_URL をそのまま渡さず DB_* に分けているのは、Secrets Manager が返す
 * のがユーザー名とパスワードの個別値であり、接続 URL を CloudFormation 側で
 * 組み立てるとパスワードがテンプレートに露出しうるため。
 * URL への組み立てはコンテナの docker-entrypoint.sh が行う。
 */
export function backendContainerOptions(
  props: BackendContainerOptionsProps
): ecs.ContainerDefinitionOptions {
  return {
    image: ecs.ContainerImage.fromEcrRepository(props.repository, props.imageTag),
    command: props.command,
    logging: ecs.LogDrivers.awsLogs({
      logGroup: props.logGroup,
      streamPrefix: props.streamPrefix,
    }),
    environment: {
      NODE_ENV: "production",
      PORT: String(props.containerPort ?? 3000),
      DB_HOST: props.database.instanceEndpoint.hostname,
      DB_PORT: String(props.database.instanceEndpoint.port),
      DB_NAME: props.databaseName,
      FRONTEND_URL: props.frontendUrl,
    },
    secrets: {
      DB_USER: ecs.Secret.fromSecretsManager(props.databaseSecret, "username"),
      DB_PASSWORD: ecs.Secret.fromSecretsManager(props.databaseSecret, "password"),
      JWT_SECRET: ecs.Secret.fromSecretsManager(props.jwtSecret),
      JWT_REFRESH_SECRET: ecs.Secret.fromSecretsManager(props.jwtRefreshSecret),
    },
  };
}
