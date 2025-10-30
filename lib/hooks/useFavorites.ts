'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client-fixed'
import { useAuth } from './useAuth'

export function useFavorites() {
  const { user, isAuthenticated } = useAuth()
  const [favorites, setFavorites] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Cargar favoritos desde la base de datos
  const loadFavoritesFromDB = useCallback(async () => {
    if (!user || !isAuthenticated) {
      setFavorites([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('favorites')
        .select('product_id')
        .eq('user_id', user.id)

      if (error) {
        // Si la tabla no existe o hay error, intentar localStorage
        if (error.code === '42P01' || error.code === 'PGRST116' || error.message?.includes('does not exist')) {
          // No hacer nada, ya que el finally va a setear loading a false
        }
        setFavorites([])
      } else {
        const productIds = data?.map(fav => fav.product_id) || []
        setFavorites(productIds)
        
        // Sincronizar con localStorage como backup
        if (typeof window !== 'undefined') {
          localStorage.setItem('favorites', JSON.stringify(productIds))
        }
      }
    } catch (error) {
      // No loggear errores de favoritos
      setFavorites([])
    } finally {
      setLoading(false)
    }
  }, [user, isAuthenticated])

  // Cargar favoritos cuando el usuario inicia sesión o cambia
  useEffect(() => {
    if (isAuthenticated && user) {
      loadFavoritesFromDB()
    } else {
      // Si no está autenticado, leer de localStorage como backup
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('favorites')
          if (stored) {
            const parsed = JSON.parse(stored)
            setFavorites(Array.isArray(parsed) ? parsed : [])
          } else {
            setFavorites([])
          }
        } catch {
          setFavorites([])
        }
      } else {
        setFavorites([])
      }
      setLoading(false)
    }
  }, [isAuthenticated, user, loadFavoritesFromDB])

  // Agregar a favoritos
  const addToFavorites = useCallback(async (productId: string): Promise<boolean> => {
    if (!isAuthenticated || !user) {
      console.warn('Usuario no autenticado, no se puede agregar a favoritos')
      return false
    }

    try {
      // Verificar si ya es favorito
      if (favorites.includes(productId)) {
        return true
      }

      // Insertar en la base de datos
      const { error } = await supabase
        .from('favorites')
        .insert({ 
          user_id: user.id, 
          product_id: productId 
        })

      if (error && error.code !== '23505') {
        // Si es error de duplicado (23505), no es problema
        // Si la tabla no existe, continuar con localStorage
        if (error.code === '42P01' || error.code === 'PGRST116') {
          // Tabla no existe, solo usar localStorage
        } else {
          throw error
        }
      }

      // Actualizar estado local
      setFavorites(prev => {
        const newFavorites = [...prev, productId]
        // Actualizar localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('favorites', JSON.stringify(newFavorites))
        }
        return newFavorites
      })

      return true
    } catch (error) {
      console.error('Error in addToFavorites:', error)
      return false
    }
  }, [user, isAuthenticated, favorites])

  // Eliminar de favoritos (permanentemente)
  const removeFromFavorites = useCallback(async (productId: string): Promise<boolean> => {
    if (!isAuthenticated || !user) {
      console.warn('Usuario no autenticado, no se puede eliminar de favoritos')
      return false
    }

    try {
      // Eliminar de la base de datos permanentemente
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId)

      if (error) {
        // Si la tabla no existe, continuar solo con localStorage
        if (error.code === '42P01' || error.code === 'PGRST116') {
          // Tabla no existe, solo usar localStorage
        } else {
          throw error
        }
      }

      // Actualizar estado local
      setFavorites(prev => {
        const newFavorites = prev.filter(id => id !== productId)
        // Actualizar localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('favorites', JSON.stringify(newFavorites))
        }
        return newFavorites
      })

      return true
    } catch (error) {
      console.error('Error in removeFromFavorites:', error)
      return false
    }
  }, [user, isAuthenticated])

  // Toggle favorito (agregar o eliminar)
  const toggleFavorite = useCallback(async (productId: string): Promise<boolean> => {
    const isFavorite = favorites.includes(productId)
    
    if (isFavorite) {
      return await removeFromFavorites(productId)
    } else {
      return await addToFavorites(productId)
    }
  }, [favorites, addToFavorites, removeFromFavorites])

  // Verificar si es favorito
  const isFavorite = useCallback((productId: string): boolean => {
    return favorites.includes(productId)
  }, [favorites])

  return {
    favorites,
    loading,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    loadFavorites: loadFavoritesFromDB
  }
}
