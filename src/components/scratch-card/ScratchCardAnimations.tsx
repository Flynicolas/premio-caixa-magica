import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ScratchCardAnimationsProps {
  isActive: boolean;
  winState?: 'none' | 'small' | 'big';
  className?: string;
}

const ScratchCardAnimations = ({ isActive, winState = 'none', className }: ScratchCardAnimationsProps) => {
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !particlesRef.current) return;

    const container = particlesRef.current;
    
    // Criar partículas flutuantes
    const createParticle = () => {
      const particle = document.createElement('div');
      particle.className = 'absolute w-1 h-1 bg-primary/30 rounded-full pointer-events-none';
      
      // Posição aleatória
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      
      // Animação flutuante
      particle.style.animation = 'float 3s ease-in-out infinite';
      particle.style.animationDelay = Math.random() * 2 + 's';
      
      container.appendChild(particle);
      
      // Remover após animação
      setTimeout(() => {
        if (container.contains(particle)) {
          container.removeChild(particle);
        }
      }, 3000);
    };

    // Criar partículas periodicamente
    const particleInterval = setInterval(createParticle, 500);

    return () => {
      clearInterval(particleInterval);
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <>
      {/* CSS Keyframes */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.3; }
          50% { transform: translateY(-20px) scale(1.2); opacity: 0.8; }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px hsl(var(--primary) / 0.3); }
          50% { box-shadow: 0 0 40px hsl(var(--primary) / 0.6), 0 0 60px hsl(var(--primary) / 0.3); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }
      `}</style>

      <div 
        ref={particlesRef}
        className={cn(
          "absolute inset-0 pointer-events-none overflow-hidden rounded-xl",
          {
            'animate-[glow_2s_ease-in-out_infinite]': winState === 'big',
            'animate-[shake_0.5s_ease-in-out_3]': winState === 'small'
          },
          className
        )}
      >
        {/* Overlay de brilho sutil */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 animate-pulse" />
        
        {/* Indicadores de canto animados */}
        <div className="absolute top-2 left-2 w-3 h-3 bg-primary/40 rounded-full animate-ping" />
        <div className="absolute top-2 right-2 w-3 h-3 bg-secondary/40 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-2 left-2 w-3 h-3 bg-accent/40 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-2 right-2 w-3 h-3 bg-primary/40 rounded-full animate-ping" style={{ animationDelay: '1.5s' }} />
      </div>
    </>
  );
};

export default ScratchCardAnimations;