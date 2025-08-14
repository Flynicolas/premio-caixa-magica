import React from 'react';
import { cn } from '@/lib/utils';

interface BannerRaspadinhaProps {
  imageUrl: string;
  alt: string;
  height?: number;
  width?: string;
  mode?: 'contain' | 'cover' | 'stretch';
  className?: string;
}

const BannerRaspadinha = ({ 
  imageUrl, 
  alt, 
  height = 100, 
  width = "auto", 
  mode = "cover",
  className 
}: BannerRaspadinhaProps) => {
  const responsiveHeight = {
    mobile: Math.max(100, height),
    desktop: Math.min(140, height + 40)
  };

  return (
    <div 
      className={cn(
        "relative w-full rounded-lg overflow-hidden shadow-lg",
        // Altura responsiva
        "h-[100px] md:h-[120px] lg:h-[140px]",
        className
      )}
      style={{
        height: `${responsiveHeight.mobile}px`,
      }}
    >
      <img
        src={imageUrl}
        alt={alt}
        className={cn(
          "w-full h-full transition-all duration-300",
          mode === 'cover' && "object-cover",
          mode === 'contain' && "object-contain",
          mode === 'stretch' && "object-fill"
        )}
        style={{
          width: width === "auto" ? "100%" : width
        }}
        onError={(e) => {
          // Fallback em caso de erro na imagem
          e.currentTarget.src = "/placeholder.svg";
        }}
      />
      
      {/* Overlay gradiente sutil para melhor legibilidade */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 pointer-events-none" />
    </div>
  );
};

export default BannerRaspadinha;