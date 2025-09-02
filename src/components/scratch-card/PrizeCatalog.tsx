import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Diamond, Crown, Coins, Gift, Zap } from 'lucide-react';
import { ScratchCardType } from '@/types/scratchCard';

interface PrizeItem {
  id: string;
  name: string;
  image_url: string | null;
  rarity: string;
  base_value: number;
  probability_weight: number;
}

interface PrizeCatalogProps {
  items: PrizeItem[];
  scratchType: ScratchCardType;
}

const PrizeCatalog = ({ items, scratchType }: PrizeCatalogProps) => {
  const getRarityColor = (rarity: string) => {
    const colors = {
      'comum': 'bg-slate-100 text-slate-700 border-slate-200',
      'raro': 'bg-blue-100 text-blue-700 border-blue-200',
      'epico': 'bg-purple-100 text-purple-700 border-purple-200',
      'lendario': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'mitico': 'bg-red-100 text-red-700 border-red-200'
    };
    return colors[rarity as keyof typeof colors] || colors.comum;
  };

  const getRarityIcon = (rarity: string) => {
    const icons = {
      'comum': Coins,
      'raro': Star,
      'epico': Diamond,
      'lendario': Crown,
      'mitico': Zap
    };
    const Icon = icons[rarity as keyof typeof icons] || Gift;
    return <Icon className="w-3 h-3" />;
  };

  const topPrizes = items.slice(0, 8);

  if (items.length === 0) {
    return null;
  }

  return (
    <Card className="mt-6">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Gift className="w-5 h-5 text-primary" />
          Prêmios Disponíveis
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Confira alguns dos prêmios que você pode ganhar nesta raspadinha
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {topPrizes.map((item) => (
            <div key={item.id} className="group">
              <div className="bg-card border border-border rounded-lg p-3 hover:shadow-md transition-all duration-200 hover:scale-105">
                {/* Imagem ou placeholder */}
                <div className="aspect-square bg-muted rounded-md mb-2 flex items-center justify-center overflow-hidden">
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Gift className="w-8 h-8 text-muted-foreground/50" />
                  )}
                </div>
                
                {/* Info do item */}
                <div className="space-y-1">
                  <h4 className="text-xs font-medium text-foreground line-clamp-2 leading-tight">
                    {item.name}
                  </h4>
                  
                  {/* Rarity badge */}
                  <Badge 
                    variant="outline" 
                    className={`text-xs px-1.5 py-0.5 ${getRarityColor(item.rarity)}`}
                  >
                    {getRarityIcon(item.rarity)}
                    <span className="ml-1 capitalize">{item.rarity}</span>
                  </Badge>
                  
                  {/* Valor */}
                  <p className="text-xs font-semibold text-primary">
                    R$ {item.base_value.toFixed(2).replace('.', ',')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {items.length > 8 && (
          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              E mais {items.length - 8} prêmios incríveis para descobrir!
            </p>
          </div>
        )}
        
        <div className="mt-4 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            💡 <strong>Dica:</strong> Prêmios de maior valor têm raridade mais elevada
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrizeCatalog;