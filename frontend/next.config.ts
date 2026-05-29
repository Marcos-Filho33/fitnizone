import type { NextConfig } from 'next';

const isExportMode = process.env.NEXT_PUBLIC_EXPORT === 'true';
const repoBasePath = process.env.NEXT_PUBLIC_BASE_PATH || '/fitnizone';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  ...(isExportMode && {
    output: 'export',
    basePath: repoBasePath,
    assetPrefix: `${repoBasePath}/`,
  }),
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost' }
    ]
  }
};

export default nextConfig;