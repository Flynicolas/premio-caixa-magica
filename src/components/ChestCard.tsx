
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
  
  const chestBorderColors = {
    silver: 'border-gray-400/30',
    gold: 'border-yellow-400/30',
    delas: 'border-pink-400/30',
    diamond: 'border-blue-400/30',
    ruby: 'border-red-400/30',
    premium: 'border-purple-500/30'
  };

  const chestBorderColor = chestBorderColors[chestType] || chestBorderColors.silver;

  return (
    <Card className={`relative overflow-hidden ${chestBorderColor} bg-card/50 hover:bg-card/70 transition-all duration-300 group h-full border-2`}
      key={chest.name + chest.price}
    >
      <CardContent className="p-8 flex flex-col h-full min-h-[520px]">
        {/* Header com nome e preço - Mais espaçoso */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-primary mb-3">{chest.name}</h3>
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
