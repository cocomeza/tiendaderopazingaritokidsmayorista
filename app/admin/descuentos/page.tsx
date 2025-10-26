'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Save, AlertCircle, CheckCircle, Percent } from 'lucide-react'
import { supabase } from '@/lib/supabase/client-fixed'

interface DiscountRule {
  id?: string
  min_quantity: number
  max_quantity: number | null
  discount_percentage: number
  is_active: boolean
}

export default function DescuentosPage() {
  const [discountRules, setDiscountRules] = useState<DiscountRule[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    loadDiscountRules()
  }, [])

  const loadDiscountRules = async () => {
    try {
      const { data, error } = await supabase
        .from('discount_rules')
        .select('*')
        .order('min_quantity')

      if (error) throw error
      setDiscountRules(data || [])
    } catch (error) {
      console.error('Error loading discount rules:', error)
      setMessage({ type: 'error', text: 'Error al cargar las reglas de descuento' })
    }
  }

  const addNewRule = () => {
    const newRule: DiscountRule = {
      min_quantity: 1,
      max_quantity: null,
      discount_percentage: 0,
      is_active: true
    }
    setDiscountRules([...discountRules, newRule])
  }

  const updateRule = (index: number, field: keyof DiscountRule, value: any) => {
    const updatedRules = [...discountRules]
    updatedRules[index] = { ...updatedRules[index], [field]: value } as DiscountRule
    setDiscountRules(updatedRules)
  }

  const removeRule = (index: number) => {
    const updatedRules = discountRules.filter((_, i) => i !== index)
    setDiscountRules(updatedRules)
  }

  const saveDiscountRules = async () => {
    setLoading(true)
    setMessage(null)

    try {
      // Validar reglas
      for (const rule of discountRules) {
        if (rule.min_quantity <= 0) {
          throw new Error('La cantidad mínima debe ser mayor a 0')
        }
        if (rule.max_quantity && rule.max_quantity <= rule.min_quantity) {
          throw new Error('La cantidad máxima debe ser mayor a la mínima')
        }
        if (rule.discount_percentage < 0 || rule.discount_percentage > 50) {
          throw new Error('El descuento debe estar entre 0% y 50%')
        }
      }

      // Eliminar reglas existentes
      const { error: deleteError } = await supabase
        .from('discount_rules')
        .delete()
        .neq('id', '')

      if (deleteError) throw deleteError

      // Insertar nuevas reglas
      if (discountRules.length > 0) {
        const { error: insertError } = await supabase
          .from('discount_rules')
          .insert(discountRules.map(rule => ({
            min_quantity: rule.min_quantity,
            max_quantity: rule.max_quantity,
            discount_percentage: rule.discount_percentage,
            is_active: rule.is_active
          })))

        if (insertError) throw insertError
      }

      setMessage({ type: 'success', text: 'Escala de descuentos guardada exitosamente' })
      await loadDiscountRules()
    } catch (error: any) {
      console.error('Error saving discount rules:', error)
      setMessage({ type: 'error', text: error.message || 'Error al guardar las reglas de descuento' })
    } finally {
      setLoading(false)
    }
  }

  const getDiscountForQuantity = (quantity: number) => {
    const rule = discountRules
      .filter(r => r.is_active)
      .find(r => quantity >= r.min_quantity && (!r.max_quantity || quantity <= r.max_quantity))
    return rule ? rule.discount_percentage : 0
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Escala de Descuentos</h1>
          <p className="text-gray-600">Configura descuentos automáticos por cantidad de productos</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel de Control */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Percent className="w-5 h-5" />
                  Reglas de Descuento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {discountRules.map((rule, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-white">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <Label htmlFor={`min-${index}`}>Cantidad Mínima</Label>
                          <Input
                            id={`min-${index}`}
                            type="number"
                            min="1"
                            value={rule.min_quantity}
                            onChange={(e) => updateRule(index, 'min_quantity', parseInt(e.target.value) || 1)}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`max-${index}`}>Cantidad Máxima</Label>
                          <Input
                            id={`max-${index}`}
                            type="number"
                            min={rule.min_quantity + 1}
                            value={rule.max_quantity || ''}
                            onChange={(e) => updateRule(index, 'max_quantity', e.target.value ? parseInt(e.target.value) : null)}
                            placeholder="Sin límite"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`discount-${index}`}>Descuento (%)</Label>
                          <Input
                            id={`discount-${index}`}
                            type="number"
                            min="0"
                            max="50"
                            value={rule.discount_percentage}
                            onChange={(e) => updateRule(index, 'discount_percentage', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="flex items-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => updateRule(index, 'is_active', !rule.is_active)}
                            className={rule.is_active ? 'text-green-600' : 'text-gray-400'}
                          >
                            {rule.is_active ? 'Activo' : 'Inactivo'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRule(index)}
                            className="text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    onClick={addNewRule}
                    variant="outline"
                    className="w-full border-dashed"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Nueva Regla
                  </Button>

                  <Button
                    onClick={saveDiscountRules}
                    disabled={loading || discountRules.length === 0}
                    className="w-full"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Guardando...' : 'Guardar Escala de Descuentos'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Vista Previa */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Vista Previa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h4 className="font-medium mb-3">Ejemplo de Descuentos:</h4>
                  {[5, 10, 15, 25, 50, 100].map(quantity => {
                    const discount = getDiscountForQuantity(quantity)
                    return (
                      <div key={quantity} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">{quantity} unidades</span>
                        <Badge variant={discount > 0 ? 'default' : 'secondary'}>
                          {discount > 0 ? `-${discount}%` : 'Sin descuento'}
                        </Badge>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h5 className="font-medium text-blue-900 mb-2">¿Cómo funciona?</h5>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Los descuentos se aplican automáticamente</li>
                    <li>• Se usa la regla que coincida con la cantidad</li>
                    <li>• Solo se aplican reglas activas</li>
                    <li>• Máximo descuento: 50%</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
