FROM node:24-bookworm-slim AS builder

WORKDIR /app

# Instala dependências apenas dos workspaces da API e pacotes compartilhados
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/admin/package.json ./apps/admin/package.json
COPY apps/mobile/package.json ./apps/mobile/package.json
COPY packages/shared-types/package.json ./packages/shared-types/package.json
COPY packages/shared-validation/package.json ./packages/shared-validation/package.json
COPY packages/tsconfig/package.json ./packages/tsconfig/package.json

RUN npm ci --workspace=@bible-quiz/api --workspace=@bible-quiz/shared-types --workspace=@bible-quiz/shared-validation --include-workspace-root

COPY packages ./packages
COPY apps/api ./apps/api

RUN npm run build --workspace=@bible-quiz/shared-types \
  && npm run build --workspace=@bible-quiz/shared-validation \
  && npx prisma generate --schema=apps/api/prisma/schema.prisma \
  && npm run build --workspace=@bible-quiz/api \
  && mkdir -p apps/api/node_modules

FROM node:24-bookworm-slim AS runner

WORKDIR /app

RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=3001

COPY --from=builder --chown=node:node /app/package.json ./package.json
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/packages/shared-types/package.json ./packages/shared-types/package.json
COPY --from=builder --chown=node:node /app/packages/shared-types/dist ./packages/shared-types/dist
COPY --from=builder --chown=node:node /app/packages/shared-validation/package.json ./packages/shared-validation/package.json
COPY --from=builder --chown=node:node /app/packages/shared-validation/dist ./packages/shared-validation/dist
COPY --from=builder --chown=node:node /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder --chown=node:node /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder --chown=node:node /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=node:node /app/apps/api/prisma ./apps/api/prisma

WORKDIR /app/apps/api
USER node

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3001/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"]

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]

