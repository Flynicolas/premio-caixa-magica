import { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { ScratchSymbol } from '@/types/scratchCard';

interface ScratchGameCanvasProps {
  symbols: ScratchSymbol[];
  onWin: (winningSymbol: string) => void;
  onComplete: () => void;
  className?: string;
}

const ScratchGameCanvas = ({ symbols, onWin, onComplete, className }: ScratchGameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  const rarityColors = {
    common: '#aaa',
    uncommon: '#4ade80',
    rare: '#3b82f6',
    epic: '#a855f7',
    legendary: '#facc15',
    special: '#f472b6'
  };

  // Renderizar grid com símbolos
  const renderGrid = useCallback(() => {
    const grid = gridRef.current;
    if (!grid || !symbols.length) return;

    grid.innerHTML = '';
    symbols.forEach(({ name, image_url, rarity }, index) => {
      const div = document.createElement('div');
      div.className = 'scratch-block';
      div.style.cssText = `
        padding: 20px 4px;
        text-align: center;
        border-radius: 8px;
        background: #333;
        color: #fff;
        border: 2px solid ${rarityColors[rarity] || '#888'};
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 90px;
      `;
      
      // Criar img element
      const img = document.createElement('img');
      img.src = image_url;
      img.alt = name;
      img.style.cssText = `
        width: 32px;
        height: 32px;
        object-fit: contain;
        margin-bottom: 4px;
      `;
      
      // Criar span para nome
      const span = document.createElement('span');
      span.textContent = name;
      span.style.cssText = `
        font-size: 10px;
        font-weight: bold;
        text-align: center;
        line-height: 1.2;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      `;
      
      div.appendChild(img);
      div.appendChild(span);
      div.dataset.index = index.toString();
      div.dataset.symbol = name;
      grid.appendChild(div);
    });
  }, [symbols, rarityColors]);

  // Resetar canvas com cobertura cinza
  const resetCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#999';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    canvas.style.display = 'block';
    setIsRevealed(false);
  }, []);

  // Verificar progresso da raspagem
  const checkScratchProgress = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let cleared = 0;
    
    for (let i = 3; i < imgData.length; i += 4) {
      if (imgData[i] === 0) cleared++;
    }
    
    const percent = (cleared / (canvas.width * canvas.height)) * 100;
    
    if (percent > 70) {
      canvas.style.display = 'none';
      setIsRevealed(true);
      checkWin();
    }
  }, [isRevealed]);

  // Verificar vitória
  const checkWin = useCallback(() => {
    if (!symbols.length) return;

    const count: { [key: string]: number } = {};
    symbols.forEach(({ name }) => {
      count[name] = (count[name] || 0) + 1;
    });

    for (const symbolName in count) {
      if (count[symbolName] >= 3) {
        highlightWinners(symbolName);
        onWin(symbolName);
        return;
      }
    }
    
    onComplete();
  }, [symbols, onWin, onComplete]);

  // Destacar símbolos vencedores
  const highlightWinners = useCallback((winningSymbol: string) => {
    const grid = gridRef.current;
    if (!grid) return;

    Array.from(grid.children).forEach((div: any) => {
      if (div.dataset.symbol === winningSymbol) {
        div.style.border = '3px solid gold';
        div.style.background = '#444';
        div.style.transform = 'scale(1.05)';
        div.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.5)';
      }
    });
  }, []);

  // Função de raspagem
  const draw = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isScratching || isRevealed) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('clientX' in e ? e.clientX : e.touches?.[0]?.clientX || 0) - rect.left;
    const y = ('clientY' in e ? e.clientY : e.touches?.[0]?.clientY || 0) - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();
    
    checkScratchProgress();
  }, [isScratching, isRevealed, checkScratchProgress]);

  // Eventos do canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isDrawing = false;

    const handleStart = (e: MouseEvent | TouchEvent) => {
      isDrawing = true;
      setIsScratching(true);
      draw(e);
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing) return;
      draw(e);
    };

    const handleEnd = () => {
      isDrawing = false;
      setIsScratching(false);
    };

    // Mouse events
    const handleMouseDown = (e: MouseEvent) => handleStart(e);
    const handleMouseMove = (e: MouseEvent) => handleMove(e);
    const handleMouseUp = () => handleEnd();
    const handleMouseLeave = () => handleEnd();

    // Touch events
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      handleStart(e);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      handleMove(e);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      handleEnd();
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [draw]);

  // Inicializar quando símbolos mudarem
  useEffect(() => {
    if (symbols.length > 0) {
      renderGrid();
      resetCanvas();
    }
  }, [symbols, renderGrid, resetCanvas]);

  return (
    <div className={cn("relative w-full max-w-sm mx-auto", className)}>
      {/* Grid de símbolos */}
      <div
        ref={gridRef}
        className="grid grid-cols-3 gap-1 p-2 bg-gray-800 rounded-xl relative z-10"
        style={{ minHeight: '300px' }}
      />
      
      {/* Canvas de raspagem */}
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        className="absolute top-0 left-0 w-full h-full rounded-xl cursor-pointer z-20"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
};

export default ScratchGameCanvas;