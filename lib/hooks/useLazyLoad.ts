'use client'

import { useEffect, useState, useRef } from 'react'

interface UseLazyLoadOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

export function useLazyLoad(options: UseLazyLoadOptions = {}) {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    triggerOnce = true,
  } = options

  const [isVisible, setIsVisible] = useState(false)
  const [hasTriggered, setHasTriggered] = useState(false)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true)
          if (triggerOnce) {
            setHasTriggered(true)
          }
        } else if (!triggerOnce) {
          setIsVisible(false)
        }
      },
      {
        threshold,
        rootMargin,
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [threshold, rootMargin, triggerOnce])

  return {
    ref,
    isVisible: triggerOnce ? (hasTriggered || isVisible) : isVisible,
  }
}

// Hook para lazy loading de imágenes
export function useLazyImage(src: string, options: UseLazyLoadOptions = {}) {
  const { ref, isVisible } = useLazyLoad(options)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (isVisible && !imageSrc && !isLoading) {
      setIsLoading(true)
      setHasError(false)
      
      const img = new Image()
      img.onload = () => {
        setImageSrc(src)
        setIsLoading(false)
      }
      img.onerror = () => {
        setHasError(true)
        setIsLoading(false)
      }
      img.src = src
    }
  }, [isVisible, src, imageSrc, isLoading])

  return {
    ref,
    src: imageSrc,
    isLoading,
    hasError,
    isVisible,
  }
}

// Hook para lazy loading de componentes
export function useLazyComponent(options: UseLazyLoadOptions = {}) {
  const { ref, isVisible } = useLazyLoad(options)
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    if (isVisible && !shouldRender) {
      setShouldRender(true)
    }
  }, [isVisible, shouldRender])

  return {
    ref,
    shouldRender,
    isVisible,
  }
}
