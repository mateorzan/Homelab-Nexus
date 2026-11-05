# ---------------------------------------------------------------------------
# Multi-stage build
# ---------------------------------------------------------------------------
FROM node:24-alpine AS build
WORKDIR /app

# Instalación reproducible a partir del lockfile
COPY package.json package-lock.json ./
RUN npm ci

# Copia el source y compila TypeScript
COPY tsconfig.json ./
COPY src ./src
RUN npm run build && npm prune --omit=dev

# ---------------------------------------------------------------------------
# Imagen final de runtime (sin devDependencies, sin source compilado extra)
# ---------------------------------------------------------------------------
FROM node:24-alpine AS runtime
ENV NODE_ENV=production
ARG APP_VERSION=dev
ENV APP_VERSION=$APP_VERSION
WORKDIR /app

# Usuario no-root por seguridad (UID 1000 para compatibilidad con bind mounts)
# El base image trae un usuario 'node' con UID 1000; lo eliminamos primero.
RUN deluser node 2>/dev/null; addgroup -S app && adduser -D -u 1000 -G app app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./

COPY public ./public
RUN mkdir -p /app/data && chown -R app:app /app

USER app

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))" || exit 1

CMD ["node", "dist/server.js"]
