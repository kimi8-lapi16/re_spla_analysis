## 概要
- 以前作ってたSplatoonの（特にXマッチ）バトル結果を集計し、分析できるようにするWebアプリのリメイク版

## 環境構築

### 環境変数
`kimi8-lapi16` に問い合わせてください、見れば分かるものも多いです

### DB 初期化

- `pnpm prisma migrate dev`
- `pnpm run seed:local`

### 準備
- `pnpm run api:generate`

 (swaggerの生成とopenapiクライアントの生成をやってくれます、これを実行しないとファイルがいろいろ足りません)

### アプリの立ち上げ
- `pnpm run dev`

## 設計周り
- フロントはまだふわふわしてるので、バックエンドだけ
- 基本的にはNestJSの作りを踏襲
- Repository層とUseCase層を導入
- Repository層 要はPrismaのラッパー
- UseCase層 複雑なリレーションや複数テーブルを跨ぐためにトランザクションを張る場合などに使用
- 気持ちとしてはこんな感じ Module > Controller > Service > (UseCase) > Repository

## 生成AI
- ClaudeCodeにほとんど書かせてます
