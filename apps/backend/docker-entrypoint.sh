#!/bin/sh
set -e

# ECS からは DB のホスト名やパスワードを個別の環境変数として注入する
# (Secrets Manager の値をそのまま接続 URL にできないため)。
# ここで Prisma が読む DATABASE_URL に組み立て直す。
#
# DB_PASSWORD は URL エンコードしない。CDK 側で記号を除外したパスワードを
# 生成しているため (infra/lib/data-stack.ts の excludeCharacters を参照)。
if [ -z "${DATABASE_URL}" ] && [ -n "${DB_HOST}" ]; then
  export DATABASE_URL="mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT:-3306}/${DB_NAME}"
fi

if [ -z "${DATABASE_URL}" ]; then
  echo "DATABASE_URL is not set and DB_HOST is missing; cannot start" >&2
  exit 1
fi

# SHADOW_DATABASE_URL は prisma migrate dev でしか使われないため本番では設定しない
exec "$@"
