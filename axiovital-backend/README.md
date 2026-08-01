# AxioVital Provider Operating Environment

Enterprise-grade healthcare desktop platform inspired by the scalability and modular philosophy of Bloomberg Terminal, designed specifically for healthcare providers.

## Recent Updates

- Added new pages for top menu bar tabs in Provider View (including renaming the 'MyExperience' tab to 'Customised').
- Repositioned and updated the layout for the Insurance sidebar options in the patient profile menu, and removed the legacy Insurance Coverage Details view.
- Enhanced accessibility with improved contrast for hover states in DropdownMenuItems.
- Refined the overall UI layout and updated the Electron desktop renderer bundle accordingly.

## Architecture

| Layer | Technology |
|:---|:---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4, shadcn/ui |
| Desktop | Electron 43 + Electron Forge |
| Backend | NestJS 11, TypeScript, Prisma |
| AI Services | Python, FastAPI |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Search | OpenSearch 2 |
| Infrastructure | Docker, Kubernetes |

## Monorepo Structure

```
axiovital-provider/
├── apps/
│   ├── frontend/       # Next.js web application
│   ├── desktop/        # Electron desktop shell
│   ├── backend/        # NestJS API server
│   └── ai-service/     # FastAPI AI/ML service
├── packages/
│   ├── ui/             # Shared UI component library
│   ├── shared-types/   # Shared TypeScript type definitions
│   ├── shared-utils/   # Shared utility functions
│   ├── config/         # Shared configuration
│   └── sdk/            # API client SDK
├── infrastructure/     # Docker, Kubernetes, Nginx, monitoring
├── database/           # Migrations, seeds, schemas, backups
├── docs/               # Project documentation
├── assets/             # Static assets
├── tools/              # Development tools and scripts
└── .github/            # CI/CD workflows
```

## Quick Start

### Prerequisites

- Node.js >= 22.0.0
- npm >= 10.0.0
- Python >= 3.12
- Docker & Docker Compose
- Git

### Local Development

```bash
# 1. Clone the repository
git clone somraj-dev/provider
cd axiovital-provider

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env with your local values

# 4. Start infrastructure services
docker compose up postgres redis opensearch -d

# 5. Start backend
npm run dev:backend

# 6. Start frontend
npm run dev:frontend

# 7. Start desktop (optional)
npm run dev:desktop
```

### Docker Development

```bash
# Start all services
docker compose up

# Start specific services
docker compose up frontend backend postgres
```

## Services

| Service | Port | Description |
|:---|:---|:---|
| Frontend | 3000 | Next.js web application |
| Backend | 4000 | NestJS API server |
| AI Service | 8000 | FastAPI AI/ML endpoints |
| PostgreSQL | 5432 | Primary database |
| Redis | 6379 | Cache and session store |
| OpenSearch | 9200 | Full-text search engine |

## Documentation

- [System Architecture](docs/architecture/system-overview.md)
- [Local Setup Guide](docs/development/local-setup.md)
- [Coding Standards](docs/development/coding-standards.md)
- [API Conventions](docs/api/api-conventions.md)
- [Deployment Strategy](docs/development/deployment.md)

## License

UNLICENSED — Proprietary
