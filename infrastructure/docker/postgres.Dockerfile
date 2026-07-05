# ============================================
# AxioVital PostgreSQL Dockerfile
# Extends official PostgreSQL with custom config
# ============================================

FROM postgres:16-alpine

# Copy custom initialization scripts
# COPY infrastructure/docker/postgres/init/ /docker-entrypoint-initdb.d/

ENV POSTGRES_DB=axiovital
ENV POSTGRES_USER=axiovital_user
ENV POSTGRES_PASSWORD=change-me-in-production

EXPOSE 5432
