import Link from 'next/link'
import { Star, ShoppingCart, Truck, Shield, Users } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Registration Banner */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 sm:py-4">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-sm sm:text-lg">🔒</span>
            </div>
            <p className="text-sm sm:text-base md:text-lg font-semibold">
              ¡REGISTRATE GRATIS para acceder a precios mayoristas exclusivos!
            </p>
            <Link href="/auth/registro">
              <button className="bg-white text-orange-600 px-4 py-1.5 sm:px-6 sm:py-2 rounded-full font-bold hover:bg-gray-100 transition-colors text-sm sm:text-base">
                Registrarse Ahora
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
        
        <div className="relative container mx-auto px-4 py-16 sm:py-20 md:py-24 lg:py-32 text-center">
          <div className="animate-fadeInUp">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-4 sm:mb-6 leading-tight text-white">
              Zingarito Kids
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                Mayorista
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 max-w-3xl mx-auto text-white/90 font-light px-4">
              Tu proveedor de ropa infantil de diseño en Argentina
            </p>
            <p className="text-base sm:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto text-white/80 px-4">
              Ropa infantil de calidad premium para tu negocio. 
              Diseños exclusivos y precios mayoristas competitivos.
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 mb-8 sm:mb-12 max-w-2xl mx-auto mx-4">
              <p className="text-white font-semibold text-base sm:text-lg mb-2">
                🔐 Acceso Exclusivo para Mayoristas
              </p>
              <p className="text-white/90 text-sm sm:text-base">
                Registrate gratis para ver precios mayoristas, agregar productos al carrito y realizar pedidos
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12 px-4">
              <Link href="/productos">
                <button className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                  Ver Catálogo Completo
                </button>
              </Link>
              <Link href="/auth/login">
                <button className="btn-secondary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white hover:text-indigo-600 w-full sm:w-auto">
                  Iniciar Sesión
                </button>
              </Link>
              <Link href="/auth/registro">
                <button className="btn-success text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto">
                  Registrarse Gratis
                </button>
              </Link>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 lg:gap-8 text-white/80 px-4">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                <span className="font-medium text-sm sm:text-base">+500 Productos</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                <span className="font-medium text-sm sm:text-base">Envío Rápido</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                <span className="font-medium text-sm sm:text-base">Precios Mayoristas</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Benefits */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              ¿Por qué registrarse?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">
              Accede a beneficios exclusivos para mayoristas
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-lg sm:text-xl md:text-2xl">💰</span>
              </div>
              <h3 className="font-bold text-sm sm:text-base md:text-lg mb-1 sm:mb-2">Precios Mayoristas</h3>
              <p className="text-gray-600 text-xs sm:text-sm md:text-base">
                Accede a precios exclusivos solo para comerciantes registrados
              </p>
            </div>
            
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-lg sm:text-xl md:text-2xl">🛒</span>
              </div>
              <h3 className="font-bold text-sm sm:text-base md:text-lg mb-1 sm:mb-2">Carrito de Compras</h3>
              <p className="text-gray-600 text-xs sm:text-sm md:text-base">
                Agrega productos al carrito y realiza pedidos fácilmente
              </p>
            </div>
            
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-lg sm:text-xl md:text-2xl">❤️</span>
              </div>
              <h3 className="font-bold text-sm sm:text-base md:text-lg mb-1 sm:mb-2">Lista de Favoritos</h3>
              <p className="text-gray-600 text-xs sm:text-sm md:text-base">
                Guarda tus productos favoritos para futuras compras
              </p>
            </div>
            
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-lg sm:text-xl md:text-2xl">📱</span>
              </div>
              <h3 className="font-bold text-sm sm:text-base md:text-lg mb-1 sm:mb-2">Pedidos por WhatsApp</h3>
              <p className="text-gray-600 text-xs sm:text-sm md:text-base">
                Envía tus pedidos directamente por WhatsApp
              </p>
            </div>
                </div>
          
          <div className="text-center">
            <Link href="/auth/registro">
              <button className="btn-primary text-lg sm:text-xl px-8 sm:px-12 py-3 sm:py-4">
                Registrarse Gratis Ahora
              </button>
            </Link>
            <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
              El registro es 100% gratuito y toma menos de 2 minutos
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4">
              ¿Por qué elegirnos?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Somos tu socio estratégico para el éxito de tu negocio de ropa infantil
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <Truck className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4 text-gray-900">Envíos Express</h3>
              <p className="text-gray-600 text-sm sm:text-lg leading-relaxed">
                Despachamos en 24-48hs a todo el país. 
                Tu negocio no puede esperar.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4 text-gray-900">Calidad Premium</h3>
              <p className="text-gray-600 text-sm sm:text-lg leading-relaxed">
                Productos de primera calidad con garantía. 
                Tu reputación es nuestra prioridad.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4 text-gray-900">Atención 24/7</h3>
              <p className="text-gray-600 text-sm sm:text-lg leading-relaxed">
                Soporte personalizado y asesoramiento experto. 
                Estamos aquí para ayudarte.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-black text-indigo-600 mb-2">500+</div>
              <div className="text-gray-600">Productos</div>
                </div>
            <div className="text-center">
              <div className="text-4xl font-black text-emerald-600 mb-2">1000+</div>
              <div className="text-gray-600">Clientes</div>
              </div>
            <div className="text-center">
              <div className="text-4xl font-black text-amber-600 mb-2">24hs</div>
              <div className="text-gray-600">Despacho</div>
                </div>
            <div className="text-center">
              <div className="text-4xl font-black text-purple-600 mb-2">5★</div>
              <div className="text-gray-600">Calificación</div>
            </div>
          </div>
        </div>
      </section>

      {/* Información de Negocio */}
      <section className="relative py-12 sm:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="relative container mx-auto px-4 text-center text-white pb-8">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6">
            Información Comercial
          </h2>
          <p className="text-lg sm:text-xl mb-8 sm:mb-10 max-w-2xl mx-auto opacity-90">
            Datos importantes para tu negocio mayorista
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">💰 Condiciones de Pago</h3>
              <p className="text-white/90 mb-3 sm:mb-4 text-sm sm:text-base">
                Transferencia bancaria, efectivo o cheque
              </p>
              <p className="text-xs sm:text-sm text-white/80">
                CBU: 0170123456789012345678<br />
                Alias: ZINGARITO.KIDS
                  </p>
                </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">📦 Envíos</h3>
              <p className="text-white/90 mb-3 sm:mb-4 text-sm sm:text-base">
                Despachamos a todo el país
              </p>
              <p className="text-xs sm:text-sm text-white/80">
                • Envío express 24-48hs<br />
                • Seguimiento incluido<br />
                • Empaque especializado
                  </p>
                </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">🏪 Compra Mínima</h3>
              <p className="text-white/90 mb-3 sm:mb-4 text-sm sm:text-base">
                Pedido mínimo 5 unidades por producto
              </p>
              <p className="text-xs sm:text-sm text-white/80">
                • Descuentos por cantidad<br />
                • Precios mayoristas exclusivos<br />
                • Stock disponible online
                  </p>
              </div>
          </div>
        </div>
      </section>
    </div>
  )
}