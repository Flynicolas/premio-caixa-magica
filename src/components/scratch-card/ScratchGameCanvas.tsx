import { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { cn } from '@/lib/utils';
import { ScratchSymbol } from '@/types/scratchCard';

interface ScratchGameCanvasProps {
  symbols: ScratchSymbol[];
  onWin: (winningSymbol: string) => void;
  onComplete: () => void;
  onScratchStart?: () => void;
  gameStarted?: boolean;
  scratchType?: string;
  className?: string;
  disabled?: boolean;
}

interface ScratchAreaMap {
  center: number;    // Peso 3x (posição 4)
  corners: number;   // Peso 1x (posições 0,2,6,8) 
  sides: number;     // Peso 2x (posições 1,3,5,7)
}

const ScratchGameCanvas = forwardRef<{ revealAll: () => void }, ScratchGameCanvasProps>(({ symbols, onWin, onComplete, onScratchStart, gameStarted = false, scratchType = 'sorte', className, disabled = false }, ref) => {
  console.log('🎯 ScratchGameCanvas mounted/rendered, symbols.length:', symbols.length);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);
  const [canvasFullyLoaded, setCanvasFullyLoaded] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [revealedPositions, setRevealedPositions] = useState<boolean[]>(Array(9).fill(false));
  const lastProgressCheck = useRef(Date.now());
  const progressCheckInterval = 50;
  const scratchAreas = useRef<ScratchAreaMap>({ center: 0, corners: 0, sides: 0 });

  const rarityColors = {
    common: '#aaa',
    uncommon: '#4ade80',
    rare: '#3b82f6',
    epic: '#a855f7',
    legendary: '#facc15',
    special: '#f472b6'
  };

  // Renderizar grid com símbolos - só quando canvas estiver pronto
  const renderGrid = useCallback(() => {
    const grid = gridRef.current;
    if (!grid || !symbols.length || !canvasFullyLoaded) {
      console.log('🎯 Grid render blocked - canvasFullyLoaded:', canvasFullyLoaded);
      return;
    }

    console.log('🎯 Rendering grid with', symbols.length, 'symbols');
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
  }, [symbols, rarityColors, canvasFullyLoaded]);

  // Resetar canvas com imagem temática - controle de carregamento
  const resetCanvas = useCallback((scratchType: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setCanvasFullyLoaded(false);
    console.log('🎯 Resetting canvas, canvasFullyLoaded set to false');

    // Usar a imagem temática específica do tipo de raspadinha
    const scratchCardConfig = {
      sorte: 'https://jhbafgzfphiizpuoqksj.supabase.co/storage/v1/object/public/head-images//quadradoraspadinha01.png',
      dupla: 'https://jhbafgzfphiizpuoqksj.supabase.co/storage/v1/object/public/head-images//quadradoraspadinha03.png',
      ouro: 'https://jhbafgzfphiizpuoqksj.supabase.co/storage/v1/object/public/head-images//qaudradoraspadinhaouro2.png',
      diamante: 'https://jhbafgzfphiizpuoqksj.supabase.co/storage/v1/object/public/head-images//raspadinha-bannerquadradodiamante01%20(1).png',
      premium: 'https://jhbafgzfphiizpuoqksj.supabase.co/storage/v1/object/public/head-images//raspadinha-bannerquadradopremium01%20(1).png'
    };

    const imageUrl = scratchCardConfig[scratchType as keyof typeof scratchCardConfig];
    
    if (imageUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setCanvasFullyLoaded(true);
        console.log('🎯 Canvas image loaded, canvasFullyLoaded set to true');
      };
      img.onerror = () => {
        // Fallback se imagem falhar
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#999';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setCanvasFullyLoaded(true);
        console.log('🎯 Canvas fallback loaded, canvasFullyLoaded set to true');
      };
      img.src = imageUrl;
    } else {
      // Fallback para cinza se não encontrar a imagem
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#999';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      setCanvasFullyLoaded(true);
      console.log('🎯 Canvas fallback loaded, canvasFullyLoaded set to true');
    }
    
    canvas.style.display = 'block';
    setIsRevealed(false);
    setScratchProgress(0);
    setIsVerifying(false);
    setRevealedPositions(Array(9).fill(false));
    scratchAreas.current = { center: 0, corners: 0, sides: 0 };
    lastProgressCheck.current = Date.now();
  }, []);

  // Sistema inteligente de detecção de raspagem com mapeamento 3x3
  const checkScratchProgress = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed || isVerifying) return;

    // Throttling
    const now = Date.now();
    if (now - lastProgressCheck.current < progressCheckInterval) {
      return;
    }
    lastProgressCheck.current = now;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mapear áreas de raspagem em grid 3x3 e atualizar posições reveladas
    const areaWidth = canvas.width / 3;
    const areaHeight = canvas.height / 3;
    const newAreas = { center: 0, corners: 0, sides: 0 };
    const newRevealedPositions = [...revealedPositions];
    let totalCleared = 0;
    let totalPixels = 0;

    // Analisar cada seção do grid 3x3
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const x = col * areaWidth;
        const y = row * areaHeight;
        const index = row * 3 + col;
        
        // Amostragem otimizada para cada área
        const sampleSize = 10;
        const stepX = areaWidth / sampleSize;
        const stepY = areaHeight / sampleSize;
        let areaCleared = 0;
        let areaTotal = 0;

        for (let sx = 0; sx < areaWidth; sx += stepX) {
          for (let sy = 0; sy < areaHeight; sy += stepY) {
            const pixelData = ctx.getImageData(
              Math.floor(x + sx), 
              Math.floor(y + sy), 
              1, 1
            ).data;
            if (pixelData[3] === 0) areaCleared++;
            areaTotal++;
          }
        }

        const areaPercent = (areaCleared / areaTotal) * 100;
        
        // Marcar posição como revelada se mais de 70% foi raspada (mais sensível)
        if (areaPercent > 70) {
          newRevealedPositions[index] = true;
        }
        
        // Classificar área e aplicar peso
        if (index === 4) { // Centro
          newAreas.center = areaPercent;
        } else if ([0, 2, 6, 8].includes(index)) { // Cantos
          newAreas.corners = Math.max(newAreas.corners, areaPercent);
        } else { // Lados
          newAreas.sides = Math.max(newAreas.sides, areaPercent);
        }

        totalCleared += areaCleared;
        totalPixels += areaTotal;
      }
    }

    // Atualizar posições reveladas
    setRevealedPositions(newRevealedPositions);

    // Atualizar áreas de raspagem
    scratchAreas.current = newAreas;

    // Cálculo de progresso ponderado com peso mais balanceado
    const weightedProgress = (
      newAreas.center * 1.5 +  // Centro vale 1.5x (mais reduzido)
      newAreas.corners * 1 +   // Cantos valem 1x
      newAreas.sides * 1.5     // Lados valem 1.5x
    ) / 4; // Normalizar (1.5+1+1.5 = 4)

    const rawProgress = (totalCleared / totalPixels) * 100;
    const finalProgress = Math.max(rawProgress, weightedProgress);
    
    setScratchProgress(Math.round(finalProgress));
    
    // Verificar vitória em tempo real das posições reveladas
    checkWinFromRevealedPositions(newRevealedPositions);
    
    // Revelação mais robusta aos 85% ponderados
    if (finalProgress >= 85 && !isVerifying) {
      setIsVerifying(true);
      console.log('🔥 Iniciando verificação de resultado...');
      
      // Delay mais curto para melhor responsividade  
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas) {
          // Animação de dissolução mais rápida
          let opacity = 1;
          const dissolveAnimation = () => {
            opacity -= 0.15;
            canvas.style.opacity = opacity.toString();
            
            if (opacity > 0) {
              requestAnimationFrame(dissolveAnimation);
            } else {
              canvas.style.display = 'none';
              setIsRevealed(true);
              setScratchProgress(100);
              setRevealedPositions(Array(9).fill(true));
              checkWinFromRevealedPositions(Array(9).fill(true));
            }
          };
          dissolveAnimation();
        }
      }, 800);
    }
  }, [isRevealed, isVerifying, progressCheckInterval, revealedPositions]);

  // Verificar vitória baseada nas posições reveladas
  const checkWinFromRevealedPositions = useCallback((positions: boolean[]) => {
    if (!symbols.length || isVerifying) return;

    console.log('🎯 Verificando vitória com posições:', positions);
    console.log('🎯 Símbolos disponíveis:', symbols.map(s => s.name));

    // Contar apenas símbolos das posições reveladas
    const revealedSymbols = symbols.filter((_, index) => positions[index]);
    const count: { [key: string]: number } = {};
    
    revealedSymbols.forEach(({ name }) => {
      count[name] = (count[name] || 0) + 1;
    });

    console.log('🎯 Contagem de símbolos revelados:', count);

    for (const symbolName in count) {
      if (count[symbolName] >= 3) {
        console.log('🏆 VITÓRIA DETECTADA! Símbolo:', symbolName, 'Quantidade:', count[symbolName]);
        highlightWinners(symbolName);
        onWin(symbolName);
        return;
      }
    }
    
    // Se todas as posições foram reveladas e não há vitória
    if (positions.every(pos => pos)) {
      console.log('❌ Jogo completo - sem vitória');
      onComplete();
    }
  }, [symbols, onWin, onComplete, isVerifying]);

  // Verificar vitória (método legado mantido para compatibilidade)
  const checkWin = useCallback(() => {
    checkWinFromRevealedPositions(Array(9).fill(true));
  }, [checkWinFromRevealedPositions]);

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

  // Função de raspagem inteligente
  const draw = useCallback((e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed || isVerifying || !canvasFullyLoaded || disabled) {
      return;
    }

    // Chama onScratchStart apenas na primeira raspagem
    if (!gameStarted && onScratchStart) {
      onScratchStart();
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    
    // Calcular coordenadas corretas considerando o scale do canvas
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const clientX = 'clientX' in e ? e.clientX : e.touches?.[0]?.clientX || 0;
    const clientY = 'clientY' in e ? e.clientY : e.touches?.[0]?.clientY || 0;
    
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.fill();
    
    checkScratchProgress();
  }, [isRevealed, isVerifying, canvasFullyLoaded, checkScratchProgress, gameStarted, onScratchStart]);

  // Função para revelar tudo automaticamente com animação melhorada
  const revealAll = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed) return;

    setIsVerifying(true);
    
    // Marcar todas as posições como reveladas imediatamente
    const allRevealed = Array(9).fill(true);
    setRevealedPositions(allRevealed);
    
    // Animação de revelação automática com efeito mais suave
    let opacity = 1;
    let scale = 1;
    
    const dissolveAnimation = () => {
      opacity -= 0.08;
      scale += 0.01; // Leve zoom para dar sensação de "dissolução"
      
      canvas.style.opacity = opacity.toString();
      canvas.style.transform = `scale(${scale})`;
      
      if (opacity > 0) {
        requestAnimationFrame(dissolveAnimation);
      } else {
        canvas.style.display = 'none';
        canvas.style.transform = 'scale(1)'; // Reset transform
        setIsRevealed(true);
        setScratchProgress(100);
        checkWinFromRevealedPositions(allRevealed);
      }
    };
    
    // Começar animação imediatamente
    dissolveAnimation();
  }, [isRevealed, checkWinFromRevealedPositions]);

  // Expor função revealAll para o componente pai via useImperativeHandle
  useImperativeHandle(ref, () => ({
    revealAll
  }), [revealAll]);

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
      if (disabled) return;
      console.log('🔥 MOUSE DOWN EVENT FIRED!', e.target);
      console.log('🔥 Event coordinates:', e.clientX, e.clientY);
      isReallyScratching.current = true;
      setIsScratching(true);
      draw(e);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (disabled || !isReallyScratching.current) return;
      console.log('Mouse move - scratching'); // Debug log
      draw(e);
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
      if (disabled) return;
      e.preventDefault();
      console.log('Touch start'); // Debug log
      isReallyScratching.current = true;
      setIsScratching(true);
      draw(e);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (disabled) return;
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

  // Inicializar canvas primeiro, grid depois
  useEffect(() => {
    console.log('🎯 ScratchGameCanvas useEffect called with symbols:', symbols.length);
    if (symbols.length > 0 && !isRevealed) {
      resetCanvas(scratchType); // Canvas primeiro
      console.log('🎯 Canvas reset initiated');
    }
  }, [symbols.length, scratchType, resetCanvas]);

  // Renderizar grid só quando canvas estiver carregado
  useEffect(() => {
    if (canvasFullyLoaded && symbols.length > 0) {
      renderGrid();
      console.log('🎯 Grid rendered after canvas load');
    }
  }, [canvasFullyLoaded, symbols.length, renderGrid]);

  return (
    <div className={cn("relative w-full max-w-sm mx-auto", className)}>
      {/* Grid de símbolos */}
      <div
        ref={gridRef}
        className="grid grid-cols-3 gap-1 p-2 bg-gray-800 rounded-xl relative z-10"
        style={{ minHeight: '300px' }}
      />
      
      {/* Canvas de raspagem - área limpa sem overlays */}
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="absolute top-0 left-0 w-full h-full rounded-xl cursor-pointer z-20"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
});

export default ScratchGameCanvas;