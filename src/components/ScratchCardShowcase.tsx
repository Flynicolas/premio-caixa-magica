import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { scratchCardTypes, ScratchCardType } from '@/types/scratchCard';
import { Sparkles } from 'lucide-react';

const ScratchCardShowcase = () => {
  const navigate = useNavigate();

  const getScratchTypes = (): ScratchCardType[] => {
    return Object.keys(scratchCardTypes) as ScratchCardType[];
  };

  const handlePlayScratch = (type: ScratchCardType) => {
    navigate(`/raspadinha?type=${type}`);
  };

  return (
    <section className="mb-12">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-primary" />
          <h2 className="text-2xl md:text-3xl font-bold gold-gradient-text">
            🎯 Raspadinhas em Destaque
          </h2>
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <p className="text-lg gold-text max-w-2xl mx-auto font-medium">
          Raspe e ganhe na hora! Prêmios instantâneos esperando por você.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
        {getScratchTypes().map((type) => {
          const config = scratchCardTypes[type];
          
          return (
            <div 
              key={type} 
              className="group relative bg-card rounded-xl overflow-hidden border shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Imagem da capa */}
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={config.coverImage}
                  alt={config.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
              </div>

              {/* Conteúdo */}
              <div className="p-3">
                <h3 className="font-bold text-sm mb-1 text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {config.name.replace('Raspadinha', '').replace('do', '').replace('da', '').trim()}
                </h3>
                
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-primary">
                    R$ {config.price.toFixed(2)}
                  </span>
                </div>

                <Button 
                  onClick={() => handlePlayScratch(type)}
                  size="sm"
                  className="w-full text-xs font-bold"
                  variant="default"
                >
                  Jogar Agora
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Call to action adicional */}
      <div className="text-center mt-8">
        <Button
          onClick={() => navigate('/raspadinha')}
          variant="outline"
          size="lg"
          className="font-bold"
        >
          Ver Todas as Raspadinhas
        </Button>
      </div>
    </section>
  );
};

export default ScratchCardShowcase;