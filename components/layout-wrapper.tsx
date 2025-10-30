'use client'

import { ErrorBoundary } from '@/components/ui/error-boundary'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Toaster } from 'sonner'

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Navbar />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
      <Toaster 
        position="top-right"
        expand={true}
        richColors={true}
        closeButton={true}
        duration={4000}
      />
    </ErrorBoundary>
  )
}

