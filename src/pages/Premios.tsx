
import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSmartWallet } from '@/hooks/useSmartWallet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Crown, Diamond, Heart, Flame, Star, Radio, Package } from 'lucide-react';
import { chestData, ChestType } from '@/data/chestData';
import RealtimeWinsCarousel from '@/components/RealtimeWinsCarousel';
import ChestCard from '@/components/ChestCard';
import ItemCard from '@/components/ItemCard';
import { useInventory } from '@/hooks/useInventory';
import { DatabaseItem } from '@/types/database';
import DynamicMessage from '@/components/DynamicMessage';
import MeusPremiosMinified from '@/components/MeusPremiosMinified';
import ResponsiveBanner from '@/components/ResponsiveBanner';

const Premios = () => {
  const { user } = useAuth();
  const { walletData } = useSmartWallet();
  const { getChestItems, loading } = useInventory();
  const [selectedChest, setSelectedChest] = useState<ChestType>('silver');
  const [chestItems, setChestItems] = useState<any[]>([]);
  const catalogRef = useRef<HTMLElement>(null);

  // Carregar itens do baú selecionado
  const loadChestItems = async (chestType: ChestType) => {
    const items = await getChestItems(chestType);
    setChestItems(items);
  };

  // Carregar itens quando mudar de baú
  useState(() => {
    loadChestItems(selectedChest);
  });

  const chestThemes = {
    silver: { color: 'from-gray-400 to-gray-600', icon: Star, description: 'Perfeito para iniciantes que querem experimentar com baixo investimento' },
    gold: { color: 'from-yellow-400 to-yellow-600', icon: Crown, description: 'Ideal para quem busca um equilíbrio entre custo e recompensas valiosas' },
    delas: { color: 'from-pink-400 to-rose-500', icon: Heart, description: 'Especialmente curado para o público feminino com itens exclusivos e elegantes' },
    diamond: { color: 'from-blue-400 to-cyan-400', icon: Diamond, description: 'Experiência premium com chances elevadas de itens de alto valor' },
    ruby: { color: 'from-red-400 to-pink-500', icon: Flame, description: 'Para os mais corajosos que buscam os maiores prêmios disponíveis' },
    premium: { color: 'from-purple-500 to-pink-600', icon: Sparkles, description: 'O máximo em exclusividade e luxo, com itens únicos e raríssimos' }
  };

  const chestImages = {
    silver: '/lovable-uploads/8f503764-12ee-4e00-8148-76b279be343f.png',
    gold: '/lovable-uploads/8c5dedca-ad61-4b14-a649-8b854950a875.png',
    delas: '/lovable-uploads/85b1ecea-b443-4391-9986-fb77979cf6ea.png',
    diamond: '/lovable-uploads/0ec6f6c5-203f-4fca-855d-59171f78adf3.png',
    ruby: '/lovable-uploads/a7b012cc-0fae-4b69-b2f4-690740a0ba92.png',
    premium: '/lovable-uploads/d43f06a5-1532-42ba-8362-5aefb160b408.png'
  };

  const handleChestOpen = (chestType: ChestType) => {
    console.log('Abrir baú:', chestType);
  };

  const handleChestViewItems = (chestType: ChestType) => {
    console.log('Ver itens do baú:', chestType);
  };

  const handleDirectChestOpening = (prize: DatabaseItem) => {
    console.log('Prêmio ganho:', prize);
  };

  const handleOpenWallet = () => {
    console.log('Abrir carteira');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-white">Carregando baús...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        
        {/* Vitórias em Tempo Real */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-3">
            <Radio className="w-4 h-4 text-red-500 animate-pulse" />
            <span className="text-red-500 font-bold text-sm animate-pulse">AO VIVO</span>
          </div>
          <RealtimeWinsCarousel showIcons={false} className="bg-gradient-to-r from-gray-900/20 to-gray-800/20 border border-green-500/10 p-3" />
        </div>

        {/* Mensagens Dinâmicas */}
        <section className="mb-8">
          <DynamicMessage />
        </section>

        {/* Catálogo de Baús - Seção Principal */}
        <section className="mb-12" ref={catalogRef}>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-primary mb-4">🏆 Baús 🏆</h2>
            <p className="text-lg text-muted-foreground">Explore todos os tipos de baús e suas recompensas exclusivas</p>
          </div>

          <Tabs value={selectedChest} onValueChange={(value) => {
            setSelectedChest(value as ChestType);
            loadChestItems(value as ChestType);
          }} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mb-8 h-auto">
              {Object.entries(chestData).map(([chestType, chest]) => {
                const theme = chestThemes[chestType as ChestType];
                const IconComponent = theme.icon;
                return (
                  <TabsTrigger 
                    key={chestType} 
                    value={chestType}
                    className="flex flex-col items-center p-3 h-auto data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20"
                  >
                    <IconComponent className="w-4 h-4 md:w-5 md:h-5 mb-1" />
                    <span className="text-xs md:text-sm font-medium">{chest.name}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {Object.entries(chestData).map(([chestType, chest]) => {
              const theme = chestThemes[chestType as ChestType];
              
              return (
                <TabsContent key={chestType} value={chestType}>
                  <Card className="border-2 border-opacity-30 bg-card/50">
                    <CardHeader className={`bg-gradient-to-r ${theme.color} text-white rounded-t-lg`}>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                            <img 
                              src={chestImages[chestType as ChestType]} 
                              alt={chest.name}
                              className="w-8 h-8 md:w-12 md:h-12 object-contain drop-shadow-lg"
                            />
                          </div>
                          <div>
                            <h3 className="text-xl md:text-2xl font-bold">{chest.name}</h3>
                            <p className="text-lg md:text-xl font-bold">R$ {chest.price.toFixed(2).replace('.', ',')}</p>
                          </div>
                        </div>
                        <div className="w-full md:w-auto">
                          <ChestCard
                            chest={chest}
                            chestType={chestType as ChestType}
                            onOpen={() => handleChestOpen(chestType as ChestType)}
                            onViewItems={() => handleChestViewItems(chestType as ChestType)}
                            balance={walletData?.balance || 0}
                            isAuthenticated={!!user}
                            onPrizeWon={handleDirectChestOpening}
                            onAddBalance={handleOpenWallet}
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-lg font-bold mb-3 text-primary">Sobre este Baú</h4>
                          <p className="text-muted-foreground mb-4 text-sm md:text-base">{theme.description}</p>
                          
                          <div className="space-y-2 mb-4 text-sm md:text-base">
                            <div className="flex justify-between">
                              <span>Valor Investido:</span>
                              <span className="font-bold">R$ {chest.price.toFixed(2).replace('.', ',')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Itens Disponíveis:</span>
                              <span className="font-bold">{chestItems.length} prêmios</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-lg font-bold mb-3 text-primary">Prêmios Disponíveis</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                            {chestItems.slice(0, 16).map((chestItem, index) => (
                              <div key={index} className="flex flex-col items-center">
                                <ItemCard
                                  item={{
                                    name: chestItem.item?.name || 'Item',
                                    image_url: chestItem.item?.image_url,
                                    rarity: (chestItem.item?.rarity || 'common') as 'common' | 'rare' | 'epic' | 'legendary',
                                    description: chestItem.item?.description
                                  }}
                                  size="sm"
                                  showRarity={false}
                                  className="hover:transform-none hover:shadow-none w-full h-16 md:h-20"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              );
            })}
          </Tabs>
        </section>
        
        {/* Estatísticas finais */}
        <section className="text-center py-8">
          <Card className="bg-card/50 border-primary/20 max-w-md mx-auto">
            <CardContent className="p-6">
              <Package className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-bold text-primary mb-2">Diversão Garantida</h3>
              <p className="text-muted-foreground text-sm">
                Milhares de prêmios já foram distribuídos para nossa comunidade
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Meus Prêmios Minimizado - Inventário no final (apenas para usuários logados) */}
        <MeusPremiosMinified />

        {/* Banner antes do rodapé - SUBSTITUA AS URLs PELAS SUAS IMAGENS */}
        <ResponsiveBanner
          imageUrlPC="https://jhbafgzfphiizpuoqksj.supabase.co/storage/v1/object/public/head-images//raspadinha-banner-rodape01.png"
          imageUrlMobile="https://jhbafgzfphiizpuoqksj.supabase.co/storage/v1/object/public/head-images//raspadinha-banner-rodape01.png"
          altText="Banner promocional da página de prêmios"
        />
      </div>
    </div>
  );
};

export default Premios;
