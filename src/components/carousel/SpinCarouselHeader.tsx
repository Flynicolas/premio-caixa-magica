
import { ArrowDown } from 'lucide-react';
import { SpinCarouselHeaderProps } from './types';

const SpinCarouselHeader = ({ chestName, spinPhase, selectedPrize }: SpinCarouselHeaderProps) => {
  const getStatusMessage = () => {
    switch (spinPhase) {
      case 'ready':
        return 'Prepare-se para descobrir seu prêmio!';
      case 'building':
        return 'Acelerando... 🚀';
      case 'slowing':
        return 'Definindo seu destino... ✨';
      case 'stopping':
        return 'Quase lá... 🎯';
      case 'showing-result':
        return selectedPrize ? `🎉 Você ganhou: ${selectedPrize.name}! 🎉` : '';
      default:
        return '';
    }
  };

  return (
    <>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-white mb-2">
          {chestName}
        </h2>
        <p className="text-white/80">
          {getStatusMessage()}
        </p>
      </div>

      {/* Arrow Indicator */}
      <div className="flex justify-center mb-4">
        <ArrowDown className={`w-8 h-8 text-yellow-400 ${
          spinPhase === 'showing-result' ? 'animate-bounce text-green-400' : 
          spinPhase === 'ready' ? 'animate-bounce' : 'animate-pulse'
        }`} />
      </div>
    </>
  );
};

export default SpinCarouselHeader;
