import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  name: process.env.APP_NAME || 'axiovital-backend',
  version: process.env.APP_VERSION || '0.1.0',
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  host: process.env.HOST || '0.0.0.0',
  corsOrigins: process.env.CORS_ORIGINS?.split(',').map((o) => o.trim()) || [
    'http://localhost:3000',
  ],
}));

export const databaseConfig = registerAs('database', () => ({
  url: process.env.DATABASE_URL,
}));

export const redisConfig = registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
}));

export const minioConfig = registerAs('minio', () => ({
  endpoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000', 10),
  accessKey: process.env.MINIO_ACCESS_KEY || 'axiovital_minio',
  secretKey: process.env.MINIO_SECRET_KEY || 'change-me-in-production',
  useSSL: process.env.MINIO_USE_SSL === 'true',
  buckets: {
    medicalImages: process.env.MINIO_BUCKET_MEDICAL_IMAGES || 'medical-images',
    clinicalDocuments: process.env.MINIO_BUCKET_CLINICAL_DOCUMENTS || 'clinical-documents',
    labReports: process.env.MINIO_BUCKET_LAB_REPORTS || 'lab-reports',
    prescriptions: process.env.MINIO_BUCKET_PRESCRIPTIONS || 'prescriptions',
    patientMedia: process.env.MINIO_BUCKET_PATIENT_MEDIA || 'patient-media',
  },
}));

export const kafkaConfig = registerAs('kafka', () => ({
  brokers: (process.env.KAFKA_BROKERS || 'localhost:19092').split(',').map((b) => b.trim()),
  clientId: process.env.KAFKA_CLIENT_ID || 'axiovital-backend',
  consumerGroup: process.env.KAFKA_CONSUMER_GROUP || 'axiovital-backend-group',
}));

export const opensearchConfig = registerAs('opensearch', () => ({
  node: process.env.OPENSEARCH_NODE || 'http://localhost:9200',
  username: process.env.OPENSEARCH_USERNAME || undefined,
  password: process.env.OPENSEARCH_PASSWORD || undefined,
}));

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'change-me-in-production',
  expiresIn: parseInt(process.env.JWT_EXPIRATION || '3600', 10),
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'change-me-refresh-in-production',
  refreshExpiresIn: parseInt(process.env.JWT_REFRESH_EXPIRATION || '604800', 10),
}));

export const logConfig = registerAs('log', () => ({
  level: process.env.LOG_LEVEL || 'debug',
}));
