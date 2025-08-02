import { cn } from '@/lib/utils';

interface ScratchCardAnimationsProps {
  isActive: boolean;
  winState?: 'none' | 'small' | 'big';
  className?: string;
}

const ScratchCardAnimations = ({ isActive, winState = 'none', className }: ScratchCardAnimationsProps) => {
  if (!isActive) return null;

  return (
    <div 
      className={cn(
        "absolute inset-0 pointer-events-none overflow-hidden rounded-xl",
        {
          'shadow-[0_0_30px_hsl(var(--primary)/0.5)]': winState === 'big',
          'animate-[shake_0.3s_ease-in-out_2]': winState === 'small'
        },
        className
      )}
    >
      {/* Overlay sutil sem animações pesadas */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-secondary/3" />
      
      {/* Indicadores de canto estáticos */}
      {winState !== 'none' && (
        <>
          <div className="absolute top-2 left-2 w-2 h-2 bg-primary/50 rounded-full" />
          <div className="absolute top-2 right-2 w-2 h-2 bg-secondary/50 rounded-full" />
          <div className="absolute bottom-2 left-2 w-2 h-2 bg-accent/50 rounded-full" />
          <div className="absolute bottom-2 right-2 w-2 h-2 bg-primary/50 rounded-full" />
        </>
      )}
    </div>
  );
};

export default ScratchCardAnimations;