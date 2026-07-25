# Build context must be Client/ (see docker-compose.yml's `client` service /
# `docker build -f Client/Dockerfile Client`).
#
# Three stages: install deps once, build once (producing next.config.mjs's
# `output: "standalone"` bundle - a pruned server + only the node_modules a
# request actually touches, traced via webpack), then copy just that bundle
# into a bare runtime image. This is the pattern Next.js's own docs recommend
# for Docker specifically because it avoids the alternative (shipping the
# full node_modules, devDependencies included, into the final image) - the
# `runner` stage below never runs `npm install` at all.
#
# NEXT_PUBLIC_* values are compiled INTO the client JS bundle at `next build`
# time, not read from the environment at container start - that's a Next.js
# constraint, not a choice made here. So they have to arrive as build ARGs
# (see docker-compose.yml's `client.build.args`), not as plain `environment:`
# entries the way api_service/worker_service's settings work - setting them
# only at `docker run`/compose `environment:` time would bake in whatever (or
# nothing) was present at image build time instead, silently.

FROM node:20-alpine AS deps
WORKDIR /app
# Some transitive deps (native addons pulled in by Next.js/sharp-style image
# processing) expect glibc-shaped symbols that Alpine's musl libc doesn't
# provide out of the box - this is the standard fix, cheap enough to always
# include rather than debugging a missing .so only on some machines.
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID=
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=${NEXT_PUBLIC_GOOGLE_CLIENT_ID}
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Runs as an unprivileged user - the standalone server has no reason to run
# as root, same reasoning as any other production container in this stack.
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# public/ and .next/static aren't part of the standalone trace output (Next
# deliberately excludes static assets from it - see Next.js's own standalone
# output docs) so they're copied in separately, alongside the traced
# server + pruned node_modules from .next/standalone itself.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
