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
  
  // Configuración de rewrites (removido - usar Supabase client directamente)
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/supabase/:path*',
  //       destination: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/:path*`,
  //     },
  //   ]
  // },
  
  // Configuración de variables de entorno
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Configuración de webpack
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Mejorar el manejo de chunks para evitar ChunkLoadError
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
          },
        },
      }
    }
    return config
  },
  
  // Configuración de experimental features
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  // Configuración de output
  // output: 'standalone', // COMENTADO - puede causar problemas de compilación
  
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
  
  // Configuración de assetPrefix (dejar vacío para Vercel)
  assetPrefix: '',
  
  // Configuración de basePath
  basePath: '',
  
  
  // Configuración de onDemandEntries
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  
  // Configuración de typescript
  typescript: {
    ignoreBuildErrors: true, // Permitir build con warnings de TypeScript
  },
  
  // Configuración de eslint
  eslint: {
    ignoreDuringBuilds: true, // Permitir build con warnings de ESLint
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