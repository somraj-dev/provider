# ============================================
# AxioVital MinIO (S3-compatible) Dockerfile
# Object storage for DICOM, PDFs, media files
# ============================================

FROM minio/minio:latest

ENV MINIO_ROOT_USER=axiovital_minio
ENV MINIO_ROOT_PASSWORD=change-me-in-production

EXPOSE 9000 9001

CMD ["server", "/data", "--console-address", ":9001"]
