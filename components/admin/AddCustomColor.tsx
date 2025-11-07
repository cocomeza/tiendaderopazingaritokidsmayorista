'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase/client'
import { Plus, X } from 'lucide-react'
import { toast } from 'sonner'

interface AddCustomColorProps {
  onColorAdded: (colorName: string) => void
  existingColors: string[]
}

export function AddCustomColor({ onColorAdded, existingColors }: AddCustomColorProps) {
  const [showForm, setShowForm] = useState(false)
  const [colorName, setColorName] = useState('')
  const [hexCode, setHexCode] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!colorName.trim()) {
      toast.error('El nombre del color es obligatorio')
      return
    }

    // Verificar si el color ya existe
    if (existingColors.some(c => c.toLowerCase() === colorName.trim().toLowerCase())) {
      toast.error('Este color ya existe')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('custom_colors')
        .insert({
          name: colorName.trim(),
          hex_code: hexCode.trim() || null
        })

      if (error) {
        // Si el error es por duplicado, aún así lo agregamos a la lista
        if (error.code === '23505') {
          toast.warning('Este color ya existe en la base de datos')
        } else {
          throw error
        }
      } else {
        toast.success('Color agregado exitosamente')
      }

      // Llamar callback para agregar el color a la lista
      onColorAdded(colorName.trim())
      
      // Limpiar formulario
      setColorName('')
      setHexCode('')
      setShowForm(false)
    } catch (error: any) {
      console.error('Error agregando color:', error)
      toast.error('Error al agregar color: ' + (error.message || 'Error desconocido'))
    } finally {
      setLoading(false)
    }
  }

  if (!showForm) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setShowForm(true)}
        className="w-full mt-2"
      >
        <Plus className="w-4 h-4 mr-2" />
        Agregar Color Personalizado
      </Button>
    )
  }

  return (
    <div className="border rounded-lg p-4 bg-gray-50 mt-2">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold">Agregar Color Personalizado</h4>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setShowForm(false)
            setColorName('')
            setHexCode('')
          }}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Nombre del Color *
          </label>
          <Input
            value={colorName}
            onChange={(e) => setColorName(e.target.value)}
            placeholder="Ej: Turquesa, Coral, etc."
            required
            className="text-sm"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Código Hex (Opcional)
          </label>
          <Input
            value={hexCode}
            onChange={(e) => setHexCode(e.target.value)}
            placeholder="#FF5733"
            pattern="^#[0-9A-Fa-f]{6}$"
            className="text-sm"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            type="submit"
            size="sm"
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Agregando...' : 'Agregar'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setShowForm(false)
              setColorName('')
              setHexCode('')
            }}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}

