import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Compile TypeScript source from workspace packages (not pre-built dist)
  transpilePackages: [
    '@leadpilot/shared',
    '@leadpilot/db',
    '@leadpilot/sources',
    '@leadpilot/audit',
    '@leadpilot/scoring',
  ],
  // Native / server-only modules must not be bundled into the client
  serverExternalPackages: ['argon2', '@prisma/client', 'prisma'],
};

export default nextConfig;
