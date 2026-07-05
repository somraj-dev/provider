#!/bin/bash
# ============================================
# AxioVital Database Backup Script
# ============================================
# Usage: ./backup.sh [database_name] [output_dir]

set -euo pipefail

DB_NAME="${1:-axiovital}"
OUTPUT_DIR="${2:-./}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${OUTPUT_DIR}/${DB_NAME}_${TIMESTAMP}.sql.gz"

echo "Starting backup of database: ${DB_NAME}"
echo "Output: ${BACKUP_FILE}"

# TODO: Configure connection parameters via environment variables
# pg_dump -h "${DATABASE_HOST}" -p "${DATABASE_PORT}" -U "${DATABASE_USER}" "${DB_NAME}" | gzip > "${BACKUP_FILE}"

echo "Backup placeholder — configure pg_dump connection parameters before use."
echo "Backup script completed."
