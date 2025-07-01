
import { Button } from '@/components/ui/button';
import { X, RotateCcw } from 'lucide-react';
import { SpinControlsProps } from './types';

const SpinControls = ({ isSpinning, selectedPrize, spinPhase, onSpin, onClose }: SpinControlsProps) => {
  const getSpinningStatusText = () => {
    switch (spinPhase) {
      case 'spinning':
        return 'Girando...';
      case 'slowing':
        return 'Desacelerando...';
      case 'stopped':
        return 'Parando...';
      case 'showing-result':
        return 'Resultado!';
      default:
        return '';
    }
  };

  return (
    <div className="flex justify-center items-center space-x-6">
      {/* Ready state - Show spin button */}
      {!isSpinning && spinPhase === 'ready' && (
        <Button
          onClick={onSpin}
          className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold px-12 py-4 text-xl hover:opacity-90 transition-all duration-300 animate-pulse shadow-lg hover:shadow-yellow-400/30"
        >
          <RotateCcw className="w-6 h-6 mr-3" />
          🎯 Girar Roleta
        </Button>
      )}

      {/* Spinning states - Show progress */}
      {(isSpinning || (spinPhase !== 'ready' && spinPhase !== 'showing-result')) && (
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-white font-medium text-xl">
            {getSpinningStatusText()}
          </p>
        </div>
      )}

      {/* Result state - Show celebration */}
      {spinPhase === 'showing-result' && selectedPrize && (
        <div className="text-center">
          <div className="text-5xl font-bold text-green-400 mb-3 animate-bounce">
            🏆 {selectedPrize.name} 🏆
          </div>
          <p className="text-white text-lg mb-4">Preparando sua recompensa...</p>
          <div className="flex justify-center">
            <div className="w-32 h-2 bg-green-400/30 rounded-full overflow-hidden">
              <div className="w-full h-full bg-green-400 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* Close button - Always available but disabled during critical moments */}
      <Button
        onClick={onClose}
        variant="outline"
        className="border-white/30 text-white hover:bg-white/10 transition-all duration-200"
        disabled={spinPhase === 'spinning' || spinPhase === 'slowing'}
      >
        <X className="w-4 h-4 mr-2" />
        {spinPhase === 'showing-result' ? 'Continuar' : 'Fechar'}
      </Button>
    </div>
  );
};

export default SpinControls;
