import { useEffect } from 'react';
import { useRouletteAudio } from '@/hooks/useRouletteAudio';
import { useNewRouletteAnimation } from './useNewRouletteAnimation';
import { RouletteControls } from './RouletteControls';
import { NewRouletteTrack } from './NewRouletteTrack';
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
  const { audioState, toggleMute } = useRouletteAudio();
  const theme = chestThemes[chestType as keyof typeof chestThemes] || chestThemes.silver;

  const { 
    trackRef, 
    containerRef, 
    startSpin, 
    resetRoulette,
    state,
    isAnimating,
    canSpin
  } = useNewRouletteAnimation({
    rouletteData,
    onSpinComplete
  });

  // Trigger externo para iniciar o giro
  useEffect(() => {
    if (isSpinning && rouletteData && canSpin) {
      console.log('Iniciando nova animação da roleta');
      startSpin();
    } else if (isSpinning && !canSpin) {
      console.log('Ignorando tentativa de reiniciar roleta - animação em andamento');
    }
  }, [isSpinning, rouletteData, canSpin, startSpin]);

  // Reset quando rouletteData muda
  useEffect(() => {
    if (!isSpinning) {
      resetRoulette();
    }
  }, [rouletteData, isSpinning, resetRoulette]);

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
        <NewRouletteTrack 
          ref={trackRef}
          rouletteSlots={rouletteSlots}
          centerIndex={centerIndex}
          state={state}
        />

        {/* Zona de Destaque Central */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-full pointer-events-none">
          <div className="w-full h-full border-2 border-dashed border-yellow-400/30" />
        </div>

        {/* Efeito de Partículas para Itens Raros */}
        <RouletteParticles show={state === 'winner' && rouletteData?.winnerItem && ['epic', 'legendary', 'special'].includes(rouletteData.winnerItem.rarity)} />
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
      {state === 'winner' && winnerItem && (
        <WinnerDisplay winnerItem={winnerItem} show={true} />
      )}
    </div>
  );
};

export default SpinRouletteWheel;