'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from './useAuth'

export function useFavorites() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  // Cargar favoritos del usuario
  const loadFavorites = async () => {
    if (!user) {
      setFavorites([])
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('product_id')
        .eq('user_id', user.id)

      if (error) {
        console.error('Error loading favorites:', error)
        setFavorites([])
        return
      }

      setFavorites(data?.map(item => item.product_id) || [])
    } catch (error) {
      console.error('Error loading favorites:', error)
      setFavorites([])
    } finally {
      setLoading(false)
    }
  }

  // Agregar a favoritos
  const addToFavorites = async (productId: string) => {
    console.log('➕ addToFavorites called with:', { productId, userId: user?.id })
    
    if (!user) {
      console.log('❌ No user in addToFavorites')
      return false
    }

    setLoading(true)
    try {
      console.log('🔄 Inserting into favorites table...')
      const { error } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          product_id: productId
        })

      if (error) {
        console.error('❌ Error adding to favorites:', error)
        return false
      }

      console.log('✅ Successfully added to favorites')
      setFavorites(prev => [...prev, productId])
      return true
    } catch (error) {
      console.error('❌ Exception adding to favorites:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Eliminar de favoritos
  const removeFromFavorites = async (productId: string) => {
    if (!user) return false

    setLoading(true)
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId)

      if (error) {
        console.error('Error removing from favorites:', error)
        return false
      }

      setFavorites(prev => prev.filter(id => id !== productId))
      return true
    } catch (error) {
      console.error('Error removing from favorites:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Toggle favorito
  const toggleFavorite = async (productId: string) => {
    console.log('🔄 toggleFavorite called with:', { productId, user: user?.id, isFavorite: favorites.includes(productId) })
    
    if (!user) {
      console.log('❌ No user authenticated')
      return false
    }

    const isFavorite = favorites.includes(productId)
    console.log('📊 isFavorite before toggle:', isFavorite)
    
    if (isFavorite) {
      console.log('🗑️ Removing from favorites')
      const result = await removeFromFavorites(productId)
      console.log('🗑️ Remove result:', result)
      return result
    } else {
      console.log('❤️ Adding to favorites')
      const result = await addToFavorites(productId)
      console.log('❤️ Add result:', result)
      return result
    }
  }

  // Verificar si un producto es favorito
  const isFavorite = (productId: string) => {
    return favorites.includes(productId)
  }

  // Cargar favoritos cuando cambie el usuario
  useEffect(() => {
    loadFavorites()
  }, [user])

  return {
    favorites,
    loading,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    loadFavorites
  }
}
