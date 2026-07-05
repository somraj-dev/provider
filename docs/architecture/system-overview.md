# System Architecture Overview

## AxioVital Provider Operating Environment

Enterprise-grade healthcare desktop platform designed for healthcare providers.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Electron Desktop Shell                       │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              Next.js Frontend (React + TypeScript)         │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  Modules: Dashboard | Patients | Scheduling | ...    │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └────────────────────────┬──────────────────────────────────┘  │
└───────────────────────────┼──────────────────────────────────────┘
                            │ REST/HTTP
                            ▼
┌───────────────────────────────────────────────────────────────────┐
│                    NestJS Backend API Gateway                      │
│  ┌──────┬──────────┬──────────┬─────────┬──────────┬───────────┐ │
│  │ Auth │ Patients │ Billing  │ Reports │ Lab/Img  │ Analytics  │ │
│  └──┬───┴────┬─────┴────┬────┴────┬────┴────┬─────┴─────┬─────┘ │
└─────┼────────┼──────────┼─────────┼─────────┼───────────┼────────┘
      │        │          │         │         │           │
      ▼        ▼          ▼         ▼         ▼           ▼
┌──────────┐ ┌──────┐ ┌────────────┐ ┌───────────────────────────┐
│PostgreSQL│ │Redis │ │ OpenSearch  │ │   FastAPI AI Service      │
│  (Data)  │ │(Cache)│ │  (Search)  │ │  (Clinical AI/ML)        │
└──────────┘ └──────┘ └────────────┘ └───────────────────────────┘
```

## Service Boundaries

| Service | Responsibility | Port |
|:---|:---|:---|
| Frontend | UI rendering, client-side logic | 3000 |
| Backend | API gateway, business logic, data access | 4000 |
| AI Service | Machine learning inference, clinical decision support | 8000 |
| PostgreSQL | Primary data persistence | 5432 |
| Redis | Session management, caching, pub/sub | 6379 |
| OpenSearch | Full-text search, log aggregation | 9200 |

## Communication Patterns

- **Frontend → Backend**: REST over HTTP
- **Backend → AI Service**: REST over HTTP (async where possible)
- **Backend → PostgreSQL**: Prisma ORM over TCP
- **Backend → Redis**: ioredis over TCP
- **Backend → OpenSearch**: HTTP client
- **Desktop → Frontend**: Embedded webview / HTTP

## Security Architecture

- JWT-based authentication with OAuth 2.0 support
- HIPAA compliance through comprehensive audit logging
- TLS encryption for all inter-service communication in production
- Context isolation and sandboxing in Electron

## Scalability Model

- Horizontal scaling for stateless services (frontend, backend, AI)
- Vertical scaling for stateful services (PostgreSQL, OpenSearch)
- Redis Cluster for high-availability caching
- Read replicas for database scaling

---

*TODO: Add detailed sequence diagrams, data flow diagrams, and deployment architecture.*
