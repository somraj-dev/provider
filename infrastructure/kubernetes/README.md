# Kubernetes Manifests

Kubernetes deployment manifests for the AxioVital Provider Operating Environment.

## Structure

- `namespace.yaml` — Kubernetes namespace
- `configmaps/` — Application configuration
- `secrets/` — Sensitive configuration (use sealed-secrets in production)
- `deployments/` — Application and data service deployments
- `services/` — Kubernetes services for internal routing
- `ingress/` — Ingress rules for external access
- `volumes/` — Persistent Volume Claims

## Usage

```bash
# Create namespace
kubectl apply -f namespace.yaml

# Apply all manifests
kubectl apply -f configmaps/
kubectl apply -f secrets/
kubectl apply -f volumes/
kubectl apply -f deployments/
kubectl apply -f services/
kubectl apply -f ingress/
```

## Warning

All values in these manifests are **placeholders**. Do NOT use them in production without:
1. Replacing all `TODO` markers
2. Using real container registry URLs
3. Configuring proper secrets management (sealed-secrets, external-secrets, cloud KMS)
4. Setting appropriate resource limits
5. Adding health checks and readiness probes
