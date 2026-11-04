import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:3000/api/:path*',
      },
    ];
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.html$/i,
      resourceQuery: /raw/,
      type: 'asset/source',
    });
    return config;
  },
};

export default nextConfig;
