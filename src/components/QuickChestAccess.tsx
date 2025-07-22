
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Crown, Diamond, Heart, Flame, Star, ChevronDown } from 'lucide-react';

interface QuickChestAccessProps {
  onScrollToCatalog: () => void;
}

const QuickChestAccess = ({ onScrollToCatalog }: QuickChestAccessProps) => {
  const chestQuickAccess = [
    { 
      type: 'silver', 
      name: 'Prata', 
      icon: Star, 
      color: 'from-gray-400 to-gray-600',
      price: 'R$ 5,00',
      description: 'Perfeito para iniciantes'
    },
    { 
      type: 'gold', 
      name: 'Ouro', 
      icon: Crown, 
      color: 'from-yellow-400 to-yellow-600',
      price: 'R$ 15,00',
      description: 'Equilíbrio ideal'
    },
    { 
      type: 'diamond', 
      name: 'Diamante', 
      icon: Diamond, 
      color: 'from-blue-400 to-cyan-400',
      price: 'R$ 50,00',
      description: 'Experiência premium'
    },
    { 
      type: 'ruby', 
      name: 'Rubi', 
      icon: Flame, 
      color: 'from-red-400 to-pink-500',
      price: 'R$ 100,00',
      description: 'Para os corajosos'
    },
    { 
      type: 'premium', 
      name: 'Premium', 
      icon: Sparkles, 
      color: 'from-purple-500 to-pink-600',
      price: 'R$ 200,00',
      description: 'Máximo em exclusividade'
    },
    { 
      type: 'delas', 
      name: 'Delas', 
      icon: Heart, 
      color: 'from-pink-400 to-rose-500',
      price: 'R$ 25,00',
      description: 'Especial feminino'
    }
  ];

  return (
    <section className="mb-12">
      <Card className="bg-gradient-to-r from-slate-900/20 to-zinc-900/20 border-slate-500/30 max-w-6xl mx-auto">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-primary mb-3">Escolha Seu Baú</h2>
            <p className="text-muted-foreground">Clique em qualquer baú para ver todos os detalhes e abrir</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {chestQuickAccess.map((chest) => {
              const IconComponent = chest.icon;
              return (
                <div
                  key={chest.type}
                  onClick={onScrollToCatalog}
                  className="cursor-pointer group"
                >
                  <Card className={`bg-gradient-to-br ${chest.color} p-1 hover:scale-105 transition-all duration-300 hover:shadow-lg`}>
                    <CardContent className="p-4 text-center text-white">
                      <IconComponent className="w-8 h-8 mx-auto mb-2 drop-shadow-lg" />
                      <h3 className="font-bold text-sm mb-1">{chest.name}</h3>
                      <p className="text-xs font-semibold mb-1">{chest.price}</p>
                      <p className="text-xs opacity-90">{chest.description}</p>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <Button
              onClick={onScrollToCatalog}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-bold"
            >
              <ChevronDown className="w-4 h-4 mr-2" />
              Ver Catálogo Completo
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default QuickChestAccess;
