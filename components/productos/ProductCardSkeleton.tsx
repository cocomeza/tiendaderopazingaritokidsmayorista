'use client'

/**
 * Skeleton loader para productos
 * Se muestra mientras cargan los productos
 */
export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden transition-all duration-300 hover:shadow-xl border-0 bg-gradient-to-br from-white to-gray-50 rounded-2xl relative shadow-lg animate-pulse">
      {/* Imagen skeleton */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 h-56 rounded-t-2xl">
        <div className="absolute top-4 right-4">
          <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
        </div>
      </div>

      {/* Contenido skeleton */}
      <div className="p-4 sm:p-5">
        {/* Título */}
        <div className="h-6 bg-gray-300 rounded-lg mb-3 w-3/4"></div>
        
        {/* Badge skeleton */}
        <div className="h-4 bg-gray-200 rounded-full w-1/2 mb-3"></div>
        
        {/* Precio */}
        <div className="h-8 bg-gray-300 rounded-lg mb-3 w-2/3"></div>
        
        {/* Stock */}
        <div className="h-5 bg-gray-200 rounded-lg mb-4 w-1/3"></div>
        
        {/* Botón */}
        <div className="h-10 bg-gradient-to-r from-gray-300 to-gray-400 rounded-xl"></div>
      </div>
    </div>
  )
}

/**
 * Grid de skeletons para la página de loading
 */
export function ProductsGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

