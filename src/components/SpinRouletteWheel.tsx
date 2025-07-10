
import { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ItemCard from './ItemCard';
import { useRouletteAudio } from '@/hooks/useRouletteAudio';

interface SpinItem {
  id: string;
  name: string;
  image_url?: string | null;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'special';
}

interface RouletteData {
  rouletteSlots: SpinItem[];
  winnerItem: SpinItem;
  centerIndex: number;
  totalSlots: number;
}

interface SpinRouletteWheelProps {
  rouletteData: RouletteData | null;
  onSpinComplete?: (item: SpinItem) => void;
  isSpinning?: boolean;
  className?: string;
  chestType?: string;
}

const SpinRouletteWheel = ({ 
  rouletteData, 
  onSpinComplete, 
  isSpinning = false,
  className = '',
  chestType = 'silver'
}: SpinRouletteWheelProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showWinner, setShowWinner] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [finalTransform, setFinalTransform] = useState('');
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const ITEM_WIDTH = 140; // Largura fixa para cada item

  const {
    audioState,
    startBackgroundMusic,
    stopBackgroundMusic,
    startTickLoop,
    stopTickLoop,
    playRareItemSound,
    toggleMute
  } = useRouletteAudio();

  // Configurações visuais por tipo de baú
  const chestThemes = {
    silver: { border: 'border-gray-400/20', bg: 'bg-gray-900/40', accent: 'text-gray-300' },
    gold: { border: 'border-yellow-400/20', bg: 'bg-yellow-900/40', accent: 'text-yellow-300' },
    delas: { border: 'border-pink-400/20', bg: 'bg-pink-900/40', accent: 'text-pink-300' },
    diamond: { border: 'border-blue-400/20', bg: 'bg-blue-900/40', accent: 'text-blue-300' },
    ruby: { border: 'border-red-400/20', bg: 'bg-red-900/40', accent: 'text-red-300' },
    premium: { border: 'border-purple-500/20', bg: 'bg-purple-900/40', accent: 'text-purple-300' }
  };

  const theme = chestThemes[chestType as keyof typeof chestThemes] || chestThemes.silver;

  const startSpin = useCallback(() => {
    if (!rouletteData || isAnimating || !trackRef.current || !containerRef.current) return;

    setIsAnimating(true);
    setShowWinner(false);
    setShowParticles(false);
    setFinalTransform('');

    const { centerIndex, winnerItem, totalSlots } = rouletteData;

    // Iniciar música de fundo
    startBackgroundMusic();

    // Calcular dimensões exatas
    const containerWidth = containerRef.current.offsetWidth;
    const trackWidth = totalSlots * ITEM_WIDTH;
    
    // Posição exata do centro do container
    const centerPosition = containerWidth / 2;
    
    // Posição do item vencedor (centro do item)
    const winnerItemCenter = centerIndex * ITEM_WIDTH + (ITEM_WIDTH / 2);
    
    // Distância necessária para centralizar o item vencedor
    const targetOffset = winnerItemCenter - centerPosition;
    
    // Adicionar voltas extras (3 voltas completas para suavidade)
    const extraSpins = 3;
    const totalDistance = targetOffset + (extraSpins * trackWidth);

    // Configurar trilha inicial
    if (trackRef.current) {
      trackRef.current.style.transition = 'none';
      trackRef.current.style.transform = `translateX(0px)`;
      trackRef.current.style.width = `${trackWidth * 4}px`; // Simplicado: 4x ao invés de 6x
    }

    // Parâmetros da animação
    const totalDuration = 5000; // 5 segundos
    const startTime = performance.now();
    let currentPosition = 0;
    let lastTickTime = 0;
    let tickSoundActive = false;

    // Função de easing customizada (ease-out-cubic)
    const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

    const animate = (timestamp: number) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);
      
      // Aplicar easing
      const easedProgress = easeOutCubic(progress);
      currentPosition = totalDistance * easedProgress;

      // Atualizar posição visual
      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(-${currentPosition}px)`;
      }

      // Controle do som baseado na velocidade
      const velocity = (currentPosition - (lastTickTime > 0 ? (totalDistance * easeOutCubic((lastTickTime - startTime) / totalDuration)) : 0)) / (timestamp - (lastTickTime || startTime));
      const speed = Math.abs(velocity);
      
      // Som de tick baseado na velocidade
      if (speed > 0.1 && !tickSoundActive) {
        tickSoundActive = true;
        const tickInterval = Math.max(30, 200 - (speed * 150));
        startTickLoop(tickInterval);
        setTimeout(() => {
          stopTickLoop();
          tickSoundActive = false;
        }, tickInterval);
      }

      if (progress < 1) {
        lastTickTime = timestamp;
        requestAnimationFrame(animate);
      } else {
        // Animação finalizada
        stopTickLoop();
        stopBackgroundMusic();
        
        // Garantir posição final exata
        if (trackRef.current) {
          trackRef.current.style.transform = `translateX(-${totalDistance}px)`;
        }
        setFinalTransform(`translateX(-${totalDistance}px)`);
        setIsAnimating(false);

        // Mostrar resultado com delay
        setTimeout(() => {
          setShowWinner(true);

          // Som especial para itens raros
          if (['rare', 'epic', 'legendary', 'special'].includes(winnerItem.rarity)) {
            playRareItemSound(winnerItem.rarity);
          }

          // Partículas para itens épicos+
          if (['epic', 'legendary', 'special'].includes(winnerItem.rarity)) {
            setShowParticles(true);
            setTimeout(() => setShowParticles(false), 3000);
          }

          // Zoom no item e callback
          setTimeout(() => {
            onSpinComplete?.(winnerItem);
          }, 1500); // Mais tempo para apreciar o zoom
        }, 300);
      }
    };

    // Iniciar animação
    requestAnimationFrame(animate);
  }, [rouletteData, isAnimating, startBackgroundMusic, stopBackgroundMusic, startTickLoop, stopTickLoop, playRareItemSound, onSpinComplete]);

  // Trigger externo para iniciar o giro
  useEffect(() => {
    if (isSpinning && rouletteData && !isAnimating) {
      startSpin();
    }
  }, [isSpinning, rouletteData, isAnimating, startSpin]);

  if (!rouletteData) {
    return (
      <div className={`flex items-center justify-center h-40 ${className}`}>
        <div className="text-white/70">Carregando roleta...</div>
      </div>
    );
  }

  const { rouletteSlots, centerIndex } = rouletteData;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Controles de Áudio */}
      <div className="absolute top-4 right-4 z-30">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleMute}
          className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
        >
          {audioState.isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </Button>
      </div>

      {/* Seta Dourada */}
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-20">
        <div 
          className="text-4xl animate-pulse text-yellow-400"
          style={{ 
            filter: 'drop-shadow(0 0 8px rgb(251 191 36 / 0.8))',
            textShadow: '0 0 12px rgb(251 191 36 / 0.8)'
          }}
        >
          ▼
        </div>
      </div>

      {/* Container da Roleta */}
      <div className={`relative w-full max-w-4xl mx-auto h-40 overflow-hidden rounded-xl border-4 ${theme.border} ${theme.bg} backdrop-blur-sm`}>
        {/* Trilha dos Itens */}
        <div
          ref={trackRef}
          className="flex absolute top-0 left-0 h-full"
          style={{ transform: finalTransform }}
        >
          {/* Criar trilha contínua duplicando os itens 4 vezes */}
          {Array.from({ length: 4 }, (_, duplicateIndex) =>
            rouletteSlots.map((item, index) => {
              const isWinningItem = showWinner && duplicateIndex === 0 && index === centerIndex;
              return (
                <div
                  key={`${duplicateIndex}-${item.id}-${index}`}
                  className={`
                    flex-shrink-0 mx-2 my-4 transition-all duration-500
                    ${isWinningItem ? 'scale-125 z-20' : ''}
                  `}
                  style={{
                    width: `${ITEM_WIDTH - 16}px`,
                    filter: isWinningItem
                      ? 'drop-shadow(0 0 20px rgba(255, 255, 0, 0.9)) brightness(1.1)'
                      : 'none'
                  }}
                >
                  <ItemCard
                    item={item}
                    size="md"
                    showRarity={false}
                    className={isWinningItem ? 'border-yellow-400 border-2' : ''}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Zona de Destaque Central */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-full pointer-events-none">
          <div className="w-full h-full border-2 border-dashed border-yellow-400/30" />
        </div>

        {/* Efeito de Partículas para Itens Raros */}
        {showParticles && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <Sparkles
                key={i}
                className="absolute animate-ping text-yellow-400"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random()}s`
                }}
                size={12 + Math.random() * 8}
              />
            ))}
          </div>
        )}
      </div>

      {/* Indicador de Girando */}
      {isAnimating && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-xl z-10">
          <div className={`text-xl font-bold animate-pulse ${theme.accent}`}>
            🎰 Girando a roleta...
          </div>
        </div>
      )}

      {/* Anúncio do Vencedor */}
      {showWinner && rouletteData.winnerItem && (
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-black/90 backdrop-blur-sm border-2 border-yellow-400 rounded-lg px-6 py-3 animate-scale-in">
            <div className="text-center">
              <div className="text-yellow-400 font-bold text-lg">🎉 Você ganhou!</div>
              <div className="text-white font-semibold">{rouletteData.winnerItem.name}</div>
              <div className="text-sm text-white/70 capitalize">
                {rouletteData.winnerItem.rarity === 'common' && 'Comum'}
                {rouletteData.winnerItem.rarity === 'rare' && 'Raro'}
                {rouletteData.winnerItem.rarity === 'epic' && 'Épico'}
                {rouletteData.winnerItem.rarity === 'legendary' && 'Lendário'}
                {rouletteData.winnerItem.rarity === 'special' && 'Especial'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpinRouletteWheel;
