export default function ProductosSimplePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Productos Simple</h1>
        <p className="text-gray-600">Esta es una página de prueba simple.</p>
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Enlaces de prueba:</h2>
          <div className="space-y-2">
            <a href="/productos" className="block text-blue-600 hover:underline">
              → Página de productos original
            </a>
            <a href="/productos-debug" className="block text-blue-600 hover:underline">
              → Página de productos debug
            </a>
            <a href="/admin/dashboard" className="block text-blue-600 hover:underline">
              → Dashboard admin
            </a>
            <a href="/admin" className="block text-blue-600 hover:underline">
              → Panel admin
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
