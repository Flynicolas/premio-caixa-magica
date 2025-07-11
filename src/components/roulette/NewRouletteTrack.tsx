import { forwardRef } from 'react';
import ItemCard from '../ItemCard';
import { SpinItem } from './types';
import { ITEM_WIDTH } from './constants';
import { RouletteState } from './useRouletteState';

interface NewRouletteTrackProps {
  rouletteSlots: SpinItem[];
  centerIndex: number;
  state: RouletteState;
}

export const NewRouletteTrack = forwardRef<HTMLDivElement, NewRouletteTrackProps>(
  ({ rouletteSlots, centerIndex, state }, ref) => {
    // Criar trilha com repetições para permitir loop visual contínuo (6x para garantir animação suave)
    const repeatedSlots = Array.from({ length: 6 }, (_, duplicateIndex) =>
      rouletteSlots.map((item, index) => ({
        ...item,
        uniqueKey: `${duplicateIndex}-${item.id}-${index}`
      }))
    ).flat();

    return (
      <div
        ref={ref}
        className="flex absolute top-0 left-0 h-full"
        style={{ 
          width: `${rouletteSlots.length * ITEM_WIDTH * 6}px`,
          willChange: 'transform'
        }}
      >
        {repeatedSlots.map((item, globalIndex) => {
          const originalIndex = globalIndex % rouletteSlots.length;
          const duplicateIndex = Math.floor(globalIndex / rouletteSlots.length);
          
          // Item vencedor está na posição onde a animação para (quinta repetição)
          const isWinningItem = state === 'winner' && duplicateIndex === 4 && originalIndex === centerIndex;

          return (
            <div
              key={item.uniqueKey}
              className={`
                flex-shrink-0 mx-2 my-4 transition-all duration-500 ease-out
                ${isWinningItem ? 'scale-125 z-50' : 'scale-100 z-20'}
              `}
              style={{
                width: `${ITEM_WIDTH - 16}px`,
                filter: isWinningItem
                  ? 'drop-shadow(0 0 30px rgba(255, 215, 0, 1)) drop-shadow(0 0 60px rgba(255, 255, 0, 0.8)) brightness(1.3) saturate(1.5)'
                  : 'none',
                transformOrigin: 'center center'
              }}
            >
              <ItemCard
                item={item}
                size="md"
                showRarity={false}
                className={isWinningItem ? 'border-yellow-400 border-4 shadow-2xl' : ''}
              />
            </div>
          );
        })}
      </div>
    );
  }
);

NewRouletteTrack.displayName = 'NewRouletteTrack';