# 分析サマリー機能 設計メモ（統計エンジン + 日次バッチ + AWS/CDK）

## 0. この文書のスコープ

現状のダッシュボードは「勝率テーブル」「ポイント推移グラフ」を提供するだけで、
分析そのものはユーザーの目視に委ねられている。
ここに「所見（findings）を自動で出して日本語サマリーにする」機能を足すための設計メモ。

決めたこと（前提）:

- 文章生成は **まずテンプレート生成のみ**。LLM はあとから差し替え可能な形にだけしておく
- デプロイ先は **AWS + CDK**

---

## 1. 分析ロジック：LLM は不要、統計処理で足りる

1ユーザーの直近1ヶ月は多くても数百件。この規模では機械学習は過学習してノイズを拾うだけで、
古典的な統計処理のほうが精度も説明性も上になる。

| 手法 | 目的 |
| --- | --- |
| Wilson score interval | 勝率の信頼区間。「3戦3勝のステージが最強」問題を消す |
| 二項検定（片側） | 全体勝率に対して個別ステージ/ルール/ブキの勝率が有意に高い・低いか |
| Benjamini-Hochberg 補正 | ステージ×ルールで数十回検定するため多重比較補正は必須 |
| 線形回帰の傾き / Mann-Kendall 検定 | ポイント推移が上昇傾向か横ばいか |
| 期間比較（直近1ヶ月 vs それ以前） | 伸びた軸・落ちた軸の検出 |
| 時間帯別・連戦数別の勝率 | 「夜の3戦目以降で落ちる」系の所見 |

依存追加はゼロ〜`simple-statistics` 程度。すべて TypeScript の純粋関数で書ける。

### 出力フォーマット（findings JSON）

```jsonc
{
  "period": { "from": "2026-07-20", "to": "2026-08-20" },
  "totalMatches": 137,
  "overallWinRate": 0.518,
  "findings": [
    {
      "type": "WEAK_COMBINATION",
      "dimensions": { "rule": "ガチホコ", "stage": "マサバ海峡大橋" },
      "winRate": 0.28, "n": 25, "ci95": [0.14, 0.48],
      "pValue": 0.008, "adjustedPValue": 0.031, "significant": true
    },
    {
      "type": "POINT_TREND",
      "dimensions": { "rule": "ガチエリア", "battleType": "Xマッチ" },
      "slope": -12.4, "unit": "point/week", "pValue": 0.03, "significant": true
    },
    { "type": "INSUFFICIENT_DATA", "dimension": "weapon", "n": 6 }
  ]
}
```

**この JSON を構造化のまま DB に保存する**のが要点。

- テンプレート生成はこの JSON から機械的に日本語文を組み立てる
- 将来 LLM を足すときも、渡すのは生ログではなくこの JSON だけ
  （数値を計算させないのでハルシネーションが構造的に起きない／入力 1〜2k tokens で済む）
- ロジックを改版したとき、文章だけ作り直すことができる

---

## 2. データモデル

### 2.1 追加テーブル

```prisma
model AnalysisReport {
  id               String   @id @default(uuid()) @db.Char(36)
  userId           String   @map("user_id") @db.Char(36)
  targetDate       DateTime @map("target_date") @db.Date   // 生成基準日(JST)
  periodFrom       DateTime @map("period_from")
  periodTo         DateTime @map("period_to")
  matchCount       Int      @map("match_count")
  findings         Json                                     // 統計結果(構造化)
  summaryText      String?  @db.Text                        // 文章化した結果
  generator        String                                   // "template" | "claude-haiku-4-5" 等
  generatorVersion String   @map("generator_version")       // ロジック改版時の再生成判定に使う
  createdAt        DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id])

  @@unique([userId, targetDate])
  @@map("analysis_report")
}
```

### 2.2 既存スキーマへの変更

**`Match.createdAt` の追加を推奨。**
バッチで「前回実行以降に登録された試合があるユーザーだけ再生成する」差分制御をやりたくなるが、
`gameDateTime` は過去日付をあとから登録できるため差分検知に使えない。

