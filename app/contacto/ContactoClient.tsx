'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Phone, MapPin, Clock, Star, Truck, Shield, Heart } from 'lucide-react'
import { Spotlight } from '@/components/ui/spotlight'
import { TextGenerateEffect } from '@/components/ui/text-generate-effect'
import { BackgroundBeams } from '@/components/ui/background-beams'
import { CardHoverEffect } from '@/components/ui/card-hover-effect'
import { motion } from 'framer-motion'

export default function ContactoClient() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Hero Header with Spotlight and TextGenerateEffect */}
      <div className="relative h-[50vh] sm:h-[40vh] w-full flex items-center justify-center overflow-hidden rounded-b-3xl shadow-xl">
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="white"
        />
        <BackgroundBeams className="absolute inset-0 z-0" />
        <div className="absolute inset-0 bg-black/30 z-5"></div>
        <div className="relative z-10 text-center p-4">
          <TextGenerateEffect
            words="Contáctanos"
            className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg"
          />
          <p className="text-base sm:text-lg md:text-xl text-white/95 mb-6 sm:mb-8 drop-shadow-md px-4">
            Estamos aquí para ayudarte con tu negocio
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-8 -mt-16 sm:-mt-20 relative z-20">

        {/* Información de contacto principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
          <CardHoverEffect>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-2xl p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-bold">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Phone className="w-3 h-3 sm:w-5 sm:h-5" />
                    </div>
                    Información de Contacto
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 text-sm sm:text-base">Teléfono</p>
                      <p className="text-base sm:text-lg font-bold text-green-600 break-all">+54 340 749-8045</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 text-sm sm:text-base">Email</p>
                      <p className="text-sm sm:text-lg font-bold text-blue-600 break-all">zingaritokids@gmail.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 text-sm sm:text-base">Ubicación</p>
                      <p className="text-base sm:text-lg font-bold text-purple-600">Argentina</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-orange-500 to-yellow-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 text-sm sm:text-base">Horarios</p>
                      <p className="text-sm sm:text-lg font-bold text-orange-600">Lunes a Viernes 9:00 - 18:00</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </CardHoverEffect>

          <CardHoverEffect>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-2xl p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-bold">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Star className="w-3 h-3 sm:w-5 sm:h-5" />
                    </div>
                    ¿Por qué elegirnos?
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Truck className="w-4 h-4 text-white" />
                    </div>
                    <p className="font-semibold text-gray-800 text-sm sm:text-base">Precios mayoristas competitivos</p>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <p className="font-semibold text-gray-800 text-sm sm:text-base">Productos de calidad premium</p>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Truck className="w-4 h-4 text-white" />
                    </div>
                    <p className="font-semibold text-gray-800 text-sm sm:text-base">Envíos rápidos a todo el país</p>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Heart className="w-4 h-4 text-white" />
                    </div>
                    <p className="font-semibold text-gray-800 text-sm sm:text-base">Atención personalizada</p>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl">
                    <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Star className="w-4 h-4 text-white" />
                    </div>
                    <p className="font-semibold text-gray-800 text-sm sm:text-base">Diseños exclusivos</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </CardHoverEffect>
        </div>

        {/* Botones de contacto directo */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">Contáctanos Ahora</h2>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
            <Button className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl text-base sm:text-lg">
              <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Llamar Ahora
            </Button>
            <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl text-base sm:text-lg">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              WhatsApp
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
