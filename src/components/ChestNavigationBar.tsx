import { ChestType } from '@/data/chestData';
import { useIsMobile } from '@/hooks/use-mobile';

interface ChestNavigationBarProps {
  onChestSelect: (chestType: ChestType) => void;
  selectedChest?: ChestType;
}

const chestIcons = {
  silver: '🥈',
  gold: '🥇', 
  diamond: '💎',
  ruby: '💎',
  premium: '👑',
  delas: '💖'
};

const chestNames = {
  silver: 'Prata',
  gold: 'Ouro',
  diamond: 'Diamante',
  ruby: 'Rubi',
  premium: 'Premium',
  delas: 'Delas'
};

const chestColors = {
  silver: 'from-gray-400 to-gray-600',
  gold: 'from-yellow-400 to-yellow-600',
  diamond: 'from-blue-400 to-cyan-400',
  ruby: 'from-red-400 to-pink-500',
  premium: 'from-purple-500 to-pink-600',
  delas: 'from-pink-400 to-rose-500'
};

const ChestNavigationBar = ({ onChestSelect, selectedChest }: ChestNavigationBarProps) => {
  const isMobile = useIsMobile();
  const chestOrder: ChestType[] = ['silver', 'gold', 'diamond', 'ruby', 'premium', 'delas'];

  if (!isMobile) return null;

  const scrollToChest = (chestType: ChestType) => {
    onChestSelect(chestType);
    // Pequeno delay para garantir que o estado foi atualizado
    setTimeout(() => {
      const element = document.getElementById(`chest-${chestType}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
  };

  return (
    <div className="sticky top-2 z-10 bg-card/95 backdrop-blur-md border border-border/50 rounded-xl p-2 mx-2 mb-4 shadow-lg">
      <div className="grid grid-cols-6 gap-1">
        {chestOrder.map((chestType) => {
          const isSelected = selectedChest === chestType;
          return (
            <button
              key={chestType}
              onClick={() => scrollToChest(chestType)}
              className={`
                flex flex-col items-center justify-center h-14 rounded-lg
                transition-all duration-200 group relative flex-1
                ${isSelected 
                  ? `bg-gradient-to-br ${chestColors[chestType]} shadow-lg scale-105` 
                  : 'bg-muted/50 hover:bg-muted/80'
                }
              `}
            >
              <div className={`text-base ${isSelected ? 'scale-110' : 'group-hover:scale-105'} transition-transform`}>
                {chestIcons[chestType]}
              </div>
              <span className={`text-[10px] font-medium mt-0.5 leading-none ${
                isSelected ? 'text-white' : 'text-muted-foreground'
              }`}>
                {chestNames[chestType]}
              </span>
              
              {/* Indicador de seleção */}
              {isSelected && (
                <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-md" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ChestNavigationBar;