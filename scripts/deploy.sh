#!/bin/bash

set -e

echo "🚀 Iniciando deploy..."

# Backup
BACKUP_DIR="/var/backups/prontuario-psi/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR
cp -r /var/www/prontuario-psi $BACKUP_DIR/ || true

# Update code
cd /var/www/prontuario-psi
git pull origin main

# Install dependencies
cd backend
npm install --production

# Run migrations (if needed)
# npm run migrate

# Restart application
pm2 restart prontuario-psi || pm2 start src/server.js --name prontuario-psi
pm2 save

echo "✅ Deploy concluído!"



