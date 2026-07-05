# API Conventions

## Standards

- RESTful API design
- JSON request/response bodies
- API versioning via URL prefix: `/api/v1/...`
- Standard HTTP status codes

## Response Format

```json
{
  "data": {},
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  },
  "error": null
}
```

## Error Response Format

```json
{
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable error message",
    "details": []
  }
}
```

## Authentication

All authenticated endpoints require a `Bearer` token in the `Authorization` header:

```
Authorization: Bearer <jwt-token>
```

## Naming Conventions

- Endpoints: kebab-case (`/api/v1/patient-records`)
- Query parameters: camelCase (`?pageSize=20`)
- Request/Response bodies: camelCase (`{ "firstName": "..." }`)

## Pagination

Use cursor-based or offset pagination:

```
GET /api/v1/patients?page=1&limit=20
```

## Versioning

API versions are maintained via URL prefix. Breaking changes require a new version.

---

*TODO: Add OpenAPI/Swagger specification generation.*
