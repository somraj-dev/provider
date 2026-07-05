# Deployment Strategy

## Environments

| Environment | Purpose | Infrastructure |
|:---|:---|:---|
| Development | Local development | Docker Compose |
| Staging | Pre-production testing | Kubernetes |
| Production | Live environment | Kubernetes |

## Deployment Pipeline

```
Code Push → CI (Lint + Test + Build) → Docker Image → Registry → Kubernetes
```

## Cloud-Agnostic Design

The deployment is designed to run on:

- **AWS** (EKS, RDS, ElastiCache, OpenSearch Service)
- **Azure** (AKS, Azure Database for PostgreSQL, Azure Cache for Redis)
- **GCP** (GKE, Cloud SQL, Memorystore, Elastic Cloud)
- **Self-hosted** (kubeadm, bare-metal Kubernetes)

All configuration is externalized through environment variables and ConfigMaps.

## Zero-Downtime Deployments

- Rolling updates with readiness probes
- Database migrations run as Kubernetes Jobs before deployment
- Blue-green deployment option for major releases

## Rollback

```bash
# Kubernetes rollback
kubectl rollout undo deployment/backend -n axiovital

# Database rollback
npx prisma migrate rollback
```

---

*TODO: Add Helm charts and GitOps (ArgoCD/Flux) configuration.*
