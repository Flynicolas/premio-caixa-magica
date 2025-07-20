
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
      border: 'border-gray-400/30',
      titleGradient: 'bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300 bg-clip-text text-transparent',
      cardGlow: 'shadow-gray-400/20'
    },
    gold: {
      border: 'border-yellow-400/30', 
      titleGradient: 'bg-gradient-to-r from-yellow-300 via-yellow-100 to-yellow-300 bg-clip-text text-transparent',
      cardGlow: 'shadow-yellow-400/20'
    },
    delas: {
      border: 'border-pink-400/30',
      titleGradient: 'bg-gradient-to-r from-pink-300 via-rose-200 to-pink-300 bg-clip-text text-transparent', 
      cardGlow: 'shadow-pink-400/20'
    },
    diamond: {
      border: 'border-blue-400/30',
      titleGradient: 'bg-gradient-to-r from-blue-300 via-cyan-200 to-blue-300 bg-clip-text text-transparent',
      cardGlow: 'shadow-blue-400/20'
    },
    ruby: {
      border: 'border-red-400/30',
      titleGradient: 'bg-gradient-to-r from-red-300 via-pink-200 to-red-300 bg-clip-text text-transparent',
      cardGlow: 'shadow-red-400/20'
    },
    premium: {
      border: 'border-purple-500/30',
      titleGradient: 'bg-gradient-to-r from-purple-300 via-pink-200 to-purple-300 bg-clip-text text-transparent',
      cardGlow: 'shadow-purple-400/20'
    }
  };

  const chestTheme = chestThemes[chestType] || chestThemes.silver;

  return (
    <Card className={`relative overflow-hidden ${chestTheme.border} bg-card/50 hover:bg-card/70 transition-all duration-300 group h-full border-2 hover:${chestTheme.cardGlow} hover:shadow-lg`}
      key={chest.name + chest.price}
    >
      <CardContent className="p-8 flex flex-col h-full min-h-[520px]">
        {/* Header com nome e preço tematizado */}
        <div className="text-center mb-8">
          <h3 className={`text-2xl font-bold mb-3 ${chestTheme.titleGradient} drop-shadow-sm`}>
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