```prisma
model Match {
  // ...
  createdAt DateTime @default(now()) @map("created_at")
}
```

既存行は migration の `DEFAULT CURRENT_TIMESTAMP` で埋まる。

インデックスは `match(user_id)` が FK 経由で既に存在するため、
バッチのユーザー単位スキャンには当面十分。件数が増えたら `(user_id, game_date_time)` の複合インデックスを検討。

---

## 3. アプリケーション構成

既存のレイヤードアーキテクチャ（Module > Controller > Service > (UseCase) > Repository）に素直に乗せる。

```
apps/backend/src/
  analysis-report/
    analysis-report.module.ts
    analysis-report.controller.ts     // GET /analysis/report  最新1件を返す
    analysis-report.service.ts        // 取得 / 生成のオーケストレーション
    analysis-report.repository.ts     // analysis_report テーブルのCRUD（単一テーブル）
    analysis-report.dto.ts
    generator/
      statistics/                     // 純粋関数。wilson.ts / binomial.ts / trend.ts / bh.ts
      findings.builder.ts             // Match[] -> findings JSON
      summary.template.ts             // findings JSON -> 日本語文（テンプレート実装）
      summary.generator.interface.ts  // 将来LLM実装を差し替えるためのIF
  batch/
    main.ts                           // NestFactory.createApplicationContext() で起動する薄いCLI
    daily-report.job.ts
```

### 設計ポイント

- **ロジックは Service に置き、入口だけ2つ用意する**
  - 入口A: `@nestjs/schedule` の `@Cron`（ローカル検証用 / 小規模ならこれでも本番可）
  - 入口B: `src/batch/main.ts`（`node dist/batch/main.js` で起動して終了する CLI）
  - AWS では入口B を ECS RunTask で叩く。入口A は複数インスタンス化すると多重実行するため本番では使わない
- 統計処理は **純粋関数**にしてユニットテストを厚く書く（CLAUDE.md の「生SQLは網羅的にテスト」と同じ方針）
- 集計クエリは既存 `AnalysisUseCase` の生SQLと似た形になるが、**バッチ用は期間フィルタ付きの別クエリ**にする。
  既存の勝率APIとは責務が違うので無理に共通化しない
- `summary.generator.interface.ts` を切っておけば、LLM 実装の追加は「新しい実装クラス + DI 切り替え + `generator` カラムの値変更」で済む

### API

```
GET /analysis/report        -> { report: AnalysisReportResponse | null }
```

CLAUDE.md の「レスポンスは必ず名前付きキーのオブジェクト」に従う。
バッチ未実行 / データ不足の場合は `report: null` を返し、フロント側で「データが足りません」を表示。

---

## 4. AWS インフラ構成

### 4.1 全体像

```
                    ┌─────────────┐
   ユーザー ────────▶│ CloudFront  │──▶ S3 (React ビルド成果物)
                    └─────────────┘
                           │ /api/*
                           ▼
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
                    │  node dist/batch/main.js│
                    └─────────────────────────┘
```

### 4.2 各コンポーネントの選定理由

| 要素 | 選定 | 理由 / 代替案 |
| --- | --- | --- |
| フロント配信 | S3 + CloudFront (OAC) | SPA なので静的配信で十分。CDK の `BucketDeployment` で完結 |
| API 実行環境 | ECS Fargate + ALB | CDK の `ApplicationLoadBalancedFargateService` が使え、学習価値が高い。コスト最優先なら App Runner（ただし CDK は alpha construct）。Lambda は Prisma のコールドスタートと RDS Proxy コストで割に合わない |
| DB | RDS MySQL 8.0 `db.t4g.micro` Single-AZ | 料金が固定で読みやすい。Aurora Serverless v2（min 0 ACU）はアイドル時に止まるがレジューム待ちと I/O 課金の読みにくさがある。個人利用なら t4g.micro が無難 |
| バッチ | EventBridge Rule → ECS RunTask | API と同じイメージを command override で起動するだけ。Lambda はタイムアウト15分とパッケージサイズの制約があり、将来重くなったときに詰む |
| イメージ | ECR（lifecycle rule で直近10世代のみ保持） | |
| シークレット | SSM Parameter Store (SecureString) | Secrets Manager は 1シークレット $0.40/月。RDS のマスターパスワードだけは Secrets Manager 自動生成を使う |
| ログ | CloudWatch Logs（保持期間 1〜2週間） | デフォルトの無期限保持はコストが効いてくるので必ず縮める |

