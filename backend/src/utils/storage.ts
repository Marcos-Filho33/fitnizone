import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../lib/env';

const localUploadDir = path.resolve(env.uploadPath);

const s3Client = env.awsAccessKeyId && env.awsSecretAccessKey && env.s3BucketName
  ? new S3Client({
      region: env.awsRegion,
      credentials: {
        accessKeyId: env.awsAccessKeyId,
        secretAccessKey: env.awsSecretAccessKey
      }
    })
  : null;

export async function saveUpload(file: Express.Multer.File): Promise<{ url: string; key: string }> {
  const key = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;

  if (s3Client && env.s3BucketName) {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: env.s3BucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read'
      })
    );

    return {
      url: `https://${env.s3BucketName}.s3.${env.awsRegion}.amazonaws.com/${key}`,
      key
    };
  }

  fs.mkdirSync(localUploadDir, { recursive: true });
  const filePath = path.join(localUploadDir, key);
  fs.writeFileSync(filePath, file.buffer);

  return {
    url: `/uploads/${key}`,
    key
  };
}
