import Link from 'next/link';
import { ArrowRight, ShoppingBag, Shield, Truck, Tag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

// TODO: Cuando esté conectado a Supabase, obtener productos reales
const featuredProducts = [
  {
    id: '1',
    name: 'Conjunto Bebé Verano',
    price: 12500,
    images: ['/placeholder-product.jpg'],
    category: 'Bebés',
    featured: true,
    stock: 15,
  },
  {
    id: '2',
    name: 'Vestido Niña Flores',
    price: 18900,
    images: ['/placeholder-product.jpg'],
    category: 'Niñas',
    featured: true,
    stock: 8,
  },
  {
    id: '3',
    name: 'Pantalón Niño Cargo',
    price: 15400,
    images: ['/placeholder-product.jpg'],
    category: 'Niños',
    featured: true,
    stock: 20,
  },
  {
    id: '4',
    name: 'Conjunto Deportivo',
    price: 21000,
    images: ['/placeholder-product.jpg'],
    category: 'Niños',
    featured: true,
    stock: 12,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#7B3FBD] via-[#5A2C8F] to-[#00D9D4] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
                Ropa Infantil al por Mayor
              </h1>
              <p className="text-xl md:text-2xl text-gray-100">
                Calidad premium para tu negocio. Compra mínima 5 productos.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/productos">
                  <Button size="lg" variant="secondary">
                    Ver Catálogo Completo
                    <ArrowRight className="ml-2" size={20} />
                  </Button>
                </Link>
                <Link href="/productos?featured=true">
                  <Button
                    size="lg"
                    className="bg-white/10 hover:bg-white/20 border-2 border-white"
                  >
                    Productos Destacados
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-3xl transform rotate-6"></div>
                <div className="relative bg-white/20 backdrop-blur-md rounded-3xl p-8">
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="bg-white/30 rounded-xl aspect-square"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="bg-[#7B3FBD] bg-opacity-10 p-4 rounded-full">
                <ShoppingBag className="text-[#7B3FBD]" size={32} />
              </div>
              <h3 className="font-bold text-lg">Compra Mayorista</h3>
              <p className="text-gray-600 text-sm">
                Mínimo 5 productos para acceder a precios especiales
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="bg-[#00D9D4] bg-opacity-10 p-4 rounded-full">
                <Tag className="text-[#00D9D4]" size={32} />
              </div>
              <h3 className="font-bold text-lg">Mejores Precios</h3>
              <p className="text-gray-600 text-sm">
                Precios mayoristas competitivos para tu negocio
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="bg-[#FFB700] bg-opacity-10 p-4 rounded-full">
                <Shield className="text-[#FFB700]" size={32} />
              </div>
              <h3 className="font-bold text-lg">Calidad Garantizada</h3>
              <p className="text-gray-600 text-sm">
                Productos de primera calidad, ideal para reventa
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="bg-[#25D366] bg-opacity-10 p-4 rounded-full">
                <Truck className="text-[#25D366]" size={32} />
              </div>
              <h3 className="font-bold text-lg">Envíos a Todo el País</h3>
              <p className="text-gray-600 text-sm">
                Coordinamos tu pedido por WhatsApp
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Productos Destacados */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Productos Destacados
            </h2>
            <p className="text-lg text-gray-600">
              Los más vendidos de la temporada
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {featuredProducts.map((product) => (
              <Card key={product.id} hover padding="none" className="overflow-hidden">
                <Link href={`/productos/${product.id}`}>
                  {/* Imagen del Producto */}
                  <div className="relative aspect-square bg-gray-200">
                    {/* Placeholder - reemplazar con imagen real */}
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ShoppingBag size={64} />
                    </div>
                    <Badge
                      variant="primary"
                      className="absolute top-3 left-3"
                    >
                      {product.category}
                    </Badge>
                  </div>

                  {/* Info del Producto */}
                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-1">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-extrabold text-[#7B3FBD]">
                        ${product.price.toLocaleString('es-AR')}
                      </p>
                      <p className="text-sm text-gray-500">
                        Stock: {product.stock}
                      </p>
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Link href="/productos">
              <Button size="lg" variant="primary">
                Ver Todos los Productos
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Comprar por Categoría
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { name: 'Bebés', link: '/productos?category=Bebés', color: 'bg-pink-100' },
              { name: 'Niños', link: '/productos?category=Niños', color: 'bg-blue-100' },
              { name: 'Niñas', link: '/productos?category=Niñas', color: 'bg-purple-100' },
              { name: 'Accesorios', link: '/productos?category=Accesorios', color: 'bg-yellow-100' },
              { name: 'Calzado', link: '/productos?category=Calzado', color: 'bg-green-100' },
            ].map((category) => (
              <Link key={category.name} href={category.link}>
                <Card hover className={`${category.color} h-32 flex items-center justify-center cursor-pointer`}>
                  <h3 className="text-xl font-bold text-gray-900">
                    {category.name}
                  </h3>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-[#7B3FBD] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-extrabold">
            ¿Listo para hacer tu pedido mayorista?
          </h2>
          <p className="text-xl text-gray-100">
            Registrate gratis y accedé a todos nuestros productos con precios especiales
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/auth/registro">
              <Button size="lg" variant="secondary">
                Crear Cuenta Gratis
              </Button>
            </Link>
            <Link href="/productos">
              <Button
                size="lg"
                className="bg-white/10 hover:bg-white/20 border-2 border-white"
              >
                Ver Catálogo
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

