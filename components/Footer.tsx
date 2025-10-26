'use client'

import { SocialLinks } from '@/components/ui/SocialLinks'

export default function Footer() {

  return (
    <footer className="relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black"></div>
      <div className="absolute inset-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}></div>
      
      {/* Main Footer Content */}
      <div className="relative">

        {/* Main Footer */}
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            {/* Brand Section */}
            <div className="flex items-center justify-center mb-6">
              <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                ZINGARITO
              </div>
              <span className="ml-2 text-2xl font-bold text-purple-400">KIDS</span>
            </div>
            <p className="text-gray-300 leading-relaxed mb-8 max-w-2xl mx-auto">
              Tu proveedor de confianza para ropa infantil de diseño. 
              Calidad premium, precios mayoristas y atención personalizada.
            </p>
            
            {/* Social Links */}
            <SocialLinks size="md" showWhatsApp={true} />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700/50 bg-black/20">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <p className="text-gray-300 text-sm">
                  © {new Date().getFullYear()} Zingarito Kids Mayorista. Todos los derechos reservados.
                </p>
              </div>
              
              <div className="flex items-center gap-6">
                <p className="text-sm text-gray-400">
                  Desarrollado por{' '}
                  <a 
                    href="https://botoncreativo.onrender.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-300 hover:to-pink-300 transition-all duration-300 font-semibold"
                  >
                    Botón Creativo
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}