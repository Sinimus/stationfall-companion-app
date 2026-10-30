# syntax=docker/dockerfile:1

# --- Build stage: Next.js static export to ./out ---
# node:24-slim (glibc) avoids musl native-binary friction with the
# pnpm 10 toolchain (oxide / unrs-resolver / sharp).
FROM node:24-slim AS build
WORKDIR /app

# Pin pnpm explicitly (no corepack signature drift).
RUN npm install -g pnpm@10.28.2

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# --- Serve stage: static files via nginx ---
FROM nginx:stable-alpine AS serve
# nginx:stable-alpine (22. 10.) still ships brotli-libs 1.2.0-r1 (CRITICAL,
# fixed in 1.2.1-r0, which Alpine published on 22. 10.). The constraint fails
# the build if the repo lacks the fix and is a no-op once the base catches up.
RUN apk add --no-cache --upgrade 'brotli-libs>=1.2.1-r0'
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/out /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
