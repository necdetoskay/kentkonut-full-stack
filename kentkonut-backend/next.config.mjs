/** @type {import('next').NextConfig} */

const nextConfig = {
  // Temporarily disable React StrictMode to fix drag-and-drop issues
  reactStrictMode: false,

  // Enable standalone output for Docker
  output: 'standalone',

  // Disable ESLint/TypeScript checks locally, but enforce in CI
  eslint: {
    ignoreDuringBuilds: process.env.CI !== 'true',
  },

  typescript: {
    ignoreBuildErrors: process.env.CI !== 'true',
  },
  
  // Environment-based configuration using process.env directly
  serverRuntimeConfig: {
    hostname: process.env.HOST || 'localhost',
    port: parseInt(process.env.PORT) || 3021
  },
  publicRuntimeConfig: {
    hostname: process.env.HOST || 'localhost',
    port: parseInt(process.env.PORT) || 3021
  },
  
  // Enable TinyMCE to load from cloud with API key and optimize images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.tiny.cloud',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Static file serving for custom folders
  async rewrites() {
    // Rewrites devre dışı: public/ altından doğal servisleme kullanılacak
    return [];
  },

  // CORS ayarları - Frontend ile backend arasında iletişim için
  async headers() {
    // Get frontend and API URLs from environment
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3020';
    const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3021';

    // Note: Global headers have limitations with multiple origins
    // Individual API routes now use CORS middleware for proper multi-origin support
    // For development, we'll rely on the CORS middleware in each route
    return [
      {
        // Tüm route'lar için güvenlik header'ları (CSP dahil)
        source: '/(.*)',
        headers: [
          // Development-friendly CSP that allows Next.js features
          {
            key: 'Content-Security-Policy',
            value: `default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; script-src * 'unsafe-inline' 'unsafe-eval'; connect-src 'self' ${frontendUrl} ${apiBaseUrl} * 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; frame-src *; style-src * 'unsafe-inline';`
          },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },

  webpack: (config, { isServer }) => {
    // Handle client-side fallbacks
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        crypto: false,
        stream: false,
        util: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }

    // Handle Sharp and other native modules
    config.externals = config.externals || [];
    if (isServer) {
      config.externals.push('sharp');
    }

    // Ignore node: protocol warnings
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        module: /node:/,
      },
      {
        message: /Reading from 'node:/,
      },
    ];

    return config;
  },

  // External packages for server components
  serverExternalPackages: ['sharp'],

  // Image optimization settings are merged with the TinyMCE settings above
};

export default nextConfig;
