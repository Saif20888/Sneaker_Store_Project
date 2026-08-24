#!/usr/bin/env bash
# Redeploy this app to the production VPS.
#
# Usage: ./scripts/deploy.sh
# Requires: the SSH key at ~/.ssh/vintedge_vps to be authorized on the server
# (already set up as of the initial deploy — see DEPLOY_NOTES.md).
#
# What this does:
#   1. Rebuilds frontend assets locally (npm run build)
#   2. Packages the app (excluding vendor/node_modules/.git/.env/logs)
#   3. Uploads it to the server and extracts over the existing deployment
#   4. Runs composer install, migrations, and re-caches config/routes/views
#
# Does NOT touch .env on the server — that stays as-is. If you added new
# .env keys locally, you still need to add them on the server manually
# (ssh in and edit /var/www/vintedge/.env), then re-run this script.

set -euo pipefail

VPS_HOST="187.52.117.214"
VPS_USER="root"
SSH_KEY="$HOME/.ssh/vintedge_vps"
REMOTE_DIR="/var/www/vintedge"
TARBALL="/tmp/vintedge_deploy_$(date +%s).tar.gz"

echo "==> Building frontend assets"
npm run build

echo "==> Packaging project"
tar --exclude='vendor' \
    --exclude='node_modules' \
    --exclude='storage/logs/*' \
    --exclude='dummy_data_export' \
    --exclude='.git' \
    --exclude='.env' \
    --exclude='public/storage' \
    -czf "$TARBALL" .

echo "==> Uploading to $VPS_HOST"
scp -i "$SSH_KEY" -o StrictHostKeyChecking=no "$TARBALL" "$VPS_USER@$VPS_HOST:/tmp/deploy.tar.gz"

echo "==> Extracting and installing on server"
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$VPS_USER@$VPS_HOST" bash -s <<'REMOTE'
set -euo pipefail
cd /var/www/vintedge
tar -xzf /tmp/deploy.tar.gz
rm /tmp/deploy.tar.gz
COMPOSER_ALLOW_SUPERUSER=1 composer install --no-dev --optimize-autoloader --no-interaction
php artisan migrate --force
rm -f public/storage
php artisan storage:link
chown -R www-data:www-data /var/www/vintedge
chmod -R 775 /var/www/vintedge/storage /var/www/vintedge/bootstrap/cache
php artisan config:cache
php artisan route:cache
php artisan view:cache
systemctl reload php8.4-fpm
echo "Deploy complete."
REMOTE

rm -f "$TARBALL"
echo "==> Done. Site: https://vintedgeofficial.com"
