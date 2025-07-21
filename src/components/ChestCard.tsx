
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Chest, ChestType } from '@/data/chestData';
import { useChestItemCount } from '@/hooks/useChestItemCount';
import ChestOpeningModal from './ChestOpeningModal';
import ChestImageDisplay from './ChestCard/ChestImageDisplay';
import ChestItemPreview from './ChestCard/ChestItemPreview';
import ChestActionButton from './ChestCard/ChestActionButton';
import { DatabaseItem } from '@/types/database';

interface ChestCardProps {
  chest: Chest;
  chestType: ChestType;
  onOpen: () => void;
  onViewItems: () => void;
  balance: number;
  isAuthenticated: boolean;
  onPrizeWon?: (prize: DatabaseItem) => void;
  onAddBalance?: () => void;
}


const ChestCard = ({ 
  chest, 
  chestType, 
  onOpen, 
  onViewItems, 
  balance, 
  isAuthenticated,
  onPrizeWon,
  onAddBalance
}: ChestCardProps) => {
  const [showOpeningModal, setShowOpeningModal] = useState(false);
  const { hasMinimumItems, loading } = useChestItemCount(chestType);

  const handleOpenChest = () => {
    if (balance >= chest.price && hasMinimumItems) {
      setShowOpeningModal(true);
    }
  };

  const handlePrizeWon = (prize: DatabaseItem) => {
    if (onPrizeWon) {
      onPrizeWon(prize);
    }
  };
  
  const chestThemes = {
    silver: {
      border: 'border-slate-300/40',
      titleGradient: 'bg-gradient-to-r from-slate-200 via-gray-100 to-slate-300 bg-clip-text text-transparent',
      titleStyle: 'text-stroke-white',
      cardGlow: 'shadow-slate-400/30',
      cardBg: 'bg-gradient-to-br from-slate-50/5 to-gray-100/10'
    },
    gold: {
      border: 'border-yellow-400/50', 
      titleGradient: 'bg-gradient-to-r from-yellow-200 via-amber-100 to-yellow-300 bg-clip-text text-transparent',
      titleStyle: '',
      cardGlow: 'shadow-yellow-500/40',
      cardBg: 'bg-gradient-to-br from-yellow-50/5 to-amber-100/10'
    },
    delas: {
      border: 'border-pink-400/50',
      titleGradient: 'bg-gradient-to-r from-pink-200 via-rose-100 to-fuchsia-300 bg-clip-text text-transparent', 
      titleStyle: '',
      cardGlow: 'shadow-pink-500/40',
      cardBg: 'bg-gradient-to-br from-pink-50/5 to-rose-100/10'
    },
    diamond: {
      border: 'border-cyan-400/50',
      titleGradient: 'bg-gradient-to-r from-cyan-200 via-blue-100 to-sky-300 bg-clip-text text-transparent',
      titleStyle: '',
      cardGlow: 'shadow-cyan-500/40',
      cardBg: 'bg-gradient-to-br from-cyan-50/5 to-blue-100/10'
    },
    ruby: {
      border: 'border-red-400/50',
      titleGradient: 'bg-gradient-to-r from-red-200 via-rose-100 to-pink-300 bg-clip-text text-transparent',
      titleStyle: '',
      cardGlow: 'shadow-red-500/40',
      cardBg: 'bg-gradient-to-br from-red-50/5 to-rose-100/10'
    },
    premium: {
      border: 'border-purple-500/50',
      titleGradient: 'bg-gradient-to-r from-purple-200 via-violet-100 to-fuchsia-300 bg-clip-text text-transparent',
      titleStyle: '',
      cardGlow: 'shadow-purple-500/40',
      cardBg: 'bg-gradient-to-br from-purple-50/5 to-violet-100/10'
    }
  };

  const chestTheme = chestThemes[chestType] || chestThemes.silver;

  return (
    <Card className={`relative overflow-hidden ${chestTheme.border} ${chestTheme.cardBg} bg-card/50 hover:bg-card/70 transition-all duration-300 group h-full border-2 hover:${chestTheme.cardGlow} hover:shadow-lg`}
      key={chest.name + chest.price}
    >
      <CardContent className="p-8 flex flex-col h-full min-h-[520px]">
        {/* Header com nome e preço tematizado */}
        <div className="text-center mb-8">
          <h3 className={`text-2xl font-bold mb-3 ${chestTheme.titleGradient} ${chestTheme.titleStyle} drop-shadow-sm`}>
            {chest.name}
          </h3>
          <div className="text-3xl font-bold text-white">
            R$ {chest.price.toFixed(2).replace('.', ',')}
          </div>
        </div>

        <ChestImageDisplay 
          chestType={chestType}
          chestName={chest.name}
          onViewItems={onViewItems}
        />

        <ChestItemPreview chestType={chestType} />

        <ChestActionButton
          chestType={chestType}
          price={chest.price}
          balance={balance}
          hasMinimumItems={hasMinimumItems}
          loading={loading}
          isAuthenticated={isAuthenticated}
          onOpen={handleOpenChest}
          onAddBalance={onAddBalance}
        />
      </CardContent>
      
      {/* Chest Opening Modal */}
      <ChestOpeningModal
        isOpen={showOpeningModal}
        onClose={() => setShowOpeningModal(false)}
        chestType={chestType}
        chestName={chest.name}
        chestPrice={chest.price}
        onPrizeWon={handlePrizeWon}
      />
    </Card>
  );
};

export default ChestCard;
