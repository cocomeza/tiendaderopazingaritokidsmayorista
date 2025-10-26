'use client'

import Link from 'next/link'
import { Heart, Users, Trophy, TrendingUp, Shield, Truck, MessageCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function SobreNosotrosPage() {
  const valores = [
    {
      icon: Heart,
      titulo: 'Calidad',
      descripcion: 'Productos de primera calidad, cuidadosamente seleccionados para los más pequeños.',
    },
    {
      icon: Shield,
      titulo: 'Confianza',
      descripcion: 'Años de experiencia respaldando cada una de nuestras ventas y relaciones comerciales.',
    },
    {
      icon: Users,
      titulo: 'Atención Personalizada',
      descripcion: 'Tratamos a cada cliente como único, brindando asesoramiento y soporte constante.',
    },
    {
      icon: Trophy,
      titulo: 'Excelencia',
      descripcion: 'Buscamos la excelencia en cada detalle, desde la selección hasta la entrega.',
    },
  ]

  const estadisticas = [
    { numero: '5+', texto: 'Años de Experiencia' },
    { numero: '500+', texto: 'Clientes Satisfechos' },
    { numero: '50+', texto: 'Productos Diferentes' },
    { numero: '100%', texto: 'Compromiso' },
  ]

  const beneficios = [
    {
      icon: Truck,
      titulo: 'Envíos a Todo el País',
      descripcion: 'Llegamos a todas las provincias de Argentina con envíos seguros y rápidos.',
    },
    {
      icon: TrendingUp,
      titulo: 'Precios Competitivos',
      descripcion: 'Los mejores precios mayoristas del mercado para maximizar tu rentabilidad.',
    },
    {
      icon: MessageCircle,
      titulo: 'Atención Directa',
      descripcion: 'Contacto directo por WhatsApp para resolver tus dudas al instante.',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-zingarito-horizontal text-white py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-3 sm:mb-4 text-xs sm:text-sm">
              Sobre Nosotros
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
              Zingarito Kids
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl opacity-90 leading-relaxed px-4">
              Ropa de Diseño SIN GÉNERO desde Villa Ramallo, Buenos Aires. 
              Empresa familiar dedicada 100% al rubro textil, confeccionando cada prenda con amor.
            </p>
          </div>
        </div>
      </div>

      {/* Nuestra Historia */}
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Nuestra Historia
            </h2>
            <div className="w-16 sm:w-20 h-1 bg-gradient-zingarito mx-auto"></div>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-4 sm:mb-6 px-4">
              Zingarito Kids nació en Villa Ramallo, provincia de Buenos Aires, Argentina, 
              como una empresa familiar dedicada 100% al rubro textil. Desde nuestros inicios, 
              nos propusimos ofrecer ropa infantil de diseño sin género, rompiendo con los 
              estereotipos tradicionales.
            </p>
            <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-4 sm:mb-6 px-4">
              Confeccionamos y diseñamos cada prenda con todo el amor para que los peques 
              estén siempre cancheros. Nuestra pasión por vestir a los más pequeños con 
              estilo, comodidad y calidad nos ha llevado a construir relaciones duraderas 
              con comercios en todo el país. Hacemos envíos a toda Argentina a través de Andreani.
            </p>
            <p className="text-gray-700 text-base sm:text-lg leading-relaxed px-4">
              Hoy, Zingarito Kids es sinónimo de diseño innovador, calidad textil y compromiso 
              familiar. Seguimos creciendo día a día, siempre con el mismo amor y dedicación 
              que nos caracterizó desde el principio.
            </p>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="bg-purple-600 text-white py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {estadisticas.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-1 sm:mb-2">
                  {stat.numero}
                </div>
                <div className="text-xs sm:text-sm md:text-base opacity-90">
                  {stat.texto}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Nuestros Valores */}
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Nuestros Valores
          </h2>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto px-4">
            Los principios que guían cada una de nuestras acciones y decisiones
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {valores.map((valor, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="bg-purple-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <valor.icon className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  {valor.titulo}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  {valor.descripcion}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Por Qué Elegirnos */}
      <div className="bg-white py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              ¿Por Qué Elegirnos?
            </h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto px-4">
              Las razones que nos convierten en tu mejor opción
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {beneficios.map((beneficio, index) => (
              <div key={index} className="text-center">
                <div className="bg-gradient-zingarito w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                  <beneficio.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                  {beneficio.titulo}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  {beneficio.descripcion}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Misión y Visión */}
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {/* Misión */}
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <div className="bg-purple-600 text-white p-2 sm:p-3 rounded-lg">
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Misión</h3>
              </div>
              <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
                Confeccionar y diseñar ropa infantil de calidad sin género, creando prendas 
                únicas con amor y dedicación familiar. Buscamos que cada peque pueda expresar 
                su personalidad libremente, sin estereotipos, llegando a cada rincón de 
                Argentina con nuestro compromiso textil.
              </p>
            </CardContent>
          </Card>

          {/* Visión */}
          <Card className="bg-cyan-50 border-cyan-200">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <div className="bg-cyan-600 text-white p-2 sm:p-3 rounded-lg">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Visión</h3>
              </div>
              <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
                Ser reconocidos a nivel nacional como referentes en ropa infantil sin género 
                de diseño, expandiendo nuestro alcance y manteniendo nuestros valores familiares. 
                Buscamos que Zingarito Kids sea sinónimo de calidad textil, innovación en diseño 
                y compromiso con la libertad de expresión de los peques en toda Argentina.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Equipo */}
      <div className="bg-gray-100 py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Nuestro Equipo
            </h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto px-4">
              Un equipo comprometido con tu éxito
            </p>
          </div>

          <Card className="max-w-3xl mx-auto">
            <CardContent className="p-6 sm:p-8 text-center">
              <div className="bg-gradient-zingarito w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Users className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                Un Equipo Familiar
              </h3>
              <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-4 sm:mb-6">
                En Zingarito Kids, somos una familia de Villa Ramallo comprometida con cada 
                uno de nuestros clientes. Nos dedicamos 100% al rubro textil, confeccionando 
                y diseñando cada prenda con todo el amor para que los peques estén siempre 
                cancheros.
              </p>
              <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
                Nuestra filosofía es clara: ropa de diseño SIN GÉNERO. Creemos que la ropa 
                debe ser libre de estereotipos, permitiendo que cada niño y niña exprese su 
                personalidad única. Enviamos a todo el país a través de Andreani, llegando a 
                cada rincón de Argentina con nuestro compromiso de calidad.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Final */}
      <div className="bg-gradient-zingarito-horizontal text-white py-12 sm:py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            ¿Listo para formar parte de la familia Zingarito Kids?
          </h2>
          <p className="text-lg sm:text-xl mb-6 sm:mb-8 opacity-90 max-w-2xl mx-auto px-4">
            Únete a los cientos de comercios que confían en nosotros para sus ventas
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link href="/productos">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Ver Catálogo
              </Button>
            </Link>
            <Link href="/contacto">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 w-full sm:w-auto">
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Contactanos
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
