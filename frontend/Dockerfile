# Stage 1: build the static files with Node. Nothing from this stage ships except dist/.
FROM node:24-alpine AS build
WORKDIR /app

# Dependencies first, so this slow layer is cached until package files change.
COPY package.json package-lock.json ./
RUN npm ci

# Then the source, and the production build (type check + optimised files in dist/).
COPY . .
RUN npm run build

# Stage 2: serve them with nginx, running as a non-root user (so it listens on 8080).
FROM nginxinc/nginx-unprivileged:1.28-alpine

# Our server configuration replaces the default one.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Only the built files from stage 1 - no Node, no node_modules, no source code.
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
