#!/bin/sh
# ============================================
# MinIO Bucket Initialization Script
# Creates default buckets on first startup
# ============================================

set -e

# Wait for MinIO to become available
until mc alias set axiovital http://minio:9000 ${MINIO_ROOT_USER} ${MINIO_ROOT_PASSWORD} 2>/dev/null; do
  echo "Waiting for MinIO to start..."
  sleep 2
done

# Create buckets with versioning enabled
for BUCKET in medical-images clinical-documents lab-reports prescriptions patient-media audit-exports; do
  mc mb --ignore-existing axiovital/${BUCKET}
  mc version enable axiovital/${BUCKET}
  echo "Bucket '${BUCKET}' created with versioning enabled."
done

# Set lifecycle policy for audit-exports (90 day retention)
mc ilm import axiovital/audit-exports <<EOF
{
  "Rules": [
    {
      "ID": "audit-retention-90d",
      "Status": "Enabled",
      "Expiration": {
        "Days": 90
      }
    }
  ]
}
EOF

echo "MinIO initialization complete."
