# AxioVital AI Service

FastAPI-based AI/ML service for the AxioVital Provider Operating Environment.

## Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload --port 8000
```

## Endpoints

- `GET /api/v1/health` — Health check
- `GET /docs` — OpenAPI documentation (Swagger)
- `GET /redoc` — ReDoc documentation

## Project Structure

```
app/
├── api/v1/routes/    # API endpoints
├── core/             # Configuration, logging
├── models/           # AI/ML model definitions
├── schemas/          # Pydantic request/response schemas
└── services/         # Business logic
```
