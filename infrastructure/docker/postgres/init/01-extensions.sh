#!/bin/bash
# ============================================
# AxioVital PostgreSQL Initialization Script
# Runs on first container startup only
# ============================================

set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Enable required extensions
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "vector";
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    CREATE EXTENSION IF NOT EXISTS "pg_trgm";

    -- Log successful initialization
    DO \$\$
    BEGIN
        RAISE NOTICE 'AxioVital PostgreSQL initialized with extensions: uuid-ossp, vector, pgcrypto, pg_trgm';
    END
    \$\$;
EOSQL
