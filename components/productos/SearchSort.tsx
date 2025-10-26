'use client'

import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, ArrowUpDown } from 'lucide-react'

interface SearchSortProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  sortBy: string
  onSortChange: (value: string) => void
  sortOrder: string
  onSortOrderChange: (value: string) => void
}

export function SearchSort({ 
  searchTerm, 
  onSearchChange, 
  sortBy, 
  onSortChange, 
  sortOrder, 
  onSortOrderChange 
}: SearchSortProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      {/* Búsqueda */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="¿Qué estás buscando?"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 border-2 border-gray-300 focus:border-purple-500"
        />
      </div>

      {/* Ordenamiento */}
      <div className="flex gap-2 items-center">
        <ArrowUpDown className="w-4 h-4 text-gray-500" />
        <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
          const [newSortBy, newSortOrder] = value.split('-')
          if (newSortBy && newSortOrder) {
            onSortChange(newSortBy)
            onSortOrderChange(newSortOrder)
          }
        }}>
          <SelectTrigger className="w-48 border-2 border-gray-300 focus:border-purple-500">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">Nombre A-Z</SelectItem>
            <SelectItem value="name-desc">Nombre Z-A</SelectItem>
            <SelectItem value="price-asc">Precio Menor a Mayor</SelectItem>
            <SelectItem value="price-desc">Precio Mayor a Menor</SelectItem>
            <SelectItem value="stock-desc">Más Stock</SelectItem>
            <SelectItem value="stock-asc">Menos Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
