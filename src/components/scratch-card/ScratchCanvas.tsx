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
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchedPercentage, setScratchedPercentage] = useState(0);
  const [hasStartedScratching, setHasStartedScratching] = useState(false);

  const REVEAL_THRESHOLD = 70; // Porcentagem para revelar automaticamente
  const SCRATCH_RADIUS = 20;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-400 bg-gray-100';
      case 'uncommon': return 'border-green-400 bg-green-100';
      case 'rare': return 'border-blue-400 bg-blue-100';
      case 'epic': return 'border-purple-400 bg-purple-100';
      case 'legendary': return 'border-yellow-400 bg-yellow-100';
      case 'special': return 'border-pink-400 bg-pink-100';
      default: return 'border-gray-400 bg-gray-100';
    }
  };

  // Inicializar o canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    contextRef.current = context;

    // Configurar o canvas
    const rect = canvas.getBoundingClientRect();
    const scale = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * scale;
    canvas.height = rect.height * scale;
    
    context.scale(scale, scale);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    // Desenhar a cobertura inicial
    context.fillStyle = '#9ca3af'; // gray-400
    context.fillRect(0, 0, rect.width, rect.height);

    // Configurar para raspagem
    context.globalCompositeOperation = 'destination-out';
    context.lineJoin = 'round';
    context.lineCap = 'round';
    context.lineWidth = SCRATCH_RADIUS;
  }, []);

  // Auto-revelar quando atingir o threshold
  useEffect(() => {
    if (scratchedPercentage >= REVEAL_THRESHOLD && !isRevealed && hasStartedScratching) {
      onComplete();
    }
  }, [scratchedPercentage, isRevealed, hasStartedScratching, onComplete]);

  // Revelar completamente quando isRevealed for true
  useEffect(() => {
    if (isRevealed && contextRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = contextRef.current;
      context.clearRect(0, 0, canvas.width, canvas.height);
      setScratchedPercentage(100);
    }
  }, [isRevealed]);

  const calculateScratchedPercentage = useCallback(() => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return 0;

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) {
        transparentPixels++;
      }
    }

    const percentage = (transparentPixels / (pixels.length / 4)) * 100;
    setScratchedPercentage(percentage);
    return percentage;
  }, []);

  const scratch = useCallback((x: number, y: number) => {
    const context = contextRef.current;
    const canvas = canvasRef.current;
    if (!context || !canvas || disabled || isRevealed) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const canvasX = (x - rect.left) * scaleX;
    const canvasY = (y - rect.top) * scaleY;

    context.beginPath();
    context.arc(canvasX, canvasY, SCRATCH_RADIUS, 0, 2 * Math.PI);
    context.fill();

    if (!hasStartedScratching) {
      setHasStartedScratching(true);
      onScratch();
    }

    calculateScratchedPercentage();
  }, [disabled, isRevealed, hasStartedScratching, onScratch, calculateScratchedPercentage]);

  // Mouse events
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled || isRevealed) return;
    setIsScratching(true);
    scratch(e.clientX, e.clientY);
  }, [disabled, isRevealed, scratch]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isScratching || disabled || isRevealed) return;
    scratch(e.clientX, e.clientY);
  }, [isScratching, disabled, isRevealed, scratch]);

  const handleMouseUp = useCallback(() => {
    setIsScratching(false);
  }, []);

  // Touch events
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || isRevealed) return;
    e.preventDefault();
    setIsScratching(true);
    const touch = e.touches[0];
    scratch(touch.clientX, touch.clientY);
  }, [disabled, isRevealed, scratch]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isScratching || disabled || isRevealed) return;
    e.preventDefault();
    const touch = e.touches[0];
    scratch(touch.clientX, touch.clientY);
  }, [isScratching, disabled, isRevealed, scratch]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsScratching(false);
  }, []);

  return (
    <div 
      className={cn(
        "relative w-24 h-24 sm:w-28 sm:h-28 rounded-lg border-2 overflow-hidden",
        "transition-all duration-300",
        isWinning && isRevealed && "ring-4 ring-yellow-400 animate-pulse",
        disabled && "cursor-not-allowed opacity-50",
        !disabled && !isRevealed && "cursor-pointer hover:scale-105",
        className
      )}
    >
      {/* Conteúdo do símbolo (sempre presente, mas oculto) */}
      {symbol && (
        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center p-1",
            getRarityColor(symbol.rarity)
          )}
        >
          <img
            src={symbol.image_url}
            alt={symbol.name}
            className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
          />
          <span className="text-xs font-medium text-center mt-1 leading-tight">
            {symbol.name}
          </span>
        </div>
      )}

      {/* Canvas de raspagem */}
      <canvas
        ref={canvasRef}
        className={cn(
          "absolute inset-0 w-full h-full rounded-lg",
          disabled && "pointer-events-none"
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'none' }}
      />

      {/* Texto de instrução */}
      {!hasStartedScratching && !isRevealed && (
        <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm pointer-events-none">
          <span className="select-none">?</span>
        </div>
      )}

      {/* Barra de progresso */}
      {hasStartedScratching && !isRevealed && scratchedPercentage > 0 && (
        <div className="absolute bottom-1 left-1 right-1 bg-black/20 rounded-full h-1 overflow-hidden">
          <div 
            className="h-full bg-white/80 transition-all duration-300"
            style={{ width: `${Math.min(scratchedPercentage, 100)}%` }}
          />
        </div>
      )}

      {/* Efeito de brilho quando vencedor */}
      {isWinning && isRevealed && (
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-300/30 to-transparent animate-pulse"
        />
      )}
    </div>
  );
};

export default ScratchCanvas;