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
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
          {topPrizes.map((item) => (
            <div key={item.id} className="flex flex-col items-center p-2 rounded-lg bg-background/50 hover:bg-background/80 transition-colors">
              {/* Imagem ou placeholder */}
              <div className="w-10 h-10 bg-muted rounded-md mb-1 flex items-center justify-center overflow-hidden">
                {item.image_url ? (
                  <img 
                    src={item.image_url} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Gift className="w-4 h-4 text-muted-foreground/50" />
                )}
              </div>
              
              {/* Nome */}
              <h4 className="text-xs font-medium text-center mb-1 line-clamp-1">
                {item.name}
              </h4>
              
              {/* Valor */}
              <span className="text-xs font-semibold text-primary">
                R$ {item.base_value.toFixed(2).replace('.', ',')}
              </span>
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