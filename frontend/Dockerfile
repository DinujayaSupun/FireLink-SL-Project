# ----------------------------------------------------------------------------
# Frontend image — multi-stage.
#
# Stage 1 (build):  a full Node toolchain compiles the React app to static files.
# Stage 2 (serve):  a tiny nginx image serves those files. Node, the source, and
#                   node_modules are all left behind in stage 1, so the final
#                   image (~165 MB: nginx + the built bundles) is a fraction of
#                   the ~500 MB build stage.
# ----------------------------------------------------------------------------

# ---- Stage 1: build ----
FROM node:20-alpine AS build
WORKDIR /app

# Manifests first (same layer-caching trick as the backend). NOTE: no --omit=dev
# here — the build NEEDS devDependencies (vite, typescript) to compile.
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

COPY . .

# Vite inlines every VITE_* variable into the JS bundle at BUILD time — they are
# NOT read at runtime. Whatever value is present now gets hardcoded into the
# shipped JavaScript. Because this URL is used by the *browser* (not by this
# container), it must be an address the browser can reach: the host's
# localhost:5000, never the Docker-internal "backend" hostname.
ARG VITE_API_URL=http://localhost:5000
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build          # -> produces /app/dist

# ---- Stage 2: serve ----
FROM nginx:alpine

# Swap nginx's default site config for ours (SPA fallback + /api proxy).
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy ONLY the built assets out of the build stage.
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
# nginx:alpine's own default CMD starts the server, so we don't set one.
