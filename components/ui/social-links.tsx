'use client'

import { Instagram, Facebook, MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface SocialLinksProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showWhatsApp?: boolean
}

export function SocialLinks({ 
  className = '', 
  size = 'md', 
  showWhatsApp = true 
}: SocialLinksProps) {
  const sizeClasses = {
    sm: 'w-10 h-10 sm:w-12 sm:h-12',
    md: 'w-14 h-14 sm:w-16 sm:h-16',
    lg: 'w-16 h-16 sm:w-20 sm:h-20'
  }

  const iconSizeClasses = {
    sm: 'w-5 h-5 sm:w-6 sm:h-6',
    md: 'w-7 h-7 sm:w-8 sm:h-8',
    lg: 'w-8 h-8 sm:w-10 sm:h-10'
  }

  const abrirWhatsApp = () => {
    const numero = '543407440243'
    const mensaje = encodeURIComponent('Hola! Me gustaría obtener más información sobre Zingarito Kids Mayorista.')
    window.open(`https://wa.me/${numero}?text=${mensaje}`, '_blank')
  }

  const socialLinks = [
    {
      name: 'Instagram',
      href: 'https://www.instagram.com/zingaritokids/',
      icon: Instagram,
      gradient: 'from-purple-500 via-pink-500 to-orange-500',
      hoverGradient: 'from-purple-400 via-pink-400 to-orange-400',
      className: 'hover:shadow-purple-500/50'
    },
    {
      name: 'Facebook',
      href: 'https://www.facebook.com/zingara.ramallo',
      icon: Facebook,
      gradient: 'from-blue-600 to-blue-700',
      hoverGradient: 'from-blue-500 to-blue-600',
      className: 'hover:shadow-blue-500/50'
    }
  ]

  const whatsAppLink = {
    name: 'WhatsApp',
    icon: MessageCircle,
    gradient: 'from-green-500 to-emerald-600',
    hoverGradient: 'from-green-400 to-emerald-500',
    className: 'hover:shadow-green-500/50'
  }

  return (
    <div className={`flex justify-center gap-5 sm:gap-6 ${className}`}>
      {/* Instagram */}
      <motion.a
        href={socialLinks[0].href}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.1, y: -3 }}
        whileTap={{ scale: 0.95 }}
        className={`${sizeClasses[size]} bg-gradient-to-br ${socialLinks[0].gradient} rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl ${socialLinks[0].className} group`}
        aria-label={socialLinks[0].name}
      >
        <Instagram className={`${iconSizeClasses[size]} text-white group-hover:scale-110 transition-transform`} />
      </motion.a>

      {/* Facebook */}
      <motion.a
        href={socialLinks[1].href}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.1, y: -3 }}
        whileTap={{ scale: 0.95 }}
        className={`${sizeClasses[size]} bg-gradient-to-br ${socialLinks[1].gradient} rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl ${socialLinks[1].className} group`}
        aria-label={socialLinks[1].name}
      >
        <Facebook className={`${iconSizeClasses[size]} text-white group-hover:scale-110 transition-transform`} />
      </motion.a>

      {/* WhatsApp */}
      {showWhatsApp && (
        <motion.button
          onClick={abrirWhatsApp}
          whileHover={{ scale: 1.1, y: -3 }}
          whileTap={{ scale: 0.95 }}
          className={`${sizeClasses[size]} bg-gradient-to-br ${whatsAppLink.gradient} rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl ${whatsAppLink.className} group`}
          aria-label={whatsAppLink.name}
        >
          <MessageCircle className={`${iconSizeClasses[size]} text-white group-hover:scale-110 transition-transform`} />
        </motion.button>
      )}
    </div>
  )
}
