'use client'

import { Instagram, Facebook, MessageCircle } from 'lucide-react'

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
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-16 h-16'
  }

  const iconSizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-8 h-8'
  }

  const abrirWhatsApp = () => {
    const numero = '543407498045'
    const mensaje = encodeURIComponent('Hola! Me gustaría obtener más información sobre Zingarito Kids Mayorista.')
    window.open(`https://wa.me/${numero}?text=${mensaje}`, '_blank')
  }

  return (
    <div className={`flex justify-center gap-4 ${className}`}>
      {/* Instagram */}
      <a
        href="https://www.instagram.com/zingaritokids/"
        target="_blank"
        rel="noopener noreferrer"
        className={`${sizeClasses[size]} bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-full flex items-center justify-center hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg`}
        aria-label="Instagram de Zingarito Kids"
      >
        <Instagram className={`${iconSizeClasses[size]} text-white`} />
      </a>

      {/* Facebook */}
      <a
        href="https://www.facebook.com/zingara.ramallo"
        target="_blank"
        rel="noopener noreferrer"
        className={`${sizeClasses[size]} bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg`}
        aria-label="Facebook de Zingarito Kids"
      >
        <Facebook className={`${iconSizeClasses[size]} text-white`} />
      </a>

      {/* WhatsApp */}
      {showWhatsApp && (
        <button
          onClick={abrirWhatsApp}
          className={`${sizeClasses[size]} bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg`}
          aria-label="WhatsApp de Zingarito Kids"
        >
          <MessageCircle className={`${iconSizeClasses[size]} text-white`} />
        </button>
      )}
    </div>
  )
}
