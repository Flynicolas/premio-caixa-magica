
import { ArrowDown } from 'lucide-react';
import { SpinCarouselHeaderProps } from './types';

const SpinCarouselHeader = ({ chestName, spinPhase, selectedPrize }: SpinCarouselHeaderProps) => {
  const getStatusMessage = () => {
    switch (spinPhase) {
      case 'ready':
        return 'Prepare-se para descobrir seu prêmio!';
      case 'spinning':
        return 'Girando a roleta... 🎯';
      case 'slowing':
        return 'Desacelerando... quase lá! ⚡';
      case 'stopped':
        return 'Definindo seu prêmio... ✨';
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
        <p className={`text-white/80 text-lg transition-all duration-300 ${
          spinPhase === 'showing-result' ? 'text-green-400 animate-pulse' : ''
        }`}>
          {getStatusMessage()}
        </p>
      </div>

      {/* Arrow Indicator */}
      <div className="flex justify-center mb-4">
        <ArrowDown className={`w-8 h-8 transition-all duration-300 ${
          spinPhase === 'showing-result' ? 'text-green-400 animate-bounce scale-125' : 
          spinPhase === 'ready' ? 'text-yellow-400 animate-bounce' : 
          'text-yellow-400 animate-pulse'
        }`} />
      </div>
    </>
  );
};

export default SpinCarouselHeader;
