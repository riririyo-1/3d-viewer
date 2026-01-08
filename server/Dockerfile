# -- ベースイメージ --------------
FROM node:20-alpine AS base
RUN apk add --no-cache openssl openssl-dev
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app


# -- 依存関係インストール --------------
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/
RUN pnpm install --frozen-lockfile


# -- ビルド --------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm prisma generate
RUN pnpm build


# -- 本番環境 --------------
FROM base AS runner
ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

EXPOSE 4000

CMD ["sh", "-c", "pnpm prisma migrate deploy && node dist/src/main"]
