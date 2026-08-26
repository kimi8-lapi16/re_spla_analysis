# infra (AWS CDK)

`re_spla_analysis` の AWS 構成。設計の背景は [docs/analysis-summary-design.md](../docs/analysis-summary-design.md) を参照。

## 構成

```
                    ┌─────────────┐
   ユーザー ────────▶│ CloudFront  │──▶ S3 (React ビルド成果物)
                    └─────────────┘
                    ┌─────────────┐
                    │     ALB     │ (public subnet)
                    └─────────────┘
                           │
                    ┌─────────────────────────┐
                    │ ECS Fargate Service     │ (public subnet, assignPublicIp)
                    │  api コンテナ            │
                    └─────────────────────────┘
                           │
                    ┌─────────────────────────┐
                    │ RDS MySQL 8.0           │ (isolated subnet)
                    └─────────────────────────┘
                           ▲
                    ┌─────────────────────────┐
                    │ ECS Fargate Task (batch)│◀── EventBridge Rule (日次 cron)
                    └─────────────────────────┘
```

| スタック | 中身 |
| --- | --- |
| `ReSplaAnalysis-<stage>-Network` | VPC / サブネット / セキュリティグループ |
| `ReSplaAnalysis-<stage>-Registry` | ECR リポジトリ |
| `ReSplaAnalysis-<stage>-Data` | RDS MySQL / JWT シークレット |
| `ReSplaAnalysis-<stage>-App` | ECS クラスタ / ALB / API サービス |
| `ReSplaAnalysis-<stage>-Batch` | バッチ用タスク定義 / EventBridge / 失敗通知 SNS |
| `ReSplaAnalysis-<stage>-Frontend` | S3 / CloudFront |

### 設計上のポイント

- **NAT Gateway を使わない**。ECS タスクは public subnet にパブリック IP 付きで置き、
  ECR / CloudWatch Logs / Secrets Manager へは Internet Gateway 経由で到達する。
  NAT (約 $45/月) と VPC エンドポイント4つ (約 $28/月) をどちらも避けるため。
  到達制御はセキュリティグループで担保し、RDS は isolated subnet に隔離している。
- **ALB のセキュリティグループも NetworkStack で作る**。AppStack で作ると
  「ALB SG (App) → API SG (Network)」の許可ルールがクロススタック参照になり、
  App → Network の依存と合わせて循環参照でデプロイできなくなる。
- **API とバッチは同一イメージ**。起動コマンドだけを切り替える。
- **ヘルスチェック `/health` は DB に触らない**。DB 障害でタスクが延々と入れ替わるのを避けるため。
- **マイグレーションは CDK のカスタムリソースにしない**。失敗時のリカバリが難しいため、
  独立した ECS RunTask として明示的に実行する。

## 前提

- AWS CLI v2 / 認証情報 (`aws sts get-caller-identity` が通ること)
- Docker
- `pnpm install` 済み

初回のみ CDK bootstrap:

```bash
pnpm --filter @app/infra exec cdk bootstrap aws://<account-id>/ap-northeast-1
```

## デプロイ手順

ECS サービスは「イメージが既に push されている」前提で起動するため、順番が重要。

```bash
export AWS_REGION=ap-northeast-1
export ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export ECR=$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/re-spla-analysis-backend-dev
export TAG=$(git rev-parse --short HEAD)

# 1. ネットワークと ECR
pnpm --filter @app/infra exec cdk deploy ReSplaAnalysis-dev-Network ReSplaAnalysis-dev-Registry

# 2. イメージのビルドと push (リポジトリルートで実行)
aws ecr get-login-password | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
docker build --platform linux/amd64 -f apps/backend/Dockerfile -t $ECR:$TAG .
docker push $ECR:$TAG

# 3. DB / API / バッチ
pnpm --filter @app/infra exec cdk deploy -c imageTag=$TAG \
  ReSplaAnalysis-dev-Data ReSplaAnalysis-dev-App ReSplaAnalysis-dev-Batch

# 4. マイグレーションと初期データ投入 (下記「運用コマンド」を参照)

# 5. フロントエンド
pnpm --filter @app/frontend build
pnpm --filter @app/infra exec cdk deploy ReSplaAnalysis-dev-Frontend
```

