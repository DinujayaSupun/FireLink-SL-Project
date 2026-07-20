# ----------------------------------------------------------------------------
# Backend image — the Express API.
#
# One stage is enough: install dependencies, copy the source, run node.
# ----------------------------------------------------------------------------

# node:20-alpine is a small, LTS Node image. Alpine keeps it lean (~130 MB).
# We verified the backend boots on this exact image during the case-sensitivity
# fixes, so it is a known-good base.
FROM node:20-alpine

# All commands below run relative to /app inside the container.
WORKDIR /app

# Copy ONLY the manifests first, then install. Docker caches each build step as a
# layer; because this layer depends only on the manifests, `npm install` re-runs
# just when dependencies change — not every time you edit a source file.
COPY package.json package-lock.json ./

# --legacy-peer-deps is REQUIRED here: react-qr-reader / multer-gridfs-storage
# declare stale peer ranges, so a plain `npm install` aborts with ERESOLVE.
# --omit=dev skips devDependencies (nodemon) — production runs plain node.
RUN npm install --legacy-peer-deps --omit=dev

# Now copy the rest of the backend source into the image.
COPY . .

# Document the port the API listens on (compose also sets PORT=5000).
EXPOSE 5000

# Drop from root to the unprivileged "node" user (uid 1000, built into the image).
# The app only reads its files and writes nothing to local disk — uploads go to
# GridFS (Mongo) — so this needs no chown. Defence in depth: a compromised process
# then has no root inside the container.
USER node

# server.js reads its config from process.env, which docker-compose provides.
# It also calls dotenv for ./config/config.env, but that file is .dockerignored,
# so dotenv finds nothing and the compose environment is used as-is.
CMD ["node", "server.js"]
