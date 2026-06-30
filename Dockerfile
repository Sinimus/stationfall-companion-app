# syntax=docker/dockerfile:1

# --- Build stage: Next.js static export to ./out ---
# node:22-slim (glibc) avoids musl native-binary friction with the
# pnpm 10 toolchain (oxide / unrs-resolver / sharp).
FROM node:22-slim AS build
WORKDIR /app

# Pin pnpm explicitly (no corepack signature drift).
RUN npm install -g pnpm@10.28.2

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# --- Serve stage: static files via nginx ---
FROM nginx:stable-alpine AS serve
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/out /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
