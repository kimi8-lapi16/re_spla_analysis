# ベースイメージとしてNodeのLTSバージョンを指定
FROM node:lts-alpine

# 作業ディレクトリを設定
WORKDIR /app

# パッケージインストール
COPY package*.json ./
RUN npm install

# Prismaクライアントの生成
COPY prisma ./prisma
RUN npx prisma generate

# アプリケーションのソースコードをコピー
COPY . .

# RUN npm run seed

# サーバーを起動
CMD ["npm", "run", "dev"]
