import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { IStorageService, UploadFileParams, UploadFileResult } from './storage.interface';

@Injectable()
export class MinioStorageService implements IStorageService, OnModuleInit {
  private readonly logger = new Logger(MinioStorageService.name);
  private readonly client: Minio.Client;

  constructor(private readonly configService: ConfigService) {
    this.client = new Minio.Client({
      endPoint: this.configService.get<string>('minio.endpoint', 'localhost'),
      port: this.configService.get<number>('minio.port', 9000),
      accessKey: this.configService.get<string>('minio.accessKey', 'axiovital_minio'),
      secretKey: this.configService.get<string>('minio.secretKey', 'change-me-in-production'),
      useSSL: this.configService.get<boolean>('minio.useSSL', false),
    });
  }

  async onModuleInit(): Promise<void> {
    try { await this.client.listBuckets(); this.logger.log('MinIO connection verified.'); }
    catch (e) { this.logger.warn(`MinIO not reachable at startup (non-fatal): ${(e as Error).message}`); }
  }

  async uploadFile(params: UploadFileParams): Promise<UploadFileResult> {
    const { bucket, objectKey, data, mimeType, metadata } = params;
    const result = await this.client.putObject(bucket, objectKey, data as Buffer, undefined, { 'Content-Type': mimeType, ...metadata });
    this.logger.log(`File uploaded: ${bucket}/${objectKey} (etag: ${result.etag})`);
    return { bucket, objectKey, etag: result.etag, versionId: result.versionId ?? undefined };
  }

  async getPresignedUrl(bucket: string, objectKey: string, expirySeconds = 3600): Promise<string> {
    return this.client.presignedGetObject(bucket, objectKey, expirySeconds);
  }

  async getPresignedUploadUrl(bucket: string, objectKey: string, expirySeconds = 3600): Promise<string> {
    return this.client.presignedPutObject(bucket, objectKey, expirySeconds);
  }

  async deleteFile(bucket: string, objectKey: string): Promise<void> {
    await this.client.removeObject(bucket, objectKey);
  }

  async isHealthy(): Promise<boolean> {
    try { await this.client.listBuckets(); return true; } catch { return false; }
  }
}