CloudFront のドメインが確定したら `infra/lib/config.ts` の `api.frontendUrl` に設定して
App スタックを再デプロイする (CORS の許可オリジン)。
CloudFront のドメインを AppStack から直接参照すると循環参照になるため、手動で渡す設計にしている。

## 運用コマンド

バッチ用タスク定義は「日次ジョブ / 疎通確認 / マイグレーション」を兼ねる。
`command` を override して使う。

```bash
export CLUSTER=$(aws cloudformation describe-stacks --stack-name ReSplaAnalysis-dev-App \
  --query "Stacks[0].Outputs[?OutputKey=='ClusterName'].OutputValue" --output text)
export SUBNETS=$(aws ec2 describe-subnets --filters "Name=tag:aws-cdk:subnet-type,Values=Public" \
  --query 'Subnets[].SubnetId' --output text | tr '\t' ',')
export SG=$(aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=*BatchSg*" --query 'SecurityGroups[0].GroupId' --output text)
export NET="awsvpcConfiguration={subnets=[$SUBNETS],securityGroups=[$SG],assignPublicIp=ENABLED}"

run_batch() {
  aws ecs run-task --cluster $CLUSTER --launch-type FARGATE \
    --task-definition re-spla-analysis-dev-batch \
    --network-configuration "$NET" \
    --overrides "{\"containerOverrides\":[{\"name\":\"batch\",\"command\":$1}]}"
}

# マイグレーション
run_batch '["pnpm","prisma","migrate","deploy"]'

# マスタデータ投入 (ブキ / ステージ / ルールなど)
run_batch '["pnpm","seed"]'

# 疎通確認 (DB に SELECT 1 するだけ)
run_batch '["node","dist/batch/main.js","smoke"]'
```

ログは CloudWatch Logs の `/aws/ecs/...` (BatchLogGroup) に出る。

## 日次バッチを有効にする

`DailyReportRule` は既定で **無効** (`enabled: false`)。
実ジョブ (`daily-report`) を実装するまで、毎日失敗して通知が飛び続けるのを避けるため。

実装が済んだら `infra/lib/config.ts` の `batch.ruleEnabled` を `true` にして
Batch スタックを再デプロイする。

```ts
batch: {
  ruleEnabled: true,
  scheduleExpression: 'cron(0 20 * * ? *)', // UTC 20:00 = JST 翌 05:00
  command: ['node', 'dist/batch/main.js', 'daily-report'],
}
```

失敗通知を受け取るには `config.ts` の `alertEmail` を設定する (SNS のメール購読)。

## 使うときだけ立てて壊す運用

このスタックは常時稼働させる前提ではない。**課金はほぼ全部が時間単位なので、
見たいときに立てて、見終わったら壊すのが一番安い。**

| 稼働時間 | おおよその金額 |
| --- | --- |
| 1時間 | $0.09 (約13円) |
| 半日 (12時間) | $1.1 (約160円) |
| 1日 | $2.1 (約320円) |
| 1ヶ月 (730時間) | $64 (約9,600円) |

所要時間の目安:

- `cdk deploy` 一式: **約20分** (RDS 作成が約10分、CloudFront が約5分)
- `cdk destroy` 一式: **約20分** (CloudFront の無効化＋削除が約15分)

```bash
# 壊す (依存の逆順。--force で確認プロンプトを省略)
pnpm --filter @app/infra exec cdk destroy --force \
  ReSplaAnalysis-dev-Frontend ReSplaAnalysis-dev-Batch ReSplaAnalysis-dev-App \
  ReSplaAnalysis-dev-Data ReSplaAnalysis-dev-Registry ReSplaAnalysis-dev-Network
```

dev ステージは RDS / S3 / ECR / ロググループすべて `DESTROY` 設定なので、
そのまま消える (prod ステージは RETAIN なので残る)。

### destroy 後に残るもの

| 残るもの | 費用 | 対処 |
| --- | --- | --- |
| Secrets Manager の3件 (削除待ち状態) | 最大30日間 約$1.2 | すぐ消すなら `aws secretsmanager delete-secret --secret-id <name> --force-delete-without-recovery` |
| CDK bootstrap スタック (アセット用 S3 / ECR) | 月数セント | 次に使うなら残しておいてよい。消すなら `CDKToolkit` スタックを削除 |

### 消し忘れ対策

立てっぱなしが唯一のリスクなので、AWS Budgets で $5 くらいの閾値アラートを
1つ作っておくと安心 (無料)。

