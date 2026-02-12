/**
 * S3-compatible storage (MinIO locally, AWS S3 in production).
 * Uses env: S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY, S3_SECRET_KEY, S3_REGION, S3_PUBLIC_BASE_URL.
 */

import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3';

const MB = 1024 * 1024;

function getConfig() {
  const endpoint = process.env.S3_ENDPOINT;
  const bucket = process.env.S3_BUCKET;
  const accessKey = process.env.S3_ACCESS_KEY;
  const secretKey = process.env.S3_SECRET_KEY;
  if (!bucket || !accessKey || !secretKey) return null;
  return {
    endpoint: endpoint || undefined,
    bucket,
    accessKey,
    secretKey,
    region: process.env.S3_REGION || 'us-east-1',
    forcePathStyle: true,
    publicBaseUrl: process.env.S3_PUBLIC_BASE_URL || endpoint || `https://${bucket}.s3.amazonaws.com`
  };
}

let cachedClient: S3Client | null = null;

export function getS3Client(): S3Client | null {
  const config = getConfig();
  if (!config) return null;
  if (cachedClient) return cachedClient;
  cachedClient = new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKey,
      secretAccessKey: config.secretKey
    },
    forcePathStyle: true
  });
  return cachedClient;
}

export function isStorageConfigured(): boolean {
  return getConfig() !== null;
}

/** Ensure the bucket exists; create it if not (e.g. minio-init didn't run). Optionally set public read when using MinIO. */
async function ensureBucket(
  client: S3Client,
  bucket: string,
  _region: string,
  isMinio: boolean
): Promise<void> {
  try {
    await client.send(new HeadBucketCommand({ Bucket: bucket }));
  } catch (err: unknown) {
    const code = err && typeof err === 'object' && 'name' in err ? (err as { name: string }).name : '';
    const statusCode = err && typeof err === 'object' && '$metadata' in err
      ? (err as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode : 0;
    if (code === 'NotFound' || code === 'NoSuchBucket' || statusCode === 404) {
      await client.send(new CreateBucketCommand({ Bucket: bucket }));
      if (isMinio) {
        const policy = JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Sid: '',
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${bucket}/*`]
            }
          ]
        });
        await client.send(new PutBucketPolicyCommand({ Bucket: bucket, Policy: policy }));
      }
    } else {
      throw err;
    }
  }
}

/**
 * Upload a buffer to S3/MinIO. Returns the public URL of the object.
 * Key should be e.g. "avatars/{userId}/{filename}".
 * Creates the bucket if it does not exist.
 */
export async function uploadToS3(params: {
  key: string;
  body: Buffer;
  contentType: string;
  bucket?: string;
}): Promise<string | null> {
  const config = getConfig();
  const client = getS3Client();
  if (!config || !client) return null;
  const bucket = params.bucket ?? config.bucket;
  await ensureBucket(client, bucket, config.region, !!config.endpoint);
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: params.key,
    Body: params.body,
    ContentType: params.contentType
  });
  const UPLOAD_TIMEOUT_MS = 30_000;
  await Promise.race([
    client.send(command),
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error('Upload timed out. Check storage (MinIO/S3) is running and reachable.')),
        UPLOAD_TIMEOUT_MS
      )
    )
  ]);
  // MinIO: http://localhost:9000/bucket/key. AWS: S3_PUBLIC_BASE_URL or virtual-hosted style.
  const base = config.publicBaseUrl.replace(/\/$/, '');
  if (config.endpoint) {
    return `${base}/${bucket}/${params.key}`;
  }
  return `https://${bucket}.s3.${config.region}.amazonaws.com/${params.key}`;
}

export const MAX_AVATAR_SIZE = 5 * MB;
export const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
