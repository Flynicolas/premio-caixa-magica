import { useState, useEffect } from 'react';
import { useRouletteAudio } from '@/hooks/useRouletteAudio';
import { useRouletteAnimation } from './useRouletteAnimation';
import { RouletteControls } from './RouletteControls';
import { RouletteTrack } from './RouletteTrack';
import { RouletteParticles } from './RouletteParticles';
import { WinnerDisplay } from './WinnerDisplay';
import { SpinRouletteWheelProps } from './types';
import { chestThemes } from './constants';

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

  const { audioState, toggleMute } = useRouletteAudio();
  const theme = chestThemes[chestType as keyof typeof chestThemes] || chestThemes.silver;

  const { trackRef, containerRef, startSpin } = useRouletteAnimation({
    rouletteData,
    isAnimating,
    onAnimationComplete: (transform) => {
      setFinalTransform(transform);
      setIsAnimating(false);
    },
    onShowWinner: () => {
      setShowWinner(true);
      
      // Mostrar partículas para itens épicos ou superiores
      if (rouletteData?.winnerItem && ['epic', 'legendary', 'special'].includes(rouletteData.winnerItem.rarity)) {
        setShowParticles(true);
        setTimeout(() => setShowParticles(false), 3000);
      }
    },
    onSpinComplete
  });

  // Trigger externo para iniciar o giro - com proteção contra reinicialização
  useEffect(() => {
    if (isSpinning && rouletteData && !isAnimating && !showWinner) {
      console.log('Iniciando nova animação da roleta');
      setIsAnimating(true);
      setShowWinner(false);
      setShowParticles(false);
      setFinalTransform('');
      startSpin();
    } else if (isSpinning && (isAnimating || showWinner)) {
      console.log('Ignorando tentativa de reiniciar roleta - animação em andamento ou já finalizada');
    }
  }, [isSpinning, rouletteData, isAnimating, showWinner, startSpin]);

  if (!rouletteData) {
    return (
      <div className={`flex items-center justify-center h-40 ${className}`}>
        <div className="text-white/70">Carregando roleta...</div>
      </div>
    );
  }

  const { rouletteSlots, centerIndex, winnerItem } = rouletteData;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Controles de Áudio */}
      <RouletteControls 
        isMuted={audioState.isMuted} 
        onToggleMute={toggleMute} 
      />

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
        <RouletteTrack 
          ref={trackRef}
          rouletteSlots={rouletteSlots}
          centerIndex={centerIndex}
          showWinner={showWinner}
          finalTransform={finalTransform}
        />

        {/* Zona de Destaque Central */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-full pointer-events-none">
          <div className="w-full h-full border-2 border-dashed border-yellow-400/30" />
        </div>

        {/* Efeito de Partículas para Itens Raros */}
        <RouletteParticles show={showParticles} />
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
      {showWinner && winnerItem && (
        <WinnerDisplay winnerItem={winnerItem} show={showWinner} />
      )}
    </div>
  );
};

export default SpinRouletteWheel;