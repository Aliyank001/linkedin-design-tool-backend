#!/bin/bash

# Production Deployment Script for Linux/DigitalOcean
# Run this on your production server

set -e  # Exit on error

echo ""
echo "========================================"
echo " LinkedIn Design Tool - Deployment"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/var/www/linkedin-design-tool"
APP_NAME="linkedin-tool"
NODE_VERSION="18.x"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

echo -e "${YELLOW}[1/8] Updating system...${NC}"
apt update && apt upgrade -y

echo -e "${YELLOW}[2/8] Installing Node.js $NODE_VERSION...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION} | bash -
    apt install -y nodejs
fi
echo -e "${GREEN}✓ Node.js $(node -v) installed${NC}"

echo -e "${YELLOW}[3/8] Installing PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi
echo -e "${GREEN}✓ PM2 installed${NC}"

echo -e "${YELLOW}[4/8] Installing Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    apt install -y nginx
fi
echo -e "${GREEN}✓ Nginx installed${NC}"

echo -e "${YELLOW}[5/8] Setting up application...${NC}"
if [ ! -d "$APP_DIR" ]; then
    echo -e "${RED}Error: Application directory not found at $APP_DIR${NC}"
    echo "Please upload your files first using Git or SCP"
    exit 1
fi

cd $APP_DIR/backend

echo -e "${YELLOW}[6/8] Installing dependencies...${NC}"
npm install --production
echo -e "${GREEN}✓ Dependencies installed${NC}"

echo -e "${YELLOW}[7/8] Checking .env file...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${RED}Error: .env file not found!${NC}"
    echo "Create .env file from .env.production template"
    exit 1
fi
echo -e "${GREEN}✓ .env file exists${NC}"

echo -e "${YELLOW}[8/8] Starting application with PM2...${NC}"

# Stop existing process
pm2 delete $APP_NAME 2>/dev/null || true

# Start application
pm2 start server.js --name $APP_NAME
pm2 startup
pm2 save

echo -e "${GREEN}✓ Application started${NC}"

echo ""
echo "========================================"
echo -e "${GREEN} Deployment Complete!${NC}"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Configure Nginx (see DEPLOYMENT.md)"
echo "2. Setup SSL with certbot"
echo "3. Point your domain to this server"
echo ""
echo "Check status: pm2 status"
echo "View logs: pm2 logs $APP_NAME"
echo ""
