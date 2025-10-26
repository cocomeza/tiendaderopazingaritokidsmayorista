export default function ProductosPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Productos - Test Simple</h1>
        
        <div className="bg-green-100 p-4 rounded-lg mb-6">
          <p className="text-green-800">
            <strong>✅ Página funcionando!</strong> Esta es una versión de prueba sin Supabase
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-lg mb-2">Producto de Prueba 1</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Precio:</span>
                <span className="font-bold">$15,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mayorista:</span>
                <span className="font-bold text-purple-600">$12,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Stock:</span>
                <span>10 unidades</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-lg mb-2">Producto de Prueba 2</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Precio:</span>
                <span className="font-bold">$20,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mayorista:</span>
                <span className="font-bold text-purple-600">$16,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Stock:</span>
                <span>5 unidades</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-lg mb-2">Producto de Prueba 3</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Precio:</span>
                <span className="font-bold">$25,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mayorista:</span>
                <span className="font-bold text-purple-600">$20,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Stock:</span>
                <span>8 unidades</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
