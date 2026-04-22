import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Otimizações de performance
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error"] }
        : false,
  },
  
  // Transpilar pacotes que precisam ser processados
  transpilePackages: [
    '@solana/web3.js',
    '@solana/wallet-adapter-base',
    '@solana/wallet-adapter-react',
    '@solana/wallet-adapter-react-ui',
    '@solana/wallet-adapter-phantom',
    '@solana/spl-token',
    '@wagmi/core',
    '@wagmi/connectors',
    'wagmi',
    'viem',
    '@mysten/wallet-kit',
    '@headlessui/react',
  ],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.coingecko.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  eslint: {
    // Desabilita o linting durante o build para permitir deploy
    ignoreDuringBuilds: true,
  },
  
  typescript: {
    // Desabilita a verificação de tipos durante o build
    ignoreBuildErrors: true,
  },
  
  turbopack: {
    // Configurações do Turbopack (Next.js 15)
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Otimizações experimentais
  experimental: {
    optimizePackageImports: [
      'react-icons',
      'react-icons/fa',
      'react-icons/fa6',
      'react-icons/fi',
      'react-icons/md',
      '@solana/wallet-adapter-react',
      '@solana/wallet-adapter-react-ui',
    ],
  },
  
  webpack: (config, { isServer, webpack }) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    // Ignorar dependências do React Native que não são necessárias no ambiente web
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^@react-native-async-storage\/async-storage$/,
      })
    );

    // Otimizações de performance
    if (!isServer) {
      // Reduzir o tamanho do bundle
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Separar bibliotecas pesadas em chunks próprios
            solana: {
              test: /[\\/]node_modules[\\/](@solana|@solana-wallet-adapter)[\\/]/,
              name: 'solana',
              priority: 30,
              reuseExistingChunk: true,
            },
            wagmi: {
              test: /[\\/]node_modules[\\/](wagmi|@wagmi|viem)[\\/]/,
              name: 'wagmi',
              priority: 30,
              reuseExistingChunk: true,
            },
            reactIcons: {
              test: /[\\/]node_modules[\\/]react-icons[\\/]/,
              name: 'react-icons',
              priority: 20,
              reuseExistingChunk: true,
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: 10,
              reuseExistingChunk: true,
            },
          },
        },
      };

      config.resolve.fallback = {
        ...config.resolve.fallback,
        '@react-native-async-storage/async-storage': false,
        // Otimizar fallbacks para reduzir bundle
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }

    // Resolver dependências do React Native que não são necessárias no ambiente web
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': path.resolve(
        __dirname,
        'src/lib/stubs/async-storage.ts'
      ),
    };

    return config;
  },
};

export default nextConfig;
