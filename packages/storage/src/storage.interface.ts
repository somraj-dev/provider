export interface IStorageService {
  uploadFile(params: UploadFileParams): Promise<UploadFileResult>;
  getPresignedUrl(bucket: string, objectKey: string, expirySeconds?: number): Promise<string>;
  getPresignedUploadUrl(bucket: string, objectKey: string, expirySeconds?: number): Promise<string>;
  deleteFile(bucket: string, objectKey: string): Promise<void>;
  isHealthy(): Promise<boolean>;
}

export interface UploadFileParams {
  bucket: string;
  objectKey: string;
  data: Buffer | ReadableStream;
  mimeType: string;
  metadata?: Record<string, string>;
}

export interface UploadFileResult {
  bucket: string;
  objectKey: string;
  etag: string;
  versionId?: string;
}

export const STORAGE_SERVICE = Symbol('IStorageService');
