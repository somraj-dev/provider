# Database

Database configuration, migrations, seeds, and backup scripts for the AxioVital Provider Operating Environment.

## Structure

- `migrations/` — Database migration files (managed via Prisma)
- `seeds/` — Seed data scripts
- `schema/` — Schema documentation and diagrams
- `backups/` — Backup scripts and storage

## Prisma

The Prisma schema lives in `apps/backend/prisma/schema.prisma`. Migrations are generated and applied from there.

```bash
# Generate migration
cd apps/backend
npx prisma migrate dev --name init

# Apply migrations
npx prisma migrate deploy

# Generate client
npx prisma generate
```
