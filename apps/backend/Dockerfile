# 本番用イメージ。ビルドコンテキストはリポジトリルート。
#   docker build -f apps/backend/Dockerfile -t <tag> .
#
# API とバッチで同一イメージを使い、起動コマンドだけを切り替える。
#   API   : node dist/main.js            (Dockerfile の CMD)
#   バッチ: node dist/batch/main.js smoke (ECS の command override)
#   移行  : pnpm prisma migrate deploy    (ECS の command override)
ARG NODE_VERSION=22-bookworm-slim

FROM node:${NODE_VERSION} AS base
# Prisma の query engine が OpenSSL に依存するため slim イメージでは明示的に入れる
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

# --- 依存解決に必要なマニフェストだけを先にコピーしてレイヤキャッシュを効かせる ---
FROM base AS manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# --frozen-lockfile はワークスペース全パッケージのマニフェストを要求するため、
# ビルド対象外の frontend も package.json だけコピーする
COPY apps/backend/package.json apps/backend/
COPY apps/frontend/package.json apps/frontend/

# --- 実行時に必要な依存のみ (prisma CLI は migrate deploy のため dependencies に含める) ---
FROM manifests AS prod-deps
RUN pnpm install --frozen-lockfile --prod --filter @app/backend...

# --- ビルド用の依存 (devDependencies 含む) ---
FROM manifests AS build-deps
RUN pnpm install --frozen-lockfile --filter @app/backend...

FROM build-deps AS build
COPY apps/backend apps/backend
# Prisma Client は schema.prisma の output 設定により apps/backend/generated/prisma に出る
RUN pnpm --filter @app/backend exec prisma generate \
  && pnpm --filter @app/backend build

FROM base AS runtime
ENV NODE_ENV=production
ENV PORT=3000

# pnpm はシンボリックリンク構成なので、ルートの node_modules (.pnpm ストア) と
# パッケージ側の node_modules を同じパス構成のままコピーする
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=build /app/apps/backend/dist ./apps/backend/dist
COPY --from=build /app/apps/backend/generated ./apps/backend/generated
# migrate deploy に必要なので schema とマイグレーション履歴を同梱する
COPY apps/backend/prisma ./apps/backend/prisma
COPY apps/backend/package.json ./apps/backend/package.json
COPY package.json pnpm-workspace.yaml ./
COPY apps/backend/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

WORKDIR /app/apps/backend
USER node
EXPOSE 3000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/main.js"]
