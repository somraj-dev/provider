# Versioning

## Semantic Versioning

AxioVital follows [Semantic Versioning 2.0.0](https://semver.org/):

```
MAJOR.MINOR.PATCH
```

- **MAJOR**: Breaking changes to APIs or data models
- **MINOR**: New features, backward-compatible
- **PATCH**: Bug fixes, backward-compatible

## Current Version

`0.1.0` — Initial development

## Versioning Scope

Each package/app maintains its own version:

| Package | Version |
|:---|:---|
| `@axiovital/frontend` | Follows app version |
| `@axiovital/backend` | Follows API version |
| `@axiovital/desktop` | Follows app version |
| `@axiovital/ai-service` | Independent |
| `@axiovital/shared-types` | Independent |

## Release Process

1. Create `release/vX.Y.Z` branch from `develop`
2. Update version numbers in all `package.json` files
3. Update CHANGELOG.md
4. Merge to `main` and tag
5. Build and publish artifacts
6. Back-merge to `develop`

---

*TODO: Add automated changelog generation and release tooling.*
