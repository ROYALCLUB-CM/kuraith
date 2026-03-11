#!/bin/bash
# KURAITH Deploy Script for Debian Server
# Usage: bash deploy.sh <server-ip> [domain]
#
# Prerequisites on server:
#   - SSH access with key auth
#   - Docker + Docker Compose installed
#
# This script will:
#   1. Copy project files to server
#   2. Build and start containers
#   3. Run database migrations
#   4. (Optional) Setup Caddy reverse proxy with SSL

set -e

SERVER="${1:?Usage: bash deploy.sh <server-ip> [domain]}"
DOMAIN="${2:-}"
REMOTE_DIR="/opt/kuraith"

echo ""
echo "  ╔══════════════════════════════════════╗"
echo "  ║     KURAITH Deploy to Production     ║"
echo "  ╚══════════════════════════════════════╝"
echo ""
echo "  Server: $SERVER"
echo "  Domain: ${DOMAIN:-none (use IP)}"
echo "  Remote: $REMOTE_DIR"
echo ""

# --- Step 1: Prepare server directory ---
echo "  [1/5] Preparing server..."
ssh "$SERVER" "mkdir -p $REMOTE_DIR"

# --- Step 2: Sync files ---
echo "  [2/5] Syncing files..."
rsync -avz --delete \
  --exclude node_modules \
  --exclude .env \
  --exclude dist \
  --exclude frontend/node_modules \
  --exclude frontend/dist \
  --exclude omega \
  --exclude .git \
  ./ "$SERVER:$REMOTE_DIR/"

# --- Step 3: Create production .env ---
echo "  [3/5] Creating production .env..."
JWT_SECRET=$(openssl rand -hex 32)
ssh "$SERVER" "cat > $REMOTE_DIR/.env << ENVEOF
DATABASE_URL=postgresql://kuraith:kuraith_prod_$(openssl rand -hex 8)@db:5432/kuraith?schema=public
JWT_SECRET=$JWT_SECRET
PORT=47700
HOST=0.0.0.0
MCP_PORT=47701
ENVEOF"

# Update docker-compose with production password
ssh "$SERVER" "cd $REMOTE_DIR && sed -i 's/kuraith_dev/\$(grep -oP \"(?<=:)[^@]+(?=@)\" .env | head -1)/g' docker-compose.yml"

# --- Step 4: Build and start ---
echo "  [4/5] Building and starting containers..."
ssh "$SERVER" "cd $REMOTE_DIR && docker compose up -d --build"

# --- Step 5: Run migrations ---
echo "  [5/5] Running database migrations..."
sleep 5
ssh "$SERVER" "cd $REMOTE_DIR && docker compose exec api npx prisma migrate deploy"

echo ""
echo "  ══════════════════════════════════════"
echo "  KURAITH deployed!"
echo "  API:       http://$SERVER:47700"
echo "  MCP:       http://$SERVER:47701/mcp"
echo "  Dashboard: http://$SERVER:47700"
echo ""

# --- Optional: Setup Caddy reverse proxy ---
if [ -n "$DOMAIN" ]; then
  echo "  Setting up Caddy for $DOMAIN..."
  ssh "$SERVER" "apt-get install -y caddy 2>/dev/null || true"
  ssh "$SERVER" "cat > /etc/caddy/Caddyfile << CADDYEOF
$DOMAIN {
  reverse_proxy localhost:47700
}

mcp.$DOMAIN {
  reverse_proxy localhost:47701
}
CADDYEOF"
  ssh "$SERVER" "systemctl restart caddy"
  echo ""
  echo "  Dashboard: https://$DOMAIN"
  echo "  MCP:       https://mcp.$DOMAIN/mcp"
fi

echo ""
