import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ResponsiveBannerProps {
  /** URL da imagem para desktop/PC (dimensões recomendadas: 1000x300px) */
  imageUrlPC: string;
  /** URL da imagem para mobile (dimensões recomendadas: 600x200px) */
  imageUrlMobile: string;
  /** Texto alternativo para acessibilidade */
  altText: string;
  /** Classes CSS adicionais (opcional) */
  className?: string;
}

/**
 * Componente de banner responsivo que exibe diferentes imagens para PC e mobile
 * 
 * DIMENSÕES RECOMENDADAS:
 * - PC/Desktop: 1000x300px (proporção 10:3)
 * - Mobile: 600x200px (proporção 3:1)
 * 
 * COMO USAR:
 * 1. Coloque suas imagens no diretório /public/banners/
 * 2. Use o componente antes do Footer nas páginas desejadas
 * 
 * EXEMPLO:
 * <ResponsiveBanner 
 *   imageUrlPC="/banners/home-banner-pc.jpg"
 *   imageUrlMobile="/banners/home-banner-mobile.jpg"
 *   altText="Banner promocional da página inicial"
 * />
 */
const ResponsiveBanner: React.FC<ResponsiveBannerProps> = ({
  imageUrlPC,
  imageUrlMobile,
  altText,
  className = ""
}) => {
  const isMobile = useIsMobile();

  // Seleciona a URL correta baseada no dispositivo
  const bannerUrl = isMobile ? imageUrlMobile : imageUrlPC;

  return (
    <div className={`w-full max-w-6xl mx-auto my-8 ${className}`}>
      <img 
        src={bannerUrl}
        alt={altText}
        className="w-full h-auto object-cover rounded-lg shadow-lg"
        style={{
          // Força as proporções corretas
          aspectRatio: isMobile ? '3/1' : '10/3',
          maxHeight: isMobile ? '200px' : '300px'
        }}
        loading="lazy"
      />
    </div>
  );
};

export default ResponsiveBanner;