import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { LayoutWrapper } from '@/components/layout-wrapper'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  colorScheme: 'light',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#7B3FBD' },
    { media: '(prefers-color-scheme: dark)', color: '#8B5CF6' },
  ],
}

export const metadata: Metadata = {
  title: 'Zingarito Kids - Ventas Mayoristas de Ropa Infantil',
  description: 'Ventas mayoristas de ropa infantil de diseño sin género desde Villa Ramallo, Buenos Aires. Empresa familiar especializada en comercios mayoristas.',
  keywords: [
    'zingarito kids',
    'ropa infantil',
    'tienda mayorista',
    'ropa para niños',
    'ropa para niñas',
    'mayorista argentina',
    'villa ramallo',
    'buenos aires'
  ],
  authors: [{ name: 'Zingarito Kids' }],
  creator: 'Zingarito Kids',
  publisher: 'Zingarito Kids',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Zingarito Kids - Tienda Mayorista de Ropa Infantil',
    description: 'Tienda mayorista especializada en ropa infantil de calidad. Productos para niños y niñas con compra mínima de 5 unidades.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    siteName: 'Zingarito Kids',
    images: [
      {
        url: '/logos/zingarito-kids-color.svg',
        width: 1200,
        height: 630,
        alt: 'Zingarito Kids Logo',
      },
    ],
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zingarito Kids - Tienda Mayorista de Ropa Infantil',
    description: 'Tienda mayorista especializada en ropa infantil de calidad.',
    images: ['/logos/zingarito-kids-color.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'tu-google-verification-code',
  },
  category: 'ecommerce',
  classification: 'Tienda Mayorista',
  referrer: 'origin-when-cross-origin',
  icons: {
    icon: [
      { url: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '16x16 32x32', type: 'image/x-icon' },
    ],
    apple: [
      { url: '/favicon.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
  },
  other: {
    'msapplication-TileColor': '#7B3FBD',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  )
}