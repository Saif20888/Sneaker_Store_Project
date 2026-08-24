# Deployment notes

Production server: **VPS at 187.52.117.214** (Hostinger KVM 1, Ubuntu 24.04).
Domain: vintedgeofficial.com (DNS A records point `@` and `www` to the VPS IP).

## Stack on the server

- PHP 8.4, Nginx, MySQL 8.0
- App lives at `/var/www/vintedge`
- Nginx site config: `/etc/nginx/sites-available/vintedge`
- Cron runs `php artisan schedule:run` every minute

## Redeploying a code change

From the project root:

```bash
./scripts/deploy.sh
```

This rebuilds frontend assets, uploads the app (excluding vendor/node_modules/.git/.env),
runs `composer install`, migrations, and re-caches config/routes/views.

Requires the SSH key at `~/.ssh/vintedge_vps` — already authorized on the server.
If deploying from a different machine, that key needs generating and adding to the
server's `~/.ssh/authorized_keys` again (or reuse an existing key by pointing
`SSH_KEY` in `scripts/deploy.sh` at it).

## What the deploy script does NOT do

- **Doesn't touch `.env` on the server.** New env keys added locally need to be
  added manually: `ssh -i ~/.ssh/vintedge_vps root@187.52.117.214`, then edit
  `/var/www/vintedge/.env`, then `php artisan config:cache`.
- **Doesn't run `db:seed`.** The catalog was seeded once manually after the
  initial deploy. Re-running it would duplicate products — add new products
  through the admin panel instead, or write a one-off migration/command for
  bulk imports.
- **Doesn't set up SSL.** Once DNS is confirmed propagated, SSL still needs:
  `certbot --nginx -d vintedgeofficial.com -d www.vintedgeofficial.com`, and
  `SESSION_SECURE_COOKIE` in `.env` flipped back to `true` afterward (it's
  `false` right now because the site launched on plain HTTP before DNS/SSL
  were ready).

## Credentials

Not stored in this file or anywhere in git. Live only in:
- `/var/www/vintedge/.env` on the server (DB password, SteadFast keys, admin seed values)
- The admin account itself (email/password you set at launch) — change it via
  the app's own password-reset flow if needed, not by editing `.env`.

## Known gaps still open

- SSLCommerz payment option is disabled (`SSLCOMMERZ_ENABLED=false`) — COD/bKash/Nagad
  only until real merchant credentials are available.
- Mail is set to the `log` driver — verification/reset/order emails don't actually
  send yet. Needs a real provider (Resend recommended) wired into `.env`.
- Google OAuth login is unconfigured (empty client ID/secret) — "Continue with
  Google" button won't work until those are set.
