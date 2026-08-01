# Local Development Setup

## Prerequisites

- **Node.js** >= 22.0.0
- **npm** >= 10.0.0
- **Python** >= 3.12
- **Docker** & **Docker Compose**
- **Git**

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd axiovital-provider
```

### 2. Install Node.js Dependencies

```bash
npm install
```

This installs dependencies for all workspaces (frontend, backend, desktop, packages).

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your local values. See `.env.example` for all available options.

### 4. Start Infrastructure Services

```bash
docker compose up postgres redis opensearch -d
```

### 5. Start Backend

```bash
npm run dev:backend
```

Backend runs on http://localhost:4000

### 6. Start Frontend

```bash
npm run dev:frontend
```

Frontend runs on http://localhost:3000

### 7. Start Desktop (Optional)

```bash
npm run dev:desktop
```

### AI Service (Optional)

```bash
cd apps/ai-service
python -m venv venv
venv\Scripts\activate    # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Troubleshooting

| Issue | Solution |
|:---|:---|
| Port conflict | Check `.env` for port configuration |
| Database connection failed | Ensure PostgreSQL container is running |
| OpenSearch OOM | Reduce `OPENSEARCH_JAVA_OPTS` heap size |

---

*TODO: Add IDE configuration guides (VS Code, WebStorm).*
