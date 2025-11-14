'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const WhatsAppFloatingButton = () => {
  const [whatsappNumber, setWhatsappNumber] = useState<string>('');
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWhatsAppNumber();
  }, []);

  const fetchWhatsAppNumber = async () => {
    try {
      const res = await fetch('/api/settings/business_info');
      const data = await res.json();
      setWhatsappNumber(data.whatsappNumber || '5511999999999');
    } catch (error) {
      console.error('Error fetching WhatsApp:', error);
      setWhatsappNumber('5511999999999');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('Olá! Gostaria de agendar um horário.');
    const url = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading || !isVisible) return null;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={handleWhatsAppClick}
        className="fixed bottom-6 right-6 z-50 group"
        aria-label="Abrir WhatsApp"
      >
        <div className="relative">
          {/* Pulse Animation */}
          <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75" />
          
          {/* Main Button */}
          <div className="relative bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110">
            <MessageCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
            Fale conosco no WhatsApp
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
          </div>
        </div>
      </button>

      {/* Close Button (optional - can be removed if not needed) */}
      {/* <button
        onClick={() => setIsVisible(false)}
        className="fixed bottom-24 right-6 z-50 bg-gray-200 hover:bg-gray-300 rounded-full p-2 shadow-md transition-all duration-300"
        aria-label="Fechar botão WhatsApp"
      >
        <X className="w-4 h-4 text-gray-600" />
      </button> */}
    </>
  );
};
