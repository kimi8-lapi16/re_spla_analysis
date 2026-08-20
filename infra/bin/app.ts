#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { AppStack } from "../lib/app-stack";
import { BatchStack } from "../lib/batch-stack";
import { getStageConfig } from "../lib/config";
import { DataStack } from "../lib/data-stack";
import { FrontendStack } from "../lib/frontend-stack";
import { NetworkStack } from "../lib/network-stack";
import { RegistryStack } from "../lib/registry-stack";

const app = new cdk.App();

const stage = String(app.node.tryGetContext("stage") ?? "dev");
const config = getStageConfig(stage);
// CI ではコミット SHA を渡す: cdk deploy -c imageTag=$GITHUB_SHA
const imageTag = String(app.node.tryGetContext("imageTag") ?? "latest");

const env: cdk.Environment = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION ?? config.region,
};

const prefix = `ReSplaAnalysis-${config.stageName}`;

const network = new NetworkStack(app, `${prefix}-Network`, { env, config });

const registry = new RegistryStack(app, `${prefix}-Registry`, { env, config });

const data = new DataStack(app, `${prefix}-Data`, {
  env,
  config,
  vpc: network.vpc,
  databaseSecurityGroup: network.databaseSecurityGroup,
});

const appStack = new AppStack(app, `${prefix}-App`, {
  env,
  config,
  imageTag,
  vpc: network.vpc,
  albSecurityGroup: network.albSecurityGroup,
  serviceSecurityGroup: network.serviceSecurityGroup,
  repository: registry.repository,
  database: data.database,
  databaseSecret: data.databaseSecret,
  jwtSecret: data.jwtSecret,
  jwtRefreshSecret: data.jwtRefreshSecret,
});

new BatchStack(app, `${prefix}-Batch`, {
  env,
  config,
  imageTag,
  vpc: network.vpc,
  cluster: appStack.cluster,
  batchSecurityGroup: network.batchSecurityGroup,
  repository: registry.repository,
  database: data.database,
  databaseSecret: data.databaseSecret,
  jwtSecret: data.jwtSecret,
  jwtRefreshSecret: data.jwtRefreshSecret,
});

new FrontendStack(app, `${prefix}-Frontend`, {
  env,
  config,
  apiLoadBalancerDnsName: config.frontend.proxyApiThroughCloudFront
    ? appStack.loadBalancerDnsName
    : undefined,
});

cdk.Tags.of(app).add("Project", "re-spla-analysis");
cdk.Tags.of(app).add("Stage", config.stageName);
