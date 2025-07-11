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
    // Criar trilha com repetições suficientes para o loop visual (3x é suficiente)
    const repeatedSlots = Array.from({ length: 3 }, (_, duplicateIndex) =>
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
          width: `${rouletteSlots.length * ITEM_WIDTH * 3}px`,
          willChange: 'transform'
        }}
      >
        {repeatedSlots.map((item, globalIndex) => {
          const originalIndex = globalIndex % rouletteSlots.length;
          const duplicateIndex = Math.floor(globalIndex / rouletteSlots.length);
          
          // Item vencedor está na primeira repetição (duplicateIndex === 0) e no centerIndex correto
          const isWinningItem = state === 'winner' && duplicateIndex === 0 && originalIndex === centerIndex;

          return (
            <div
              key={item.uniqueKey}
              className={`
                flex-shrink-0 mx-2 my-4 transition-all duration-300 ease-out
                ${isWinningItem ? 'scale-125 z-30' : 'scale-100 z-10'}
              `}
              style={{
                width: `${ITEM_WIDTH - 16}px`,
                filter: isWinningItem
                  ? 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.9)) drop-shadow(0 0 40px rgba(255, 255, 0, 0.6)) brightness(1.2) saturate(1.3)'
                  : 'none',
                transformOrigin: 'center center'
              }}
            >
              <ItemCard
                item={item}
                size="md"
                showRarity={false}
                className={isWinningItem ? 'border-yellow-400 border-2 shadow-2xl' : ''}
              />
            </div>
          );
        })}
      </div>
    );
  }
);

NewRouletteTrack.displayName = 'NewRouletteTrack';