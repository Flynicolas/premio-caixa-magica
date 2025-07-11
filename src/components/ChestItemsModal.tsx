
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Package, Filter } from 'lucide-react';
import { Chest } from '@/data/chestData';
import { useRealtimeItems } from '@/hooks/useRealtimeItems';
import ItemCard from './ItemCard';

interface ChestItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  chest: Chest | null;
}

const ChestItemsModal = ({ isOpen, onClose, chest }: ChestItemsModalProps) => {
  const { items } = useRealtimeItems();
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [selectedRarity, setSelectedRarity] = useState<string>('all');

  // Filtrar itens em tempo real para este baú
  useEffect(() => {
    if (!chest) return;
    
    const chestType = Object.keys(chest).find(key => 
      chest.name.toLowerCase().includes(key) || 
      key === 'silver' || key === 'gold' || key === 'diamond' || key === 'ruby' || key === 'premium' || key === 'delas'
    ) || 'silver';
    
    const chestItems = items.filter(item => 
      item.chest_types?.includes(chestType as any) && item.is_active
    );
    
    if (selectedRarity === 'all') {
      setFilteredItems(chestItems);
    } else {
      setFilteredItems(chestItems.filter(item => item.rarity === selectedRarity));
    }
  }, [items, chest, selectedRarity]);

  if (!chest) return null;

  const rarities = ['all', 'common', 'rare', 'epic', 'legendary', 'special'];
  const rarityLabels = {
    all: 'Todos',
    common: 'Comum',
    rare: 'Raro',
    epic: 'Épico',
    legendary: 'Lendário',
    special: 'Especial'
  };

  const rarityColors = {
    all: 'bg-gray-500/20 text-gray-300',
    common: 'bg-gray-500/20 text-gray-300',
    rare: 'bg-blue-500/20 text-blue-300',
    epic: 'bg-purple-500/20 text-purple-300',
    legendary: 'bg-yellow-500/20 text-yellow-300',
    special: 'bg-pink-500/20 text-pink-300'
  };

  const getItemsByRarity = (rarity: string) => {
    return filteredItems.filter(item => rarity === 'all' || item.rarity === rarity);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" />
            Itens do {chest.name}
          </DialogTitle>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filtros de Raridade */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filtrar por raridade:</span>
            {rarities.map(rarity => (
              <Badge
                key={rarity}
                variant={selectedRarity === rarity ? "default" : "outline"}
                className={`cursor-pointer transition-all duration-200 ${
                  selectedRarity === rarity 
                    ? rarityColors[rarity as keyof typeof rarityColors]
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedRarity(rarity)}
              >
                {rarityLabels[rarity as keyof typeof rarityLabels]} ({getItemsByRarity(rarity).length})
              </Badge>
            ))}
          </div>

          {/* Grid de Itens */}
          <div className="max-h-[60vh] overflow-y-auto">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum item encontrado</h3>
                <p className="text-muted-foreground">
                  {selectedRarity === 'all' 
                    ? 'Este baú ainda não possui itens cadastrados.'
                    : `Nenhum item ${rarityLabels[selectedRarity as keyof typeof rarityLabels].toLowerCase()} encontrado neste baú.`
                  }
                </p>
              </div>
            ) : (
              <Tabs value={selectedRarity} onValueChange={setSelectedRarity} className="w-full">
                <TabsContent value={selectedRarity} className="mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {filteredItems.map((item, index) => (
                      <div key={index} className="relative group">
                        <ItemCard
                          item={{
                            name: item.name,
                            image_url: item.image_url,
                            rarity: item.rarity as 'common' | 'rare' | 'epic' | 'legendary' | 'special',
                            description: item.description
                          }}
                          size="md"
                          showRarity={true}
                          className="hover:scale-105 transition-transform duration-200"
                        />
                        
                        {/* Tooltip com valor */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                          R$ {Number(item.base_value).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>

          {/* Estatísticas do Baú */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{filteredItems.length}</div>
                <div className="text-sm text-muted-foreground">Total de Itens</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">
                  {filteredItems.filter(item => item.rarity === 'legendary').length}
                </div>
                <div className="text-sm text-muted-foreground">Lendários</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">
                  {filteredItems.filter(item => item.rarity === 'epic').length}
                </div>
                <div className="text-sm text-muted-foreground">Épicos</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">
                  R$ {filteredItems.reduce((sum, item) => sum + Number(item.base_value), 0).toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Valor Total</div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChestItemsModal;
