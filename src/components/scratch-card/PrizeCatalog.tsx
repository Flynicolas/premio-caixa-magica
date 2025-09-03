import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift } from 'lucide-react';
import { ScratchCardType, scratchCardTypes } from '@/types/scratchCard';

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

const scratchDescriptions = {
  pix: 'Comece sua jornada com prêmios instantâneos! Descubra o que o destino preparou para você.',
  sorte: 'A sorte está do seu lado! Raspe e revele prêmios incríveis que podem mudar seu dia.',
  dupla: 'Dobrar ou nada! Sua chance de ganhar prêmios ainda maiores está aqui.',
  ouro: 'Toque de Midas! Raspe este ouro e transforme sua sorte em fortuna.',
  diamante: 'Brilho que deslumbra! Descubra tesouros preciosos escondidos na sua sorte.',
  premium: 'O que há de melhor! Prêmios exclusivos e experiências únicas te aguardam.'
} as const;

const PrizeCatalog = ({ items, scratchType }: PrizeCatalogProps) => {
  const topPrizes = items.slice(0, 8);
  const config = scratchCardTypes[scratchType];

  if (items.length === 0) {
    return null;
  }

  return (
    <Card className="bg-card/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium gold-text">
          {config.name}
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          {scratchDescriptions[scratchType]}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1">
          {topPrizes.map((item) => (
            <div key={item.id} className="flex flex-col items-center p-1.5 rounded-lg bg-background/50 hover:gold-gradient-subtle hover:gold-border transition-all duration-300 hover-scale">
              {/* Imagem compacta */}
              <div className="w-8 h-8 bg-muted rounded-md mb-1 flex items-center justify-center overflow-hidden">
                {item.image_url ? (
                  <img 
                    src={item.image_url} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Gift className="w-3 h-3 text-muted-foreground/50" />
                )}
              </div>
              
              {/* Nome compacto */}
              <h4 className="text-xs font-medium text-center line-clamp-2 hover:gold-text transition-colors duration-300 leading-tight">
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