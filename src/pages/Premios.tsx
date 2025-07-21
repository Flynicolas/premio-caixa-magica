
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Crown, Diamond, Heart, Flame, Star, ShoppingCart, Radio, Trophy, Package } from 'lucide-react';
import { chestData, ChestType } from '@/data/chestData';
import RealtimeWinsCarousel from '@/components/RealtimeWinsCarousel';
import ChestCard from '@/components/ChestCard';
import ItemCard from '@/components/ItemCard';
import { useInventory } from '@/hooks/useInventory';
import { DatabaseItem } from '@/types/database';
import { useNavigate } from 'react-router-dom';

const Premios = () => {
  const { user } = useAuth();
  const { walletData } = useWallet();
  const { userItems, getChestItems, loading } = useInventory();
  const navigate = useNavigate();
  const [selectedChest, setSelectedChest] = useState<ChestType>('silver');
  const [chestItems, setChestItems] = useState<any[]>([]);

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

  // Ordem específica dos baús
  const chestOrder: ChestType[] = ['silver', 'gold', 'diamond', 'ruby', 'premium', 'delas'];

  const handleChestOpen = (chestType: ChestType) => {
    // Lógica para abrir baú será implementada
    console.log('Abrir baú:', chestType);
  };

  const handleChestViewItems = (chestType: ChestType) => {
    // Lógica para ver itens será implementada
    console.log('Ver itens do baú:', chestType);
  };

  const handleDirectChestOpening = (prize: DatabaseItem) => {
    // Lógica para abertura direta será implementada
    console.log('Prêmio ganho:', prize);
  };

  const handleOpenWallet = () => {
    // Lógica para abrir carteira será implementada
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

        {/* Seção de Escolha de Baús - Duplicada da Home */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-4">🎰 Sorteios & Entretenimento 🎰</h1>
            <p className="text-lg text-muted-foreground">Escolha seu baú e teste sua sorte! Cada baú oferece diferentes chances de prêmios.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {chestOrder.map((chestType) => (
              <div key={chestType}>
                <ChestCard
                  chest={chestData[chestType]}
                  chestType={chestType}
                  onOpen={() => handleChestOpen(chestType)}
                  onViewItems={() => handleChestViewItems(chestType)}
                  balance={walletData?.balance || 0}
                  isAuthenticated={!!user}
                  onPrizeWon={handleDirectChestOpening}
                  onAddBalance={handleOpenWallet}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Resumo dos Prêmios do Usuário - Seção Minimalizada */}
        {user && userItems.length > 0 && (
          <section className="mb-12">
            <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30 max-w-4xl mx-auto">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-purple-400" />
                    <span className="text-lg">Seus Prêmios</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/meus-premios')}
                    className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                  >
                    Ver Todos
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-300">{userItems.length}</div>
                      <div className="text-sm text-muted-foreground">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-300">{userItems.filter(item => !item.is_redeemed).length}</div>
                      <div className="text-sm text-muted-foreground">Disponíveis</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-300">{userItems.filter(item => item.item?.rarity === 'legendary').length}</div>
                      <div className="text-sm text-muted-foreground">Lendários</div>
                    </div>
                  </div>
                </div>
                
                {/* Últimos prêmios conquistados */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {userItems.slice(0, 6).map((userItem, index) => (
                    <div key={index} className="flex-shrink-0 w-16 h-16 bg-zinc-800/50 rounded-lg border border-zinc-700/50 flex items-center justify-center">
                      <img
                        src={userItem.item?.image_url || '/placeholder.png'}
                        alt={userItem.item?.name}
                        className="w-12 h-12 object-contain drop-shadow-sm"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Catálogo de Baús */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-primary mb-4">Catálogo de Baús</h2>
            <p className="text-lg text-muted-foreground">Explore todos os tipos de baús e suas recompensas exclusivas</p>
          </div>

          <Tabs value={selectedChest} onValueChange={(value) => {
            setSelectedChest(value as ChestType);
            loadChestItems(value as ChestType);
          }} className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-8">
              {Object.entries(chestData).map(([chestType, chest]) => {
                const theme = chestThemes[chestType as ChestType];
                const IconComponent = theme.icon;
                return (
                  <TabsTrigger 
                    key={chestType} 
                    value={chestType}
                    className="flex flex-col items-center p-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20"
                  >
                    <IconComponent className="w-4 h-4 mb-1" />
                    <span className="text-xs">{chest.name}</span>
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
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 rounded-lg bg-white/20 flex items-center justify-center">
                            <img 
                              src={chestImages[chestType as ChestType]} 
                              alt={chest.name}
                              className="w-12 h-12 object-contain drop-shadow-lg"
                            />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold">{chest.name}</h3>
                            <p className="text-lg font-bold">R$ {chest.price.toFixed(2).replace('.', ',')}</p>
                          </div>
                        </div>
                        <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Comprar Baú
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-lg font-bold mb-3 text-primary">Sobre este Baú</h4>
                          <p className="text-muted-foreground mb-4">{theme.description}</p>
                          
                          <div className="space-y-2 mb-4">
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
                          <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                            {chestItems.slice(0, 20).map((chestItem, index) => (
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
                                  className="hover:transform-none hover:shadow-none"
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
      </div>
    </div>
  );
};

export default Premios;
