# ==========================================
# 1. Build Stage
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install build tools for native SQLite bindings & dependencies
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm ci

# Copy full source code
COPY . .

# Build Astro application with standalone Node adapter
RUN npm run build

# ==========================================
# 2. Production Runner Stage
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

# Install FFmpeg for video processing and build tools for SQLite native module
RUN apk add --no-cache ffmpeg python3 make g++

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy built application and assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/data ./data
COPY --from=builder /app/public ./public

# Ensure upload directories exist
RUN mkdir -p /app/public/uploads/thumbs \
             /app/public/uploads/videos \
             /app/public/uploads/logos \
             /app/public/uploads/intros \
             /app/public/uploads/outros \
             /app/public/uploads/watermarks \
             /app/dist/client/uploads/thumbs \
             /app/dist/client/uploads/videos \
             /app/dist/client/uploads/logos \
             /app/dist/client/uploads/intros \
             /app/dist/client/uploads/outros \
             /app/dist/client/uploads/watermarks

EXPOSE 4321

# Start the Astro standalone node server
CMD ["node", "./dist/server/entry.mjs"]
