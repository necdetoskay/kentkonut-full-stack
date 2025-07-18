/** @type {import('next').NextConfig} */
const nextConfig = {
  // Temporarily disable React StrictMode to fix drag-and-drop issues
  reactStrictMode: false,
  
  // Disable ESLint during builds temporarily 
  eslint: {
    ignoreDuringBuilds: true,
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
    // credentials: 'include' ile çalışması için specific origin gerekli
    const allowedOrigin = process.env.NODE_ENV === 'development'
      ? 'http://localhost:3001'  // Development'ta frontend origin
      : (process.env.CORS_ALLOWED_ORIGIN || 'http://localhost:3001');
    return [
      {
        // API routes için CORS ayarları
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: allowedOrigin },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
        ],
      },
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
