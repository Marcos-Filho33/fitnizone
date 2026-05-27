export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'dev-jwt-secret',
  refreshSecret: process.env.REFRESH_SECRET || 'dev-refresh-secret',
  systemAdminEmail: process.env.SYSTEM_ADMIN_EMAIL || 'admin@fitzone.com.br',
  systemAdminPassword: process.env.SYSTEM_ADMIN_PASSWORD || 'Admin@123',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS || 12),
  csrfSecret: process.env.CSRF_SECRET || 'dev-csrf-secret',
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  awsRegion: process.env.AWS_REGION || 'us-east-1',
  s3BucketName: process.env.S3_BUCKET_NAME || '',
  uploadPath: process.env.UPLOAD_PATH || './uploads',
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX || 100)
};