## コスト目安 (ap-northeast-1, dev ステージ1環境, 730時間/月)

単価は AWS Price List API 実測値 (2026-08 時点)。

| 項目 | 計算 | 月額(USD) |
| --- | --- | --- |
| ALB (時間課金) | $0.0243/h × 730 | 17.7 |
| ALB LCU | 個人利用の低トラフィック想定 | 1〜3 |
| パブリック IPv4 (ALB, AZ 2つ) | $0.005/h × 2 × 730 | 7.3 |
| パブリック IPv4 (API タスク) | $0.005/h × 1 × 730 | 3.7 |
| Fargate vCPU | $0.05056/vCPU-h × 0.25 × 730 | 9.2 |
| Fargate メモリ | $0.00553/GB-h × 0.5 × 730 | 2.0 |
| RDS db.t4g.micro Single-AZ | $0.025/h × 730 | 18.3 |
| RDS gp3 20GB | $0.138/GB-月 × 20 | 2.8 |
| Secrets Manager (3件) | $0.40 × 3 | 1.2 |
| ECR (10世代 ≒ 4GB) | $0.10/GB-月 | 0.4 |
| CloudWatch Logs | 取り込み数百MB 想定 | 0.5 |
| S3 + CloudFront | CloudFront 無料枠 (1TB/月) 内 | 0.1 |
| バッチ Fargate (1日1分) | | ≒0 |
| **合計** | | **約 64 USD (1ドル150円で約9,600円)** |

### 注意

- **パブリック IPv4 の課金 ($0.005/時/アドレス) が約 $11/月ある**。NAT Gateway (約 $45/月) を
  避けた代償で、それでも NAT より安いが、無視できる額ではない。
- 固定費がほぼ全額。アクセスが月に数回でも金額はほとんど変わらない。
- **ALB + Fargate + IPv4 の常時起動分だけで約 $40/月＝全体の6割**。
- RDS の t 系インスタンスは unlimited モードのため、継続的に高負荷だと CPU クレジット課金が乗る。
- アカウントが従来の12ヶ月無料利用枠の対象なら RDS db.t4g.micro 750時間/月 + 20GB が無料になり
  約 $21 減る。2025年以降に作成したアカウントはクレジット方式なので条件が異なる。

### 下げる打ち手 (効果順)

| 手 | 効果 | トレードオフ |
| --- | --- | --- |
| ALB をやめて App Runner にする | −$25 (ALB $17.7 + ALB の IPv4 $7.3)、App Runner が +$5〜10 なので **差引 −$15〜20/月** | CDK の App Runner は alpha construct |
| API を夜間停止 (desiredCount 0 を 8h/日) | −$5/月 | 停止中はアクセス不可 |
| ログ保持をさらに縮める / ECR 世代を減らす | −$0.5/月 | ほぼ誤差 |
| Aurora Serverless v2 (min 0 ACU) に置換 | **使い方次第で逆効果**。常時 0.5 ACU 稼働だと $0.15/ACU-h × 0.5 × 730 = **$55/月** で t4g.micro より高い。1日2時間程度しか起動しないなら約 $4.5/月 | レジューム待ち十数秒 |

「毎日ほぼ使う」なら t4g.micro 据え置き、「たまにしか触らない」なら Aurora Serverless v2、
という分岐になる。最安構成は App Runner + Aurora Serverless v2 (自動停止) で **$15〜25/月**。

## 既知の注意点

- `cdk synth` で `EngineVersion: '8.0' is not one of [...]` という警告が出るが、
  RDS はメジャーバージョンのみの指定を受け付けるため無視してよい (CFN リンタのリストが古い)。
- ALB は既定で HTTP:80 リスナーのみ。ACM 証明書がある場合は `config.ts` の
  `api.certificateArn` を設定すると HTTPS:443 + HTTP からのリダイレクトになる。
  証明書なしのまま CloudFront (HTTPS) からブラウザ経由で API を叩くと mixed content で
  ブロックされるため、独自ドメイン + 証明書を用意するか、
  `frontend.proxyApiThroughCloudFront` を有効にして同一オリジン構成にする
  (後者はバックエンドに `app.setGlobalPrefix('api')` が必要)。
- GitHub Actions によるデプロイ自動化はまだ入れていない。手順は上記の手動コマンドと同じで、
  OIDC で AssumeRole するロールを別途用意する想定。
