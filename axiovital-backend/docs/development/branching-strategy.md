# Branching Strategy

## Branch Types

| Branch | Purpose | Naming |
|:---|:---|:---|
| `main` | Production-ready code | — |
| `develop` | Integration branch | — |
| `feature/*` | New features | `feature/<ticket>-description` |
| `fix/*` | Bug fixes | `fix/<ticket>-description` |
| `hotfix/*` | Production hotfixes | `hotfix/<ticket>-description` |
| `release/*` | Release preparation | `release/v1.2.0` |

## Flow

```
feature/* → develop → release/* → main
hotfix/*  → main (and back-merge to develop)
```

## Rules

- All changes go through Pull Requests
- PRs require at least 1 code review approval
- `main` branch is protected (no direct pushes)
- CI must pass before merge
- Squash merge for feature branches
- Keep branches short-lived (< 1 week)

---

*TODO: Add PR template and code review checklist.*
