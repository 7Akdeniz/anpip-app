# =====================================================
# FFMPEG VIDEO WORKER SERVICE
# =====================================================
# Docker-Container für Video-Processing
# - Kombiniert Chunks
# - Transcoding (Multi-Quality)
# - HLS/DASH Streaming
# - Thumbnail-Generierung
# - Auto-Kapitel
# =====================================================

FROM node:20-alpine AS base

# FFmpeg installieren
RUN apk add --no-cache \
    ffmpeg \
    python3 \
    make \
    g++

WORKDIR /app

# Dependencies
COPY package*.json ./
RUN npm ci --only=production

# App-Code
COPY . .

# Worker starten
CMD ["node", "workers/video-processor.js"]
