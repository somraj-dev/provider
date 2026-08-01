# ============================================
# AxioVital PostgreSQL Dockerfile
# PostgreSQL 16 + pgvector for AI embeddings
# ============================================

FROM pgvector/pgvector:pg16

# Copy initialization scripts that run on first container start
COPY infrastructure/docker/postgres/init/ /docker-entrypoint-initdb.d/

ENV POSTGRES_DB=axiovital
ENV POSTGRES_USER=axiovital_user
ENV POSTGRES_PASSWORD=change-me-in-production

EXPOSE 5432
