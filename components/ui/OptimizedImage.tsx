'use client'

import { useState } from 'react'
import { Package } from 'lucide-react'

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
}

export function OptimizedImage({ src, alt, className = '' }: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  const handleError = () => {
    setImageError(true)
    setImageLoading(false)
  }

  const handleLoad = () => {
    setImageLoading(false)
  }

  if (imageError || !src) {
    return (
      <div className={`bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-2" />
          <p className="text-sm">Sin imagen</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {imageLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          <Package className="w-8 h-8 text-gray-300" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={handleError}
        onLoad={handleLoad}
      />
    </div>
  )
}