import Link from 'next/link';
import { Instagram, Facebook, Mail, MapPin, Phone } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo y Descripción */}
          <div className="space-y-4">
            <div className="text-2xl font-extrabold">
              <span className="text-[#7B3FBD]">Zingarito</span>{' '}
              <span className="text-[#00D9D4]">Kids</span>
            </div>
            <p className="text-sm text-gray-400">
              Mayorista de ropa infantil. Comprás mínimo 5 productos y te garantizamos la mejor calidad y precio.
            </p>
            {/* Redes Sociales */}
            <div className="flex gap-4">
              <a
                href="https://instagram.com/zingaritokids"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#00D9D4] transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://facebook.com/zingaritokids"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#00D9D4] transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
            </div>
          </div>

          {/* Enlaces Rápidos */}
          <div>
            <h3 className="text-white font-bold mb-4">Navegación</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-[#00D9D4] transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/productos" className="hover:text-[#00D9D4] transition-colors">
                  Catálogo
                </Link>
              </li>
              <li>
                <Link href="/productos?featured=true" className="hover:text-[#00D9D4] transition-colors">
                  Productos Destacados
                </Link>
              </li>
              <li>
                <Link href="/mi-cuenta" className="hover:text-[#00D9D4] transition-colors">
                  Mi Cuenta
                </Link>
              </li>
            </ul>
          </div>

          {/* Ayuda */}
          <div>
            <h3 className="text-white font-bold mb-4">Ayuda</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-[#00D9D4] transition-colors">
                  Preguntas Frecuentes
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#00D9D4] transition-colors">
                  Cómo Comprar
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#00D9D4] transition-colors">
                  Métodos de Pago
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#00D9D4] transition-colors">
                  Envíos
                </a>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-white font-bold mb-4">Contacto</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin size={18} className="flex-shrink-0 mt-0.5" />
                <span>San Martín 17, Villa Ramallo, Buenos Aires, Argentina</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={18} className="flex-shrink-0" />
                <span>(0340) 749-8045</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={18} className="flex-shrink-0" />
                <a
                  href="mailto:zingaritokids@gmail.com"
                  className="hover:text-[#00D9D4] transition-colors"
                >
                  zingaritokids@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Línea Divisoria y Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>
              © {currentYear} Zingarito Kids. Todos los derechos reservados.
            </p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-[#00D9D4] transition-colors">
                Términos y Condiciones
              </a>
              <a href="#" className="hover:text-[#00D9D4] transition-colors">
                Política de Privacidad
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

