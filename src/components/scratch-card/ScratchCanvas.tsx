import { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { ScratchSymbol } from '@/types/scratchCard';

interface ScratchCanvasProps {
  symbol: ScratchSymbol | null;
  isRevealed: boolean;
  onScratch: () => void;
  onComplete: () => void;
  isWinning?: boolean;
  disabled?: boolean;
  className?: string;
}

const ScratchCanvas = ({ 
  symbol, 
  isRevealed, 
  onScratch, 
  onComplete, 
  isWinning = false, 
  disabled = false,
  className 
}: ScratchCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchedPercentage, setScratchedPercentage] = useState(0);
  const [hasStartedScratching, setHasStartedScratching] = useState(false);

  const REVEAL_THRESHOLD = 70;
  const SCRATCH_RADIUS = 15;


  // Inicializar canvas baseado no HTML fornecido
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Tamanho fixo para melhor controle
    canvas.width = 120;
    canvas.height = 120;

    // Cobertura cinza inicial (como no HTML)
    context.fillStyle = '#999';
    context.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  // Auto-revelar baseado no HTML fornecido
  useEffect(() => {
    if (scratchedPercentage >= REVEAL_THRESHOLD && !isRevealed && hasStartedScratching) {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.style.display = 'none';
        onComplete();
      }
    }
  }, [scratchedPercentage, isRevealed, hasStartedScratching, onComplete]);

  // Revelar quando isRevealed for true
  useEffect(() => {
    if (isRevealed) {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.style.display = 'none';
      }
      setScratchedPercentage(100);
    }
  }, [isRevealed]);

  // Algoritmo de detecção exato do HTML fornecido
  const checkReveal = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparent = 0;
    
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparent++;
    }
    
    const percent = (transparent / (canvas.width * canvas.height)) * 100;
    setScratchedPercentage(percent);
  }, []);

  // Função para obter posição (igual ao HTML)
  const getPos = useCallback((e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const clientX = 'clientX' in e ? e.clientX : e.touches?.[0]?.clientX || 0;
    const clientY = 'clientY' in e ? e.clientY : e.touches?.[0]?.clientY || 0;
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }, []);

  // Função de raspagem (exata do HTML)
  const scratch = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas || disabled || isRevealed) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.globalCompositeOperation = 'destination-out';
    context.beginPath();
    context.arc(x, y, SCRATCH_RADIUS, 0, Math.PI * 2);
    context.fill();

    if (!hasStartedScratching) {
      setHasStartedScratching(true);
      onScratch();
    }
  }, [disabled, isRevealed, hasStartedScratching, onScratch]);

  // Eventos exatos do HTML fornecido
  const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (disabled || isRevealed) return;
    setIsScratching(true);
    const { x, y } = getPos(e);
    scratch(x, y);
  }, [disabled, isRevealed, scratch, getPos]);

  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isScratching || disabled || isRevealed) return;
    const { x, y } = getPos(e);
    scratch(x, y);
    checkReveal();
  }, [isScratching, disabled, isRevealed, scratch, getPos, checkReveal]);

  const handleEnd = useCallback(() => {
    setIsScratching(false);
  }, []);

  return (
    <div 
      className={cn(
        "relative w-32 h-32 rounded-xl border-2 overflow-hidden shadow-lg",
        "transition-all duration-300",
        isWinning && isRevealed && "ring-4 ring-yellow-400 animate-pulse",
        disabled && "cursor-not-allowed opacity-50",
        !disabled && !isRevealed && "cursor-pointer hover:scale-105",
        className
      )}
    >
      {/* Conteúdo escondido (como no HTML fornecido) */}
      {symbol && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-2 bg-gradient-to-br from-yellow-400 to-orange-500">
          <img
            src={symbol.image_url}
            alt={symbol.name}
            className="w-16 h-16 object-contain mb-2"
          />
          <span className="text-sm font-bold text-center text-gray-800 leading-tight">
            {symbol.name}
          </span>
        </div>
      )}

      {/* Canvas raspável */}
      <canvas
        ref={canvasRef}
        width={120}
        height={120}
        className="absolute inset-0 w-full h-full"
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        style={{ touchAction: 'none', zIndex: 2 }}
      />

      {/* Instrução de raspagem */}
      {!hasStartedScratching && !isRevealed && (
        <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg pointer-events-none" style={{ zIndex: 3 }}>
          <span className="select-none drop-shadow-lg">Raspe aqui!</span>
        </div>
      )}

      {/* Status como no HTML */}
      {hasStartedScratching && !isRevealed && (
        <div className="absolute bottom-2 left-2 right-2 text-center pointer-events-none" style={{ zIndex: 3 }}>
          <div className="bg-black/70 text-white text-xs px-2 py-1 rounded">
            Área raspada: {scratchedPercentage.toFixed(1)}%
          </div>
        </div>
      )}
    </div>
  );
};

export default ScratchCanvas;