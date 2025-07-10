import { SpinItem } from './types';
import { rarityTranslations } from './constants';

interface WinnerDisplayProps {
  winnerItem: SpinItem;
  show: boolean;
}

export const WinnerDisplay = ({ winnerItem, show }: WinnerDisplayProps) => {
  if (!show) return null;

  return (
    <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 z-20">
      <div className="bg-black/90 backdrop-blur-sm border-2 border-yellow-400 rounded-lg px-6 py-3 animate-scale-in">
        <div className="text-center">
          <div className="text-yellow-400 font-bold text-lg">🎉 Você ganhou!</div>
          <div className="text-white font-semibold">{winnerItem.name}</div>
          <div className="text-sm text-white/70 capitalize">
            {rarityTranslations[winnerItem.rarity] || winnerItem.rarity}
          </div>
        </div>
      </div>
    </div>
  );
};