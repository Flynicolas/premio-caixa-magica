import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift } from 'lucide-react';
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
  const topPrizes = items.slice(0, 8);

  if (items.length === 0) {
    return null;
  }

  return (
    <Card className="bg-card/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">
          Prêmios Disponíveis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1 sm:gap-2">
          {topPrizes.map((item) => (
            <div key={item.id} className="flex items-center justify-center p-2 sm:p-3 rounded-lg bg-background/50 hover:gold-gradient-subtle hover:gold-border transition-all duration-300 hover-scale">
              {/* Nome apenas - otimizado para mobile */}
              <h4 className="text-xs sm:text-sm font-medium text-center line-clamp-2 hover:gold-text transition-colors duration-300">
                {item.name}
              </h4>
            </div>
          ))}
        </div>
        
        {items.length > 8 && (
          <p className="text-xs text-muted-foreground mt-3 text-center">
            +{items.length - 8} outros prêmios disponíveis
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default PrizeCatalog;