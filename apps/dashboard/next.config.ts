import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:3000/api/:path*',
      },
    ];
  },
  webpack(config: { module: { rules: unknown[] } }) {
    config.module.rules.push({
      test: /\.html$/i,
      resourceQuery: /raw/,
      type: 'asset/source',
    });
    return config;
  },
};

export default nextConfig;
