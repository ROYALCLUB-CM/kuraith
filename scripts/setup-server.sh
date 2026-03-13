#!/bin/bash
# KURAITH Server Setup Script
# Run: curl -sL https://raw.githubusercontent.com/ROYALCLUB-CM/kuraith/main/scripts/setup-server.sh | bash
set -e

echo ""
echo "  ╔══════════════════════════════════════╗"
echo "  ║     KURAITH Server Setup             ║"
echo "  ╚══════════════════════════════════════╝"
echo ""

# ─── 1. System Update ───
echo "  [1/8] Updating system..."
apt update -qq && apt upgrade -y -qq

# ─── 2. Install tools ───
echo "  [2/8] Installing tools..."
apt install -y -qq curl git sudo wget gnupg2 ca-certificates lsb-release ufw qemu-guest-agent > /dev/null 2>&1
systemctl enable --now qemu-guest-agent 2>/dev/null || true

# ─── 3. Firewall ───
echo "  [3/8] Setting up firewall..."
ufw allow 22/tcp > /dev/null 2>&1
ufw allow 47700/tcp > /dev/null 2>&1
ufw allow 47701/tcp > /dev/null 2>&1
echo "y" | ufw enable > /dev/null 2>&1

# ─── 4. Docker ───
echo "  [4/8] Installing Docker..."
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com | bash > /dev/null 2>&1
fi
echo "         Docker $(docker --version | cut -d' ' -f3)"

# ─── 5. Node.js 22 ───
echo "  [5/8] Installing Node.js 22..."
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash - > /dev/null 2>&1
  apt install -y -qq nodejs > /dev/null 2>&1
fi
echo "         Node $(node --version)"

# ─── 6. PostgreSQL (Docker) ───
echo "  [6/8] Starting PostgreSQL + pgvector..."
if ! docker ps -q -f name=kuraith-db > /dev/null 2>&1 || [ -z "$(docker ps -q -f name=kuraith-db)" ]; then
  docker run -d \
    --name kuraith-db \
    --restart always \
    -e POSTGRES_USER=kuraith \
    -e POSTGRES_PASSWORD=kuraith_password \
    -e POSTGRES_DB=kuraith \
    -p 5432:5432 \
    -v kuraith-pgdata:/var/lib/postgresql/data \
    pgvector/pgvector:pg16 > /dev/null 2>&1
  echo "         PostgreSQL started"
  sleep 3
else
  echo "         PostgreSQL already running"
fi

# ─── 7. Clone & Build KURAITH ───
echo "  [7/8] Cloning & building KURAITH..."
cd /opt
if [ ! -d "kuraith" ]; then
  git clone https://github.com/ROYALCLUB-CM/kuraith.git > /dev/null 2>&1
fi
cd kuraith

# Create .env
JWT_SECRET=$(openssl rand -hex 32)
cat > .env << ENVEOF
PORT=47700
HOST=0.0.0.0
DATABASE_URL="postgresql://kuraith:kuraith_password@localhost:5432/kuraith?schema=public"
JWT_SECRET="${JWT_SECRET}"
JWT_EXPIRES_IN="30d"
TELEGRAM_BOT_TOKEN=""
TELEGRAM_CHAT_ID=""
ENVEOF

npm install --silent 2>&1 | tail -1
npx prisma migrate deploy 2>&1 | tail -1

# Build frontend
cd frontend && npm install --silent 2>&1 | tail -1 && npx vite build 2>&1 | tail -1 && cd ..

# Build backend
npm run build 2>&1 | tail -1

# ─── 8. PM2 ───
echo "  [8/8] Setting up PM2..."
npm install -g pm2 > /dev/null 2>&1
pm2 delete KURAITH 2>/dev/null || true
pm2 start dist/index.js --name KURAITH
pm2 save > /dev/null 2>&1
pm2 startup systemd -u root --hp /root 2>&1 | tail -1

# ─── Done ───
IP=$(hostname -I | awk '{print $1}')
echo ""
echo "  ╔══════════════════════════════════════╗"
echo "  ║     KURAITH Setup Complete!          ║"
echo "  ╠══════════════════════════════════════╣"
echo "  ║                                      ║"
echo "  ║  Dashboard: http://${IP}:47700       ║"
echo "  ║  MCP:       http://${IP}:47701/mcp   ║"
echo "  ║                                      ║"
echo "  ║  Next: Install Tailscale             ║"
echo "  ║  curl -fsSL https://tailscale.com/   ║"
echo "  ║  install.sh | sh && tailscale up     ║"
echo "  ║                                      ║"
echo "  ╚══════════════════════════════════════╝"
echo ""
pm2 status
echo ""
