/** @type {import('next').NextConfig} */
const nextConfig = {
  // Temporarily disable React StrictMode to fix drag-and-drop issues
  reactStrictMode: false,
  
  // Disable ESLint during builds temporarily
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable TypeScript checking during builds temporarily
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Enable TinyMCE to load from cloud with API key and optimize images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.tiny.cloud',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // CORS ayarları - Frontend ile backend arasında iletişim için
  async headers() {
    // Get allowed origins from environment or use development defaults
    const getAllowedOrigins = () => {
      if (process.env.NODE_ENV === 'development') {
        // Development: Allow common frontend ports
        return ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'];
      }

      // Production: Use environment variable
      const envOrigins = process.env.CORS_ALLOWED_ORIGIN;
      if (envOrigins) {
        return envOrigins.split(',').map(origin => origin.trim());
      }

      // Fallback (should not be used in production)
      return ['http://localhost:3001'];
    };

    const allowedOrigins = getAllowedOrigins();
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
            value: process.env.NODE_ENV === 'development'
              ? "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; img-src 'self' data: blob: https:; style-src 'self' 'unsafe-inline'; font-src 'self' https:; connect-src 'self' https: ws: wss:;"
              : "default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; img-src 'self' data: blob: https:; style-src 'self' 'unsafe-inline'; font-src 'self' https:; connect-src 'self' https:;"
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

module.exports = nextConfig;
