'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from './useAuth'

export function useFavorites() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<string[]>([])

  // Función helper para leer de localStorage
  const getFavoritesFromLocalStorage = useCallback((): string[] => {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem('favorites')
      if (!stored) return []
      return JSON.parse(stored)
    } catch {
      return []
    }
  }, [])

  // Inicializar favorites al montar
  useEffect(() => {
    const stored = getFavoritesFromLocalStorage()
    setFavorites(stored)
    console.log('📦 Initial favorites loaded:', stored)
  }, [getFavoritesFromLocalStorage])

  // Toggle favorito - SIMPLE y ROBUSTO
  const toggleFavorite = useCallback(async (productId: string): Promise<boolean> => {
    console.log('🔄 toggleFavorite called', { productId })
    
    // Usar función de actualización para leer el estado MÁS RECIENTE
    setFavorites(current => {
      const isFavorite = current.includes(productId)
      console.log('❤️ Is favorite?', isFavorite, 'Current:', current)
      
      let newFavorites: string[]
      if (isFavorite) {
        // Quitar
        newFavorites = current.filter(id => id !== productId)
        console.log('🗑️ Removing:', productId, 'New:', newFavorites)
      } else {
        // Agregar
        newFavorites = [...current, productId]
        console.log('➕ Adding:', productId, 'New:', newFavorites)
      }
      
      // Actualizar localStorage con el nuevo estado
      if (typeof window !== 'undefined') {
        localStorage.setItem('favorites', JSON.stringify(newFavorites))
        console.log('💾 Saved to localStorage:', newFavorites)
      }
      
      // Sincronizar con DB en background (no esperar)
      if (user) {
        if (isFavorite) {
          supabase
            .from('favorites')
            .delete()
            .eq('user_id', user.id)
            .eq('product_id', productId)
            .then(({ error }) => {
              if (error) console.log('⚠️ DB delete error:', error.message)
              else console.log('✅ Removed from DB')
            })
        } else {
          supabase
            .from('favorites')
            .insert({ user_id: user.id, product_id: productId })
            .then(({ error }) => {
              if (error) console.log('⚠️ DB insert error:', error.message)
              else console.log('✅ Added to DB')
            })
        }
      }
      
      return newFavorites
    })
    
    return true
  }, [user])

  // Verificar si es favorito
  const isFavorite = useCallback((productId: string): boolean => {
    return favorites.includes(productId)
  }, [favorites])

  // Funciones legacy
  const addToFavorites = async (productId: string) => {
    return toggleFavorite(productId)
  }

  const removeFromFavorites = async (productId: string) => {
    return toggleFavorite(productId)
  }

  const loadFavorites = useCallback(() => {
    const stored = getFavoritesFromLocalStorage()
    setFavorites(stored)
  }, [getFavoritesFromLocalStorage])

  return {
    favorites,
    loading: false,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    loadFavorites
  }
}
