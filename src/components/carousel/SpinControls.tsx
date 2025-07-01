
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { SpinControlsProps } from './types';

const SpinControls = ({ isSpinning, selectedPrize, spinPhase, onSpin, onClose }: SpinControlsProps) => {
  const getSpinningStatusText = () => {
    switch (spinPhase) {
      case 'building':
        return 'Acelerando...';
      case 'slowing':
        return 'Definindo...';
      case 'stopping':
        return 'Parando...';
      default:
        return '';
    }
  };

  return (
    <div className="flex justify-center space-x-4">
      {!isSpinning && !selectedPrize && spinPhase === 'ready' && (
        <Button
          onClick={onSpin}
          className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold px-10 py-4 text-xl hover:opacity-90 transition-all duration-300 animate-pulse shadow-lg"
        >
          🎯 Girar Roleta
        </Button>
      )}

      {isSpinning && spinPhase !== 'showing-result' && (
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-white font-medium text-xl">
            {getSpinningStatusText()}
          </p>
        </div>
      )}

      {spinPhase === 'showing-result' && selectedPrize && (
        <div className="text-center">
          <div className="text-4xl font-bold text-green-400 mb-2 animate-bounce">
            🎉 {selectedPrize.name} 🎉
          </div>
          <p className="text-white text-lg">Preparando sua recompensa...</p>
          <div className="mt-4">
            <div className="w-24 h-1 bg-green-400 rounded-full mx-auto animate-pulse" />
          </div>
        </div>
      )}

      <Button
        onClick={onClose}
        variant="outline"
        className="border-white/30 text-white hover:bg-white/10"
        disabled={isSpinning && spinPhase !== 'showing-result'}
      >
        <X className="w-4 h-4 mr-2" />
        {spinPhase === 'showing-result' ? 'Pular' : 'Fechar'}
      </Button>
    </div>
  );
};

export default SpinControls;
