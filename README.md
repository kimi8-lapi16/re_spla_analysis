# re-splatoon-analysis

このアプリはSplatoonの戦績を分析するアプリケーションとなっています

## Backend

- TypeScript
- Express.js
- Prisma
- Swagger

## Frontend

- TypeScript
- React
- React-router-dom
- jotai
- YamadaUI

## DB

- Postgres

## Swagger

- http://localhost:4000/api-docs で SwaggerUI が開きます、それ経由で API 実行も可

## 立ち上げ方

- docker desktop を起動
- VSCode を起動
- HOUSEHOLD-BUDGET 直下(docker-compose.yaml)の TARMINAL で `docker-compose build` を実行
- 同じ場所で`docker-compose up -d` を実行
- ※ `docker-compose up -d --build` でも良いです

## バックアップの取り方

- db のコンテナで exec(terminal)タブを開き下記コマンドを実行する ※ダンプ(DUMP)と呼ばれるバックアップ(ただの SQL ファイル)を吐き出して、そのファイルをもとにデータを復元する
- DUMP の取得 `pg_dump -U postgres -h localhost -p 5432 -d mydb -f dump.sql`
- DUMP からの復元 `psql -U postgres -h localhost -p 5432 -d mydb -f dump.sql`

## データベースの接続方法

- `docker compose exec db psql -U postgres -d mydb`
- スキーマの確認 `\dt`
- 任意の SQL が実行できる `SELECT * FROM public."Income";`
- テーブル名の前にスキーマをつけないと動かない可能性大
- テーブル名は大文字小文字を区別する
- データベースから出る `exit`

## トラブルシューシューティング

### 初回で立ち上がらなかった場合(プリズマのクライアントが生成されていない、テーブルが存在しない)

- 新しいモデル、DB を追加した時に叩く(--name の引数はいい感じに変更) `npx prisma migrate dev --name add_income_outcome_purpose_models`
- docker desktop backend のコンテナ内の Exec で `npx prisma generate` を実行
- 同じ場所で `npx prisma migrate deploy` を実行
- HOUSEHOLD-BUDGET 直下(docker-compose.yaml)の TARMINAL で `docker-compose down` を実行
- 同じ場所で `docker-compose up -d` を実行
  ※コンテナ内と言ってるのは　`docker container exec -it コンテナ名 bash`とするか docker desktop の terminal もしくは exec というところから実行してねという意味です
- `docker-compose exec backend sh`
- `npx prisma generate`
- `npx prisma migrate depoly`
- `exit`

### 新しくライブラリ、パッケージを入れて Docker コンテナを起動しても存在しないと怒られる場合

- ホスト上で起動すると普通に動く場合は docker コンテナ内のキャッシュが悪さしてるケースなので、コンテナを作り直すと良い
- `docker-compose down`
- `docker-compose up -d --build`

### frontend のコンテナが立ち上がらない場合

- まずは Docker Desktop にてなんてエラーが出ているのか確認
- npm install が失敗している場合は、node_modules と package-lock.json を削除してコンテナを立ち上げ直してみる

### prisma のマイグレーションで失敗した場合

- docker desktop を開いて prisma のコンテナを立ち上がっているか確認する(立ち上がってない場合は、docker-compose.yaml でコメントアウトとかしてると思うので、それを解除してコンテナを再度作成してください)
- http://localhost:5555 にアクセスして\_prisma_migrations テーブルが存在することを確認
- prisma studio 上で(1)の SQL を実行(テーブルの構造がわかったら条件とかソートとか加える)
  - SELECT \* FROM \_prisma_migrations; (1)
- SELECT の結果からマイグレーションに失敗したフォルダ名(name カラムにあるはず)を(2)の SQL の伏せ字に入れて実行する
  - DELETE FROM \_prisma_migrations where migration_name='**\*\***'; (2)
- 再度(1)の SQL を実行し、直前で指定したフォルダ名のデータがなくなっていることを確認
- これで prisma のマイグレーションを再実行する

### /purposeで500エラーが出る場合

- seedがうまく行ってない可能性が高いので、backendでnpm run seedする
- 場合によっては、npx prisma migrate deployもやらないといけない
