
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import ScratchCardGame from '@/components/scratch-card/ScratchCardGame';
import ScratchCardPrizeCatalog from '@/components/scratch-card/ScratchCardPrizeCatalog';
import { ScratchCardType, scratchCardTypes } from '@/types/scratchCard';

const Raspadinha = () => {
  const [showGame, setShowGame] = useState(false);
  const [selectedType, setSelectedType] = useState<ScratchCardType>('sorte');
  const [showCatalog, setShowCatalog] = useState(false);

  if (showGame) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-4">
            <Button 
              onClick={() => setShowGame(false)}
              variant="outline"
              className="mb-4"
            >
              ← Voltar
            </Button>
          </div>
          <ScratchCardGame />
        </div>
      </div>
    );
  }

  const cardData = [
    {
      type: 'sorte' as ScratchCardType,
      title: 'Sorte',
      image: 'https://jhbafgzfphiizpuoqksj.supabase.co/storage/v1/object/public/head-images/quadradoraspadinha01.png',
      maxPrize: 'R$ 100',
      description: 'Teste sua sorte!'
    },
    {
      type: 'dupla' as ScratchCardType,
      title: 'Dupla',
      image: 'https://jhbafgzfphiizpuoqksj.supabase.co/storage/v1/object/public/head-images/quadradoraspadinha03.png',
      maxPrize: 'R$ 500',
      description: 'Dupla premiação!'
    },
    {
      type: 'ouro' as ScratchCardType,
      title: 'Ouro',
      image: 'https://jhbafgzfphiizpuoqksj.supabase.co/storage/v1/object/public/head-images/qaudradoraspadinhaouro2.png',
      maxPrize: 'R$ 1.000',
      description: 'Prêmios valiosos!'
    },
    {
      type: 'diamante' as ScratchCardType,
      title: 'Diamante',
      image: 'https://jhbafgzfphiizpuoqksj.supabase.co/storage/v1/object/public/head-images/raspadinha-bannerquadradodiamante01%20(1).png',
      maxPrize: 'R$ 5.000',
      description: 'Brilha como diamante!'
    },
    {
      type: 'premium' as ScratchCardType,
      title: 'Premium',
      image: 'https://jhbafgzfphiizpuoqksj.supabase.co/storage/v1/object/public/head-images/raspadinha-bannerquadradopremium01%20(1).png',
      maxPrize: 'R$ 10.000',
      description: 'Experiência premium!'
    }
  ];

  const handlePlayCard = (type: ScratchCardType) => {
    setSelectedType(type);
    setShowGame(true);
  };

  const handleViewItems = (type: ScratchCardType) => {
    setSelectedType(type);
    setShowCatalog(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            🎫 Raspadinhas Premium
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Escolha sua raspadinha e teste sua sorte! Prêmios incríveis te aguardam.
          </p>
        </div>

        {/* Grid de Cards Otimizado */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {cardData.map((card, index) => (
            <motion.div
              key={card.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 overflow-hidden">
                <CardContent className="p-0">
                  {/* Badge Discreto no Canto Superior Esquerdo */}
                  <div className="relative">
                    <Badge 
                      variant="secondary" 
                      className="absolute top-2 left-2 z-10 bg-purple-600/90 text-white text-xs px-2 py-1"
                    >
                      {card.title}
                    </Badge>
                    
                    {/* Imagem Maior - Mais Espaço Central */}
                    <div className="h-56 overflow-hidden">
                      <img
                        src={card.image}
                        alt={card.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      />
                    </div>
                  </div>

                  {/* Conteúdo Compacto */}
                  <div className="p-3">
                    {/* Título e Descrição Menores */}
                    <div className="mb-3">
                      <h3 className="text-base font-bold text-white mb-1">
                        Raspadinha {card.title}
                      </h3>
                      <p className="text-slate-400 text-xs leading-tight">
                        {card.description}
                      </p>
                    </div>

                    {/* Informações nos Cantos */}
                    <div className="flex items-center justify-between text-xs mb-3">
                      <div className="text-slate-300">
                        <div>Preço: <span className="text-yellow-400 font-semibold">R$ {scratchCardTypes[card.type].price}</span></div>
                      </div>
                      <div className="text-right text-slate-300">
                        <div>Max: <span className="text-green-400 font-semibold">{card.maxPrize}</span></div>
                      </div>
                    </div>

                    {/* Botões Compactos */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handlePlayCard(card.type)}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-8 text-xs"
                      >
                        Jogar Agora
                      </Button>
                      
                      <Button
                        onClick={() => handleViewItems(card.type)}
                        variant="outline"
                        size="sm"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700 h-8 px-3"
                        title="Ver Prêmios"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Informações */}
        <div className="text-center mt-12 text-slate-400">
          <p className="text-sm">
            ✨ Raspe e descubra se você é o próximo sortudo! ✨
          </p>
          <p className="text-xs mt-1">
            Maiores de 18 anos. Jogue com responsabilidade.
          </p>
        </div>
      </div>

      {/* Modal do Catálogo com Atalho */}
      <ScratchCardPrizeCatalog
        isOpen={showCatalog}
        onClose={() => setShowCatalog(false)}
        scratchType={selectedType}
      />
    </div>
  );
};

export default Raspadinha;
