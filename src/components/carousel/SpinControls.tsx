
import { Button } from '@/components/ui/button';
import { DatabaseItem } from '@/types/database';
import { SpinPhase } from './types';

interface SpinControlsProps {
  isSpinning: boolean;
  selectedPrize: DatabaseItem | null;
  spinPhase: SpinPhase;
  onSpin: () => void;
  onClose: () => void;
}

const SpinControls = ({ 
  isSpinning, 
  selectedPrize, 
  spinPhase, 
  onSpin, 
  onClose 
}: SpinControlsProps) => {
  return (
    <div className="flex justify-center space-x-4">
      {spinPhase === 'ready' && (
        <>
          <Button
            onClick={onSpin}
            disabled={isSpinning}
            size="lg"
            className="bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {isSpinning ? 'Sorteando...' : 'Sortear Prêmio'}
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            size="lg"
            className="px-8 py-3 text-lg border-white/20 text-white hover:bg-white/10"
          >
            Fechar
          </Button>
        </>
      )}
      
      {(spinPhase === 'spinning' || spinPhase === 'slowing' || spinPhase === 'stopped') && (
        <div className="text-center">
          <div className="text-white text-lg font-medium mb-2">
            {spinPhase === 'spinning' && 'Sorteando seu prêmio...'}
            {spinPhase === 'slowing' && 'Quase lá...'}
            {spinPhase === 'stopped' && selectedPrize && `Você ganhou: ${selectedPrize.name}!`}
          </div>
          {spinPhase === 'stopped' && (
            <div className="text-gray-300 text-sm">
              Aguarde para ver seu prêmio...
            </div>
          )}
        </div>
      )}
      
      {spinPhase === 'showing-result' && (
        <div className="text-center">
          <div className="text-white text-lg font-medium mb-4">
            Seu prêmio será adicionado ao seu inventário!
          </div>
          <Button
            onClick={onClose}
            size="lg"
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold px-8 py-3 text-lg"
          >
            Continuar
          </Button>
        </div>
      )}
    </div>
  );
};

export default SpinControls;