### 4.3 NAT Gateway を使わない

ECS タスクを **public subnet に `assignPublicIp: true` で置く**。
ECR / CloudWatch Logs / SSM へは Internet Gateway 経由で到達するので NAT Gateway（約 $45/月）が不要になる。

- private subnet + VPC エンドポイント構成は、インターフェース型を4つ（ecr.api / ecr.dkr / logs / ssm）張ると
  約 $28/月かかり、個人規模では NAT を避ける旨みが薄い
- セキュリティはセキュリティグループで担保する
  - ALB SG: 0.0.0.0/0 から 443 のみ
  - ECS SG: ALB SG からのみ 3000
  - RDS SG: ECS SG（api / batch）からのみ 3306
  - RDS は isolated subnet に置き、パブリックアクセスは無効

**今回は文章生成がテンプレート実装なので、外部 API へのアウトバウンドが不要**。
将来 LLM を使う場合も public subnet 構成ならそのまま外に出られる。

### 4.4 スタック分割

```
infra/
  bin/app.ts
  lib/
    network-stack.ts    // VPC / Subnet / SecurityGroup
    data-stack.ts       // RDS / SSM Parameter / Secrets
    app-stack.ts        // ECR / ECS Cluster / Service / ALB / CloudWatch
    batch-stack.ts      // batch TaskDefinition / EventBridge Rule / 失敗通知
    frontend-stack.ts   // S3 / CloudFront / BucketDeployment
```

- ライフサイクル（変更頻度）でスタックを分けるのが基本。VPC と RDS はほぼ変わらず、App と Batch は頻繁に変わる
- スタック間参照は props 渡し（`new AppStack(app, 'App', { vpc: network.vpc, ... })`）
- ただし **クロススタック参照は削除順序でロックする**ので、
  「App から参照している SG を Network 側で消す」ような変更は二段階デプロイが必要になる点に注意
- `infra` は pnpm workspace のパッケージとして root に置く（`pnpm-workspace.yaml` に `infra` を追加）。
  Turbo のタスクには `cdk synth` を lint 相当として足しておくと CI で構文エラーを検知できる

### 4.5 バッチのスケジュール定義

EventBridge の cron は **UTC 固定**。JST 5:00 に回すなら:

```ts
new events.Rule(this, 'DailyReportRule', {
  schedule: events.Schedule.expression('cron(0 20 * * ? *)'), // UTC 20:00 = JST 翌 05:00
  targets: [
    new targets.EcsTask({
      cluster,
      taskDefinition: batchTaskDefinition,
      assignPublicIp: true,
      subnetSelection: { subnetType: ec2.SubnetType.PUBLIC },
      containerOverrides: [
        { containerName: 'batch', command: ['node', 'dist/batch/main.js', 'daily-report'] },
      ],
    }),
  ],
});
```

失敗検知は EventBridge の「ECS Task State Change（`stoppedReason` / `exitCode != 0`）」ルール → SNS → メール通知が最小構成。

---

## 5. 本番用 Dockerfile

**現在の root `Dockerfile` は devcontainer 用**（`node:current-bullseye` に vim を入れて sleep するだけ）なので、
本番用は別途 `apps/backend/Dockerfile` として multi-stage で作る必要がある。

注意点:

- Prisma client の出力先が `apps/backend/generated/prisma`（カスタムパス）なので、runtime stage へのコピー対象に含める
- Prisma の query engine は OpenSSL に依存する。`node:22-slim` を使うなら `openssl` を明示的に入れる
- pnpm workspace なので `pnpm deploy --filter @app/backend --prod` で依存を刈り込む
- API とバッチは **同一イメージ**。ENTRYPOINT を分けず、command override で切り替える

---

