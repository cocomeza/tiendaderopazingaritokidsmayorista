'use client';

import { MessageCircle } from 'lucide-react';
import { formatWhatsAppURL } from '@/lib/utils/formatters';

export function WhatsAppButton() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '543407498045';
  const message = '¡Hola! Tengo una consulta sobre Zingarito Kids';
  const url = formatWhatsAppURL(whatsappNumber, message);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-green-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 group"
      aria-label="Contáctanos por WhatsApp"
    >
      <MessageCircle size={28} />
      
      {/* Tooltip */}
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        Contáctanos
        <span className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900" />
      </span>
    </a>
  );
}

