import type { NextConfig } from 'next';

const repoBasePath = process.env.NEXT_PUBLIC_BASE_PATH || '/fitnizone';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  basePath: repoBasePath,
  assetPrefix: `${repoBasePath}/`,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost' }
    ]
  }
};

export default nextConfig;