# Development Workflow

## Daily Workflow

1. Pull latest changes from `main`
2. Create a feature branch: `feature/<ticket-id>-description`
3. Start infrastructure: `docker compose up postgres redis opensearch -d`
4. Start dev servers: `npm run dev:backend` and `npm run dev:frontend`
5. Make changes, commit frequently
6. Push branch and create PR
7. Code review → merge to `main`

## Running Services

| Command | Description |
|:---|:---|
| `npm run dev:frontend` | Start Next.js dev server (port 3000) |
| `npm run dev:backend` | Start NestJS dev server (port 4000) |
| `npm run dev:desktop` | Start Electron desktop app |
| `docker compose up` | Start all services via Docker |

## Testing

```bash
npm run test                        # Run all tests
npm run test --workspace=apps/backend  # Run backend tests only
```

## Linting & Formatting

```bash
npm run lint      # Run ESLint
npm run format    # Run Prettier
```

---

*TODO: Add hot reload configuration details and debugging setup.*
