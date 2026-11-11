import type { NextConfig } from 'next';
import path from 'node:path';

type WebpackConfig = {
  resolve: {
    alias: Record<string, unknown>;
    extensions: string[];
  };
};

const nextConfig: NextConfig = {
  transpilePackages: ['react-native-svg', 'react-native-web'],
  webpack(config: WebpackConfig) {
    config.resolve.extensions = [
      '.web.tsx',
      '.web.ts',
      '.web.js',
      ...config.resolve.extensions,
    ];
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-native$': 'react-native-web',
      '@react-native/assets-registry/registry$': path.resolve(
        'lib/assets-registry.web.ts',
      ),
    };
    return config;
  },
};

export default nextConfig;
