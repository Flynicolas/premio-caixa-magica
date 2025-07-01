
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Lock, Eye } from 'lucide-react';
import { Chest, ChestType } from '@/data/chestData';

interface ChestCardProps {
  chest: Chest;
  chestType: ChestType;
  onOpen: () => void;
  onViewItems: () => void;
  balance: number;
}

const ChestCard = ({ chest, chestType, onOpen, onViewItems, balance }: ChestCardProps) => {
  const canAfford = balance >= chest.price;
  
  const chestColors = {
    silver: 'from-gray-400 to-gray-600',
    gold: 'from-yellow-400 to-yellow-600',
    diamond: 'from-blue-400 to-cyan-400',
    ruby: 'from-red-400 to-pink-500',
    premium: 'from-purple-500 to-pink-600'
  };

  const chestImages = {
    silver: '/lovable-uploads/a3432c13-9f20-46b8-8cb4-dd116646918a.png',
    gold: '/lovable-uploads/3027048a-e5a0-4121-a4d3-b0bf2b571472.png',
    diamond: '/lovable-uploads/b4c7577f-84fd-4631-9956-940cef37c0f5.png',
    ruby: '/lovable-uploads/a8ce4345-18ed-4110-aa75-0e4b64de767c.png',
    premium: '/lovable-uploads/a4e45f22-07f1-459a-a5c2-de5eabb4144a.png'
  };

  return (
    <Card className="relative overflow-hidden border-primary/20 bg-card/50 hover:bg-card/70 transition-all duration-300 group h-full">
      <CardContent className="p-6 flex flex-col h-full">
        {/* Chest Image */}
        <div className="relative mb-6 flex justify-center">
          <div className="w-40 h-40 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
            <img 
              src={chestImages[chestType]} 
              alt={chest.name}
              className="w-full h-full object-contain drop-shadow-lg"
            />
          </div>
          
          {/* View Items Button */}
          <button
            onClick={onViewItems}
            className="absolute top-2 right-2 bg-primary/80 hover:bg-primary text-white px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 flex items-center space-x-1"
          >
            <Eye className="w-3 h-3" />
            <span>ver itens</span>
          </button>
          
          {/* Floating sparkles */}
          <div className="absolute -top-2 -left-2">
            <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
          </div>
        </div>

        {/* Chest Info */}
        <div className="text-center mb-4 flex-grow">
          <h3 className="text-xl font-bold text-primary mb-2">{chest.name}</h3>
          <p className="text-sm text-muted-foreground mb-4">{chest.description}</p>
          
          <div className="text-2xl font-bold text-white mb-4">
            R$ {chest.price.toFixed(2).replace('.', ',')}
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={onOpen}
          disabled={!canAfford}
          className={`w-full font-bold ${
            canAfford 
              ? `bg-gradient-to-r ${chestColors[chestType]} text-black hover:opacity-90` 
              : 'bg-gray-600 text-gray-300 cursor-not-allowed'
          }`}
        >
          {canAfford ? (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Abrir Baú
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Saldo Insuficiente
            </>
          )}
        </Button>

        {!canAfford && (
          <Badge variant="destructive" className="mt-2 text-xs">
            Faltam R$ {(chest.price - balance).toFixed(2).replace('.', ',')}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
};

export default ChestCard;
