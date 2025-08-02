import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ScratchCardLoaderProps {
  isVisible: boolean;
  onLoadComplete: () => void;
  logoUrl?: string;
  className?: string;
}

const ScratchCardLoader = ({ 
  isVisible, 
  onLoadComplete, 
  logoUrl = "/lovable-uploads/logo-app.png",
  className 
}: ScratchCardLoaderProps) => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Escolhendo seu bilhete...');

  useEffect(() => {
    if (!isVisible) return;

    const texts = [
      'Escolhendo seu bilhete...',
      'Carregando raspadinha...',
      'Quase pronto...'
    ];

    let currentText = 0;
    let currentProgress = 0;

    const progressInterval = setInterval(() => {
      currentProgress += Math.random() * 15 + 5;
      
      if (currentProgress >= 100) {
        currentProgress = 100;
        setProgress(100);
        clearInterval(progressInterval);
        
        setTimeout(() => {
          onLoadComplete();
        }, 500);
        return;
      }

      setProgress(currentProgress);

      // Trocar texto a cada 33% do progresso
      const textIndex = Math.floor((currentProgress / 100) * texts.length);
      if (textIndex !== currentText && textIndex < texts.length) {
        currentText = textIndex;
        setLoadingText(texts[textIndex]);
      }
    }, 100);

    return () => clearInterval(progressInterval);
  }, [isVisible, onLoadComplete]);

  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center",
      className
    )}>
      <div className="bg-background rounded-2xl p-8 max-w-sm w-full mx-4 text-center space-y-6 shadow-2xl">
        {/* Logo com animação */}
        <div className="flex justify-center">
          <div className="relative">
            <img 
              src={logoUrl} 
              alt="Logo"
              className="w-20 h-20 object-contain animate-pulse"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent rounded-full animate-spin" />
          </div>
        </div>

        {/* Texto de carregamento */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">{loadingText}</h3>
          <p className="text-sm text-muted-foreground">
            Aguarde enquanto preparamos tudo...
          </p>
        </div>

        {/* Barra de progresso animada */}
        <div className="space-y-2">
          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">{Math.round(progress)}%</p>
        </div>

        {/* Partículas animadas */}
        <div className="flex justify-center space-x-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScratchCardLoader;