import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@leadpilot/shared',
    '@leadpilot/db',
    '@leadpilot/sources',
    '@leadpilot/audit',
    '@leadpilot/scoring',
    '@leadpilot/email-gen',
  ],
  serverExternalPackages: ['argon2', '@prisma/client', 'prisma'],
};

export default nextConfig;
