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
  console.log('🎯 ScratchGameCanvas mounted/rendered, symbols.length:', symbols.length);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);
  const lastProgressCheck = useRef(Date.now());
  const progressCheckInterval = 50; // Check progress every 50ms for better responsivity

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
    setScratchProgress(0);
    lastProgressCheck.current = Date.now();
  }, []);

  // Verificar progresso da raspagem com otimização
  const checkScratchProgress = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed) return;

    // Throttling - só verifica progresso ocasionalmente
    const now = Date.now();
    if (now - lastProgressCheck.current < progressCheckInterval) {
      console.log('🔍 Throttling checkScratchProgress');
      return;
    }
    lastProgressCheck.current = now;

    console.log('🔍 Checking scratch progress...');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Amostragem otimizada - verifica apenas alguns pixels
    const sampleSize = 50; // Verifica 50x50 pontos distribuídos
    const stepX = canvas.width / sampleSize;
    const stepY = canvas.height / sampleSize;
    let cleared = 0;
    let total = 0;

    for (let x = 0; x < canvas.width; x += stepX) {
      for (let y = 0; y < canvas.height; y += stepY) {
        const pixelData = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
        if (pixelData[3] === 0) cleared++; // Canal alpha = 0 (transparente)
        total++;
      }
    }
    
    const percent = (cleared / total) * 100;
    console.log('🔍 Scratch progress calculated:', percent, '%');
    setScratchProgress(Math.round(percent));
    
    // Revelação quando atingir 75% (meio do range 70-80%)
    if (percent >= 75) {
      console.log('🔍 Revealing at 75%');
      canvas.style.display = 'none';
      setIsRevealed(true);
      setScratchProgress(100);
      checkWin();
    }
  }, [isRevealed, progressCheckInterval]);

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
    console.log('🔥 DRAW function called');
    const canvas = canvasRef.current;
    if (!canvas || isRevealed) {
      console.log('🔥 DRAW cancelled - no canvas or already revealed');
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      console.log('🔥 DRAW cancelled - no context');
      return;
    }

    const rect = canvas.getBoundingClientRect();
    
    // Calcular coordenadas corretas considerando o scale do canvas
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const clientX = 'clientX' in e ? e.clientX : e.touches?.[0]?.clientX || 0;
    const clientY = 'clientY' in e ? e.clientY : e.touches?.[0]?.clientY || 0;
    
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    console.log('🔥 Drawing at coordinates:', { x, y });

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.fill();
    
    console.log('🔥 Calling checkScratchProgress...');
    checkScratchProgress();
  }, [isRevealed, checkScratchProgress]);

  // Eventos do canvas - usando useRef para evitar dependências instáveis
  const isReallyScratching = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    console.log('🎯 Setting up canvas events, canvas exists:', !!canvas);
    if (!canvas) return;

    // Debug: verificar se o canvas está visível e clicável
    console.log('🎯 Canvas style:', {
      display: canvas.style.display,
      zIndex: window.getComputedStyle(canvas).zIndex,
      pointerEvents: window.getComputedStyle(canvas).pointerEvents,
      position: window.getComputedStyle(canvas).position
    });

    const handleMouseDown = (e: MouseEvent) => {
      console.log('🔥 MOUSE DOWN EVENT FIRED!', e.target);
      console.log('🔥 Event coordinates:', e.clientX, e.clientY);
      isReallyScratching.current = true;
      setIsScratching(true);
      draw(e);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isReallyScratching.current) {
        console.log('Mouse move - scratching'); // Debug log
        draw(e);
      }
    };
    
    const handleMouseUp = () => {
      console.log('Mouse up - stopping scratch'); // Debug log
      isReallyScratching.current = false;
      setIsScratching(false);
    };
    
    const handleMouseLeave = () => {
      console.log('Mouse leave - stopping scratch'); // Debug log
      isReallyScratching.current = false;
      setIsScratching(false);
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      console.log('Touch start'); // Debug log
      isReallyScratching.current = true;
      setIsScratching(true);
      draw(e);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (isReallyScratching.current) {
        console.log('Touch move - scratching'); // Debug log
        draw(e);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      isReallyScratching.current = false;
      setIsScratching(false);
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
  }, [draw]); // Apenas 'draw' como dependência

  // Debug: verificar se os useEffects estão executando na ordem correta
  useEffect(() => {
    console.log('🎯 Canvas ref changed, current canvas:', !!canvasRef.current);
  }, [canvasRef.current]);

  // Inicializar quando símbolos mudarem
  useEffect(() => {
    console.log('🎯 ScratchGameCanvas useEffect called with symbols:', symbols.length);
    if (symbols.length > 0) {
      renderGrid();
      resetCanvas();
      console.log('🎯 Grid and canvas initialized');
    }
  }, [symbols, renderGrid, resetCanvas]);

  return (
    <div className={cn("relative w-full max-w-sm mx-auto", className)}>
      {/* Indicador de progresso */}
      {scratchProgress > 0 && scratchProgress < 100 && (
        <div className="absolute top-2 left-2 z-30 bg-black/70 text-white px-2 py-1 rounded text-xs">
          Raspado: {scratchProgress}%
        </div>
      )}
      
      {/* Instrução inicial */}
      {scratchProgress === 0 && (
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
          <div className="bg-black/70 text-white px-4 py-2 rounded-lg text-sm font-medium">
            👆 Raspe gradualmente para revelar os prêmios
          </div>
        </div>
      )}

      {/* Grid de símbolos */}
      <div
        ref={gridRef}
        className="grid grid-cols-3 gap-1 p-2 bg-gray-800 rounded-xl relative z-10"
        style={{ minHeight: '300px' }}
      />
      
      {/* Canvas de raspagem */}
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="absolute top-0 left-0 w-full h-full rounded-xl cursor-pointer z-20"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
};

export default ScratchGameCanvas;