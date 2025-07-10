
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Chest, Prize } from '@/data/chestData';
import ItemCard from './ItemCard';

interface ChestItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  chest: Chest | null;
}

const ChestItemsModal = ({ isOpen, onClose, chest }: ChestItemsModalProps) => {
  if (!chest) return null;

  const rarityLabels = {
    common: 'Comum',
    rare: 'Raro',
    epic: 'Épico',
    legendary: 'Lendário'
  };

  // Group prizes by rarity
  const groupedPrizes = chest.prizes.reduce((acc, prize) => {
    if (!acc[prize.rarity]) {
      acc[prize.rarity] = [];
    }
    acc[prize.rarity].push(prize);
    return acc;
  }, {} as Record<string, Prize[]>);

  const rarityOrder = ['legendary', 'epic', 'rare', 'common'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-card via-card to-card/90 border-primary/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-primary">
            {chest.name} - Conteúdo
          </DialogTitle>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </DialogHeader>

        <div className="py-4">
          {rarityOrder.map(rarity => {
            const prizes = groupedPrizes[rarity];
            if (!prizes || prizes.length === 0) return null;

            return (
              <div key={rarity} className="mb-8">
                <div className="flex items-center mb-4">
                  <Badge 
                    className={`mr-3 ${
                      rarity === 'legendary' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                      rarity === 'epic' ? 'bg-gradient-to-r from-purple-400 to-purple-600' :
                      rarity === 'rare' ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                      'bg-gradient-to-r from-gray-400 to-gray-600'
                    } text-white`}
                  >
                    {rarityLabels[rarity]}
                  </Badge>
                  <h3 className="text-lg font-semibold text-white">
                    {prizes.length} {prizes.length === 1 ? 'item' : 'itens'}
                  </h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {prizes.map((prize, index) => (
                    <ItemCard
                      key={index}
                      item={{
                        name: prize.name,
                        image_url: prize.image,
                        rarity: prize.rarity as 'common' | 'rare' | 'epic' | 'legendary',
                        description: prize.description
                      }}
                      size="md"
                      showRarity={false}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          <div className="mt-6 p-4 bg-primary/10 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              <strong>Probabilidade de acerto item raro:</strong> Varia conforme a raridade<br/>
              <strong>Média de lucro nos itens comuns:</strong> Todos os prêmios têm valor real
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChestItemsModal;
