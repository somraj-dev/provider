# Coding Standards

## TypeScript

- **Strict mode** enabled in all projects
- Use **interfaces** for object shapes, **types** for unions/intersections
- Prefer **const** over **let**; avoid **var**
- Use **async/await** over raw Promises
- Always type function parameters and return values

## Naming

| Type | Convention | Example |
|:---|:---|:---|
| Files | kebab-case | `patient-service.ts` |
| Classes | PascalCase | `PatientService` |
| Functions | camelCase | `getPatientById` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Interfaces | PascalCase (no `I` prefix) | `Patient` |
| Enums | PascalCase | `UserRole` |
| React Components | PascalCase | `PatientCard` |

## Code Organization

- One class/component per file
- Group imports: external → internal → relative
- Use barrel exports (`index.ts`) for public APIs

## Git Commits

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add patient search endpoint
fix: resolve date parsing in appointments
chore: update dependencies
docs: add API documentation
```

## Error Handling

- Always handle errors explicitly
- Use custom error classes for domain errors
- Log errors with structured context
- Never swallow exceptions silently

---

*TODO: Add React component guidelines and Python coding standards.*