## 6. マイグレーションとデプロイ

```
GitHub Actions (OIDC で AssumeRole、長期キーは持たない)
  ├─ backend: docker build → ECR push
  │            → ECS RunTask で `pnpm prisma migrate deploy` を実行（完了待ち）
  │            → ECS Service の更新（新タスク定義でローリング）
  ├─ frontend: pnpm build → S3 sync → CloudFront invalidation
  └─ infra:    cdk diff (PR時) / cdk deploy (main merge時)
```

- **マイグレーションを CDK のカスタムリソースでやらない**。失敗時のリカバリが地獄になるので、
  独立した ECS RunTask として明示的に実行し、失敗したらデプロイを止める
- `pnpm run api:generate`（OpenAPI → クライアント生成）はフロントのビルド前に必要。CI に組み込む

---

## 7. コスト試算（ap-northeast-1、概算）

| 項目 | 月額(USD) |
| --- | --- |
| ALB | 約 18（固定）+ LCU 約 1 |
| ECS Fargate（0.25 vCPU / 0.5 GB 常時1タスク） | 約 9 |
| RDS db.t4g.micro Single-AZ + gp3 20GB | 約 14 |
| ECR / S3 / CloudFront / Logs | 約 3 |
| バッチ Fargate（1日1分程度） | ほぼ 0 |
| **合計** | **約 45 USD（6,000〜7,000円）/月** |

コストを下げる打ち手（効果順）:

1. **ALB をやめて App Runner にする** → 約 $18 → 約 $5、合計 3,000円台に落ちる。
   ただし CDK の App Runner L2 は alpha construct
2. ECS Service の desiredCount を 0/1 でスケジュール制御（夜だけ落とす）
3. RDS を Aurora Serverless v2 min 0 ACU にしてアイドル時に止める（レジューム待ち十数秒を許容できるなら）

新規 AWS アカウントの無料利用枠に該当するかは、アカウント作成時期によって条件が変わっているので要確認。

---

## 8. 進め方

| Phase | 内容 | インフラ依存 |
| --- | --- | --- |
| **0** | 統計エンジン（純粋関数）+ テンプレート文生成 + `GET /analysis/report` をオンデマンド計算で返す | なし |
| **1** | `analysis_report` テーブル追加 / `Match.createdAt` 追加 / `src/batch/main.ts` 実装 | なし（ローカル実行） |
| **2** | 本番 Dockerfile + CDK（Network / Data / App / Frontend）でデプロイ | AWS |
| **3** | BatchStack（EventBridge → ECS RunTask）で日次実行に切り替え | AWS |
| **4** | （任意）LLM 実装を `SummaryGenerator` の別実装として追加、feature flag で切替 | AWS |

Phase 0 を先に済ませると **インフラの決定を後ろ倒しにできる**（数百件ならオンデマンド計算でも数十msで返る）。
所見が実際に役立つかを検証してから、インフラに投資する順番が安全。

---

## 9. 落とし穴チェックリスト

- [ ] **サンプル不足を隠さない**。n < 20 は「データ不足」と明示する。
      これを怠ると「5戦で勝率20%のブキは捨てましょう」という有害な所見が出る
- [ ] **多重比較補正**。ステージ×ルールで32通り検定すれば、有意水準5%なら偶然1〜2個は「有意」になる
- [ ] **`Match.point` は nullable**。ポイント推移系の所見はナワバリ等を除外する前提を明示する
- [ ] **タイムゾーン**。既存の `parseIsoStringAsLocalTime` と揃えて JST 基準で日次境界を切る
- [ ] **バッチの冪等性**。`@@unique([userId, targetDate])` で upsert し、再実行しても壊れないようにする
- [ ] **バッチ失敗時の通知**。黙って死ぬと数週間気づかない
- [ ] **CloudWatch Logs の保持期間**。デフォルト無期限は避ける
- [ ] **クロススタック参照のロック**。Network/Data 側のリソース削除は二段階デプロイになる
- [ ] （LLM 導入時）**新規試合0件ならスキップ**してコスト暴走を防ぐ。そのための `Match.createdAt`
