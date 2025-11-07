'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import { Plus, X } from 'lucide-react'
import { toast } from 'sonner'

interface AddCustomSizeProps {
  onSizeAdded: (sizeName: string) => void
  existingSizes: string[]
}

export function AddCustomSize({ onSizeAdded, existingSizes }: AddCustomSizeProps) {
  const [showForm, setShowForm] = useState(false)
  const [sizeName, setSizeName] = useState('')
  const [sizeType, setSizeType] = useState<'BEBES' | 'NINOS' | 'ADULTOS' | 'ZAPATOS' | 'OTROS'>('OTROS')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!sizeName.trim()) {
      toast.error('El nombre de la talla es obligatorio')
      return
    }

    // Verificar si la talla ya existe
    if (existingSizes.some(s => s.toLowerCase() === sizeName.trim().toLowerCase())) {
      toast.error('Esta talla ya existe')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('custom_sizes')
        .insert({
          name: sizeName.trim(),
          size_type: sizeType
        })

      if (error) {
        // Si el error es por duplicado, aún así lo agregamos a la lista
        if (error.code === '23505') {
          toast.warning('Esta talla ya existe en la base de datos')
        } else {
          throw error
        }
      } else {
        toast.success('Talla agregada exitosamente')
      }

      // Llamar callback para agregar la talla a la lista
      onSizeAdded(sizeName.trim())
      
      // Limpiar formulario
      setSizeName('')
      setSizeType('OTROS')
      setShowForm(false)
    } catch (error: any) {
      console.error('Error agregando talla:', error)
      toast.error('Error al agregar talla: ' + (error.message || 'Error desconocido'))
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
        Agregar Talla Personalizada
      </Button>
    )
  }

  return (
    <div className="border rounded-lg p-4 bg-gray-50 mt-2">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold">Agregar Talla Personalizada</h4>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setShowForm(false)
            setSizeName('')
            setSizeType('OTROS')
          }}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Nombre de la Talla *
          </label>
          <Input
            value={sizeName}
            onChange={(e) => setSizeName(e.target.value)}
            placeholder="Ej: 3XL, 0, etc."
            required
            className="text-sm"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Tipo de Talla
          </label>
          <Select value={sizeType} onValueChange={(value: any) => setSizeType(value)}>
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BEBES">Bebés</SelectItem>
              <SelectItem value="NINOS">Niños</SelectItem>
              <SelectItem value="ADULTOS">Adultos</SelectItem>
              <SelectItem value="ZAPATOS">Zapatos</SelectItem>
              <SelectItem value="OTROS">Otros</SelectItem>
            </SelectContent>
          </Select>
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
              setSizeName('')
              setSizeType('OTROS')
            }}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}

