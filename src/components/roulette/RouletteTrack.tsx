import { forwardRef } from 'react';
import ItemCard from '../ItemCard';
import { SpinItem } from './types';
import { ITEM_WIDTH } from './constants';

interface RouletteTrackProps {
  rouletteSlots: SpinItem[];
  centerIndex: number;
  showWinner: boolean;
  finalTransform: string;
}

export const RouletteTrack = forwardRef<HTMLDivElement, RouletteTrackProps>(
  ({ rouletteSlots, centerIndex, showWinner, finalTransform }, ref) => {
    return (
      <div
        ref={ref}
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
    );
  }
);

RouletteTrack.displayName = 'RouletteTrack';