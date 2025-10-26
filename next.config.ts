import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Configuración básica
  reactStrictMode: true,
  
  // Configuración de imágenes
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Configuración de headers de seguridad
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ]
  },
  
  // Configuración de redirecciones
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: false,
      },
    ]
  },
  
  // Configuración de rewrites
  async rewrites() {
    return [
      {
        source: '/api/supabase/:path*',
        destination: `https://hjlmrphltpsibkzfcgvu.supabase.co/rest/v1/:path*`,
      },
    ]
  },
  
  // Configuración de variables de entorno
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Configuración de webpack
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Configuración personalizada de webpack si es necesario
    return config
  },
  
  // Configuración de experimental features
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  // Configuración de output
  output: 'standalone',
  
  // Configuración de trailing slash
  trailingSlash: false,
  
  // Configuración de poweredByHeader
  poweredByHeader: false,
  
  // Configuración de compress
  compress: true,
  
  // Configuración de generateEtags
  generateEtags: true,
  
  // Configuración de pageExtensions
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  
  // Configuración de distDir
  distDir: '.next',
  
  // Configuración de assetPrefix
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://zingaritokids.com' : '',
  
  // Configuración de basePath
  basePath: '',
  
  
  // Configuración de onDemandEntries
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  
  // Configuración de typescript
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Configuración de eslint
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // Configuración de bundle analyzer
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config: any) => {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: './analyze/client.html',
        })
      )
      return config
    },
  }),
}

export default nextConfig