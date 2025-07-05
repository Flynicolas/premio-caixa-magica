
import { DatabaseItem } from '@/types/database';
import { SpinPhase } from './types';

interface SpinCarouselHeaderProps {
  chestName: string;
  spinPhase: SpinPhase;
  selectedPrize: DatabaseItem | null;
}

const SpinCarouselHeader = ({ chestName, spinPhase, selectedPrize }: SpinCarouselHeaderProps) => {
  return (
    <div className="text-center mb-8">
      <h2 className="text-4xl font-bold text-white mb-4">
        {chestName}
      </h2>
      
      {spinPhase === 'showing-result' && selectedPrize && (
        <div className="bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 rounded-xl p-6 backdrop-blur-sm">
          <h3 className="text-2xl font-bold text-primary mb-2">
            Parabéns! Você ganhou:
          </h3>
          <div className="flex items-center justify-center space-x-4">
            {selectedPrize.image_url && (
              <img 
                src={selectedPrize.image_url} 
                alt={selectedPrize.name}
                className="w-16 h-16 rounded-lg object-contain"
              />
            )}
            <div>
              <p className="text-xl font-bold text-white">{selectedPrize.name}</p>
              <p className="text-lg text-green-400">R$ {Number(selectedPrize.base_value).toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpinCarouselHeader;
