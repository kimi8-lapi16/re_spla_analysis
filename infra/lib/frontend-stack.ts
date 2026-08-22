import * as fs from "node:fs";
import * as path from "node:path";
import * as cdk from "aws-cdk-lib";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";
import { StageConfig } from "./config";

export interface FrontendStackProps extends cdk.StackProps {
  readonly config: StageConfig;
  /** config.frontend.proxyApiThroughCloudFront が true のときのみ渡す */
  readonly apiLoadBalancerDnsName?: string;
}

/**
 * フロントエンド配信 (S3 + CloudFront)。
 *
 * ビルド成果物 (apps/frontend/dist) が存在するときだけ BucketDeployment を作る。
 * インフラだけを synth / diff したいときにフロントのビルドを強制しないため。
 */
export class FrontendStack extends cdk.Stack {
  public readonly distributionDomainName: string;

  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);

    const { config } = props;

    const bucket = new s3.Bucket(this, "SiteBucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: config.frontend.removalPolicy,
      autoDeleteObjects: config.frontend.autoDeleteObjects,
    });

    const distribution = new cloudfront.Distribution(this, "Distribution", {
      defaultRootObject: "index.html",
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      // SPA なので存在しないパスは index.html に寄せる
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: cdk.Duration.minutes(5),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: cdk.Duration.minutes(5),
        },
      ],
      // 日本を含むエッジロケーションを使う
      priceClass: cloudfront.PriceClass.PRICE_CLASS_200,
    });

    if (config.frontend.proxyApiThroughCloudFront) {
      if (!props.apiLoadBalancerDnsName) {
        throw new Error(
          "apiLoadBalancerDnsName is required when proxyApiThroughCloudFront is enabled"
        );
      }

      // 同一オリジン構成。バックエンドに app.setGlobalPrefix('api') が必要。
      distribution.addBehavior(
        "/api/*",
        new origins.HttpOrigin(props.apiLoadBalancerDnsName, {
          protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
        }),
        {
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
        }
      );
    }

    const distDir = path.resolve(__dirname, "../../apps/frontend/dist");
    if (fs.existsSync(distDir)) {
      new s3deploy.BucketDeployment(this, "DeploySite", {
        sources: [s3deploy.Source.asset(distDir)],
        destinationBucket: bucket,
        distribution,
        distributionPaths: ["/*"],
      });
    } else {
      cdk.Annotations.of(this).addInfo(
        `apps/frontend/dist not found; skipping BucketDeployment. Run "pnpm --filter @app/frontend build" before deploying.`
      );
    }

    this.distributionDomainName = distribution.distributionDomainName;

    new cdk.CfnOutput(this, "SiteUrl", {
      value: `https://${distribution.distributionDomainName}`,
    });
    new cdk.CfnOutput(this, "SiteBucketName", { value: bucket.bucketName });
  }
}
