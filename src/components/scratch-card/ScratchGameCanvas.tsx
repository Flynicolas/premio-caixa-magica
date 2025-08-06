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
  center: number;
  corners: number;
  sides: number;
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
  const [winDetected, setWinDetected] = useState(false);
  const [winAnimationShown, setWinAnimationShown] = useState(false);
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

  // Renderizar grid com símbolos
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
        transition: all 0.3s ease;
      `;
      
      const img = document.createElement('img');
      img.src = image_url;
      img.alt = name;
      img.style.cssText = `
        width: 32px;
        height: 32px;
        object-fit: contain;
        margin-bottom: 4px;
      `;
      
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

  // Resetar canvas com imagem temática
  const resetCanvas = useCallback((scratchType: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setCanvasFullyLoaded(false);
    setWinDetected(false);
    setWinAnimationShown(false);

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
      };
      img.onerror = () => {
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#999';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setCanvasFullyLoaded(true);
      };
      img.src = imageUrl;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#999';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      setCanvasFullyLoaded(true);
    }
    
    canvas.style.display = 'block';
    setIsRevealed(false);
    setScratchProgress(0);
    setIsVerifying(false);
    setRevealedPositions(Array(9).fill(false));
    scratchAreas.current = { center: 0, corners: 0, sides: 0 };
    lastProgressCheck.current = Date.now();
  }, []);

  // Verificar vitória baseada nas posições reveladas - COM DELAY PARA ANIMAÇÃO
  const checkWinFromRevealedPositions = useCallback((positions: boolean[]) => {
    if (!symbols.length || isVerifying || winDetected) return;

    console.log('🎯 Verificando vitória com posições:', positions);

    // Contar símbolos revelados
    const revealedSymbols = symbols.filter((_, index) => positions[index]);
    const count: { [key: string]: number } = {};
    
    revealedSymbols.forEach(({ name }) => {
      count[name] = (count[name] || 0) + 1;
    });

    console.log('🎯 Contagem de símbolos revelados:', count);

    // Verificar se há 3 símbolos iguais revelados
    for (const symbolName in count) {
      if (count[symbolName] >= 3) {
        console.log('🏆 VITÓRIA DETECTADA! Símbolo:', symbolName);
        
        if (!winDetected) {
          setWinDetected(true);
          
          // AGUARDAR um momento antes de mostrar a animação de vitória
          setTimeout(() => {
            if (!winAnimationShown) {
              setWinAnimationShown(true);
              highlightWinners(symbolName);
              
              // Aguardar mais um pouco antes de chamar onWin
              setTimeout(() => {
                onWin(symbolName);
              }, 800);
            }
          }, 1200); // 1.2s de delay para não ficar mecânico
        }
        return;
      }
    }
    
    // Se todas reveladas e sem vitória
    if (positions.every(pos => pos) && !winDetected) {
      console.log('❌ Jogo completo - sem vitória');
      onComplete();
    }
  }, [symbols, onWin, onComplete, isVerifying, winDetected, winAnimationShown]);

  // Sistema de detecção de raspagem otimizado
  const checkScratchProgress = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed || isVerifying) return;

    const now = Date.now();
    if (now - lastProgressCheck.current < progressCheckInterval) {
      return;
    }
    lastProgressCheck.current = now;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const areaWidth = canvas.width / 3;
    const areaHeight = canvas.height / 3;
    const newRevealedPositions = [...revealedPositions];
    let totalCleared = 0;
    let totalPixels = 0;

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const x = col * areaWidth;
        const y = row * areaHeight;
        const index = row * 3 + col;
        
        const sampleSize = 8;
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
        
        // Marcar como revelado se >60% foi raspado
        if (areaPercent > 60 && !newRevealedPositions[index]) {
          newRevealedPositions[index] = true;
          console.log(`🎯 Posição ${index} revelada (${areaPercent.toFixed(1)}%)`);
        }

        totalCleared += areaCleared;
        totalPixels += areaTotal;
      }
    }

    // Atualizar posições reveladas
    setRevealedPositions(newRevealedPositions);

    // Verificar vitória em tempo real
    checkWinFromRevealedPositions(newRevealedPositions);

    const rawProgress = (totalCleared / totalPixels) * 100;
    setScratchProgress(Math.round(rawProgress));
    
    // Auto-revelar aos 85%
    if (rawProgress >= 85 && !isVerifying) {
      setIsVerifying(true);
      
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas && !isRevealed) {
          let opacity = 1;
          const dissolveAnimation = () => {
            opacity -= 0.1;
            canvas.style.opacity = opacity.toString();
            
            if (opacity > 0) {
              requestAnimationFrame(dissolveAnimation);
            } else {
              canvas.style.display = 'none';
              setIsRevealed(true);
              setScratchProgress(100);
              const allRevealed = Array(9).fill(true);
              setRevealedPositions(allRevealed);
              
              // Só verificar vitória se ainda não foi detectada
              if (!winDetected) {
                checkWinFromRevealedPositions(allRevealed);
              }
            }
          };
          dissolveAnimation();
        }
      }, 500);
    }
  }, [isRevealed, isVerifying, progressCheckInterval, revealedPositions, checkWinFromRevealedPositions, winDetected]);

  // Destacar símbolos vencedores com animação melhorada
  const highlightWinners = useCallback((winningSymbol: string) => {
    const grid = gridRef.current;
    if (!grid) return;

    Array.from(grid.children).forEach((div: any) => {
      if (div.dataset.symbol === winningSymbol) {
        div.style.border = '3px solid #FFD700';
        div.style.background = 'linear-gradient(45deg, #FFD700, #FFA500)';
        div.style.transform = 'scale(1.08)';
        div.style.boxShadow = '0 0 25px rgba(255, 215, 0, 0.8)';
        div.style.zIndex = '10';
        
        // Animação pulsante mais suave
        div.style.animation = 'pulse 1.5s ease-in-out infinite';
      }
    });
  }, []);

  // Função de raspagem
  const draw = useCallback((e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed || isVerifying || !canvasFullyLoaded || disabled) {
      return;
    }

    if (!gameStarted && onScratchStart) {
      onScratchStart();
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
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
  }, [isRevealed, isVerifying, canvasFullyLoaded, checkScratchProgress, gameStarted, onScratchStart, disabled]);

  // Função para revelar tudo rapidamente (mantendo o botão existente)
  const revealAll = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed || isVerifying) return;

    console.log('🎯 Revelação rápida ativada');
    setIsVerifying(true);
    
    const allRevealed = Array(9).fill(true);
    setRevealedPositions(allRevealed);
    
    // Animação rápida de revelação
    let opacity = 1;
    const quickReveal = () => {
      opacity -= 0.15;
      canvas.style.opacity = opacity.toString();
      
      if (opacity > 0) {
        requestAnimationFrame(quickReveal);
      } else {
        canvas.style.display = 'none';
        setIsRevealed(true);
        setScratchProgress(100);
        
        // Verificar resultado imediatamente na revelação rápida
        if (!winDetected) {
          checkWinFromRevealedPositions(allRevealed);
        }
      }
    };
    quickReveal();
  }, [isRevealed, isVerifying, checkWinFromRevealedPositions, winDetected]);

  useImperativeHandle(ref, () => ({
    revealAll
  }), [revealAll]);

  const isReallyScratching = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (disabled) return;
      isReallyScratching.current = true;
      setIsScratching(true);
      draw(e);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (disabled || !isReallyScratching.current) return;
      draw(e);
    };
    
    const handleMouseUp = () => {
      isReallyScratching.current = false;
      setIsScratching(false);
    };
    
    const handleMouseLeave = () => {
      isReallyScratching.current = false;
      setIsScratching(false);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (disabled) return;
      e.preventDefault();
      isReallyScratching.current = true;
      setIsScratching(true);
      draw(e);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (disabled) return;
      e.preventDefault();
      if (isReallyScratching.current) {
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
  }, [draw, disabled]);

  useEffect(() => {
    if (symbols.length > 0 && !isRevealed) {
      resetCanvas(scratchType);
    }
  }, [symbols.length, scratchType, resetCanvas]);

  useEffect(() => {
    if (canvasFullyLoaded && symbols.length > 0) {
      renderGrid();
    }
  }, [canvasFullyLoaded, symbols.length, renderGrid]);

  return (
    <div className={cn("relative w-full max-w-sm mx-auto", className)}>
      <div
        ref={gridRef}
        className="grid grid-cols-3 gap-1 p-2 bg-gray-800 rounded-xl relative z-10"
        style={{ minHeight: '300px' }}
      />
      
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="absolute top-0 left-0 w-full h-full rounded-xl cursor-pointer z-20"
        style={{ touchAction: 'none' }}
      />

      {/* Indicador de progresso discreto */}
      {scratchProgress > 0 && scratchProgress < 100 && (
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded z-30">
          {scratchProgress}%
        </div>
      )}

      {/* Animação de vitória mais discreta */}
      {winDetected && winAnimationShown && (
        <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-xl font-bold text-lg animate-bounce">
            🎉 Você Ganhou! 🎉
          </div>
        </div>
      )}
    </div>
  );
});

export default ScratchGameCanvas;
