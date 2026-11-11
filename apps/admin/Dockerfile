FROM node:24-bookworm-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/admin/package.json ./apps/admin/package.json
COPY apps/mobile/package.json ./apps/mobile/package.json
COPY packages/shared-types/package.json ./packages/shared-types/package.json
COPY packages/shared-validation/package.json ./packages/shared-validation/package.json
COPY packages/tsconfig/package.json ./packages/tsconfig/package.json

RUN npm ci --workspace=@bible-quiz/admin --workspace=@bible-quiz/shared-types --workspace=@bible-quiz/shared-validation --include-workspace-root

COPY packages ./packages
COPY apps/admin ./apps/admin

ARG VITE_BASE_URL=http://localhost:3001
ENV VITE_BASE_URL=${VITE_BASE_URL}

RUN npm run build --workspace=@bible-quiz/shared-types \
  && npm run build --workspace=@bible-quiz/shared-validation \
  && npm run build --workspace=@bible-quiz/admin

FROM nginx:1.27-alpine AS runner

COPY apps/admin/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/admin/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

