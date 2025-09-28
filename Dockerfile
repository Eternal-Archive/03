# ---- Build ----
FROM node:22-alpine AS build
WORKDIR /app
ENV CI=true
RUN corepack enable
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/api/package.json ./apps/api/package.json
RUN pnpm install --frozen-lockfile
COPY apps/api ./apps/api
COPY prisma ./prisma
RUN pnpm --filter ea-api build

# ---- Run ----
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=10000
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/prisma ./prisma
EXPOSE 10000
CMD ["node","dist/main.js"]
