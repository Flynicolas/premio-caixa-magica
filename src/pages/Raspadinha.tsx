import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWalletProvider';
import { scratchCardTypes, ScratchCardType } from '@/types/scratchCard';
import ScratchCardModal from '@/components/scratch-card/ScratchCardModal';
import AuthModal from '@/components/AuthModal';
import ResponsiveBanner from '@/components/ResponsiveBanner';
import { Star, Diamond, Crown, Coins, Zap, Gift } from 'lucide-react';

const Raspadinha = () => {
  const { user } = useAuth();
  const { walletData } = useWallet();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedType, setSelectedType] = useState<ScratchCardType | null>(null);

  const handleCardClick = (type: ScratchCardType) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setSelectedType(type);
  };

  // Mapeamento das raspadinhas com descrições premium
  const premiumScratchCards = [
    {
      id: 'pix',
      title: 'PIX na conta',
      maxPrize: 'R$ 2.000',
      description: 'Raspe e receba prêmios em DINHEIRO $$$ até R$2.000 diretamente no seu PIX',
      price: scratchCardTypes.pix.price,
      imageUrl: scratchCardTypes.pix.coverImage,
      badge: 'RASPADINHA PREMIADA',
      gradient: 'from-cyan-400 via-cyan-500 to-cyan-600'
    },
    {
      id: 'sorte',
      title: 'Sorte Dourada',
      maxPrize: 'R$ 5.000',
      description: 'Teste sua sorte e ganhe prêmios incríveis! Sua fortuna te espera aqui.',
      price: scratchCardTypes.sorte.price,
      imageUrl: scratchCardTypes.sorte.coverImage,
      badge: 'SUPER PREMIADA',
      gradient: 'from-green-400 via-green-500 to-green-600'
    },
    {
      id: 'dupla',
      title: 'Dupla Fortuna',
      maxPrize: 'R$ 7.500',
      description: 'Dobrar suas chances, dobrar seus prêmios! Duas oportunidades em uma só raspadinha.',
      price: scratchCardTypes.dupla.price,
      imageUrl: scratchCardTypes.dupla.coverImage,
      badge: 'DUPLA PREMIADA',
      gradient: 'from-emerald-400 via-emerald-500 to-emerald-600'
    },
    {
      id: 'ouro',
      title: 'Tesouro de Ouro',
      maxPrize: 'R$ 15.000',
      description: 'Eletrônicos premium, iPhones, MacBooks e os produtos mais cobiçados do mercado!',
      price: scratchCardTypes.ouro.price,
      imageUrl: scratchCardTypes.ouro.coverImage,
      badge: 'TECH PREMIADA',
      gradient: 'from-yellow-400 via-yellow-500 to-yellow-600'
    },
    {
      id: 'diamante',
      title: 'Diamante Real',
      maxPrize: 'R$ 25.000',
      description: 'Luxo e sofisticação! Prêmios exclusivos para quem busca o que há de melhor.',
      price: scratchCardTypes.diamante.price,
      imageUrl: scratchCardTypes.diamante.coverImage,
      badge: 'LUXO PREMIADA',
      gradient: 'from-blue-400 via-blue-500 to-blue-600'
    },
    {
      id: 'premium',
      title: 'Casa dos Sonhos',
      maxPrize: 'R$ 50.000',
      description: 'Móveis luxuosos, eletrodomésticos top e tudo para transformar sua casa dos sonhos!',
      price: scratchCardTypes.premium.price,
      imageUrl: scratchCardTypes.premium.coverImage,
      badge: 'CASA PREMIADA',
      gradient: 'from-purple-400 via-pink-500 to-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Banner Principal */}
      <ResponsiveBanner 
        imageUrlPC="/banners/raspadinha-banner-pc.jpg"
        imageUrlMobile="/banners/raspadinha-banner-mobile.jpg"
        altText="Banner principal da página de raspadinha"
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header Premium */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent mb-4">
            🎰 Raspadinhas Premium
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-6">
            Escolha sua raspadinha e descubra prêmios incríveis! Quanto maior o investimento, maiores as recompensas.
          </p>
          
          {/* Saldo do usuário */}
          {user && (
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full px-6 py-3">
              <Coins className="w-5 h-5 text-green-400" />
              <span className="text-white font-semibold">
                Seu saldo: <span className="text-green-400">R$ {walletData?.balance.toFixed(2) || '0,00'}</span>
              </span>
            </div>
          )}
          
          {!user && (
            <Badge variant="outline" className="px-6 py-3 text-lg border-yellow-500/30 text-yellow-400">
              <Star className="w-4 h-4 mr-2" />
              Faça login para jogar com dinheiro real
            </Badge>
          )}
        </div>

        {/* Grid de Cards Premium */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
          {premiumScratchCards.map((card) => {
            const canAfford = walletData && walletData.balance >= card.price;
            const scratchType = card.id as ScratchCardType;
            
            return (
              <div
                key={card.id}
                className={`group relative bg-gradient-to-br from-gray-800/50 to-gray-900/80 rounded-2xl overflow-hidden border border-gray-700/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20 ${
                  !canAfford && user ? 'opacity-60' : ''
                }`}
              >
                {/* Badge Premium */}
                <div className="absolute top-4 left-4 z-10">
                  <div className={`bg-gradient-to-r ${card.gradient} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse`}>
                    {card.badge}
                  </div>
                </div>

                {/* Preço */}
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-black/80 text-white px-3 py-2 rounded-xl font-bold text-lg border border-white/20">
                    R$ {card.price.toFixed(2)}
                  </div>
                </div>

                {/* Imagem de fundo */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={card.imageUrl}
                    alt={card.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent`}></div>
                </div>

                {/* Conteúdo do card */}
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white group-hover:text-yellow-400 transition-colors">
                      {card.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Gift className="w-5 h-5 text-yellow-400" />
                      <span className="text-yellow-400 font-bold text-lg">
                        Até {card.maxPrize}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm leading-relaxed">
                    {card.description}
                  </p>

                  {/* Overlay de saldo insuficiente */}
                  {!canAfford && user && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20 rounded-2xl">
                      <div className="text-center">
                        <p className="text-red-400 font-bold text-lg mb-2">Saldo Insuficiente</p>
                        <p className="text-gray-400 text-sm">Adicione créditos para jogar</p>
                      </div>
                    </div>
                  )}

                  {/* Botão de ação */}
                  <Button
                    onClick={() => handleCardClick(scratchType)}
                    disabled={!canAfford && !!user}
                    className={`w-full h-12 text-lg font-bold transition-all duration-300 ${
                      canAfford || !user
                        ? `bg-gradient-to-r ${card.gradient} hover:shadow-lg hover:shadow-purple-500/30 border-0`
                        : 'bg-gray-600 cursor-not-allowed'
                    }`}
                  >
                    {!user ? (
                      <>
                        <Star className="w-5 h-5 mr-2" />
                        Jogar Agora
                      </>
                    ) : canAfford ? (
                      <>
                        <Zap className="w-5 h-5 mr-2" />
                        Raspar Agora
                      </>
                    ) : (
                      'Saldo Insuficiente'
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Seção Como Jogar - Premium */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/60 border border-gray-700/50 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl font-bold text-white mb-3">
                🎯 Como Jogar
              </CardTitle>
              <p className="text-gray-300 text-lg">É simples, rápido e divertido!</p>
            </CardHeader>
            
            <CardContent className="px-8 pb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-cyan-600 text-white rounded-2xl flex items-center justify-center font-bold text-2xl shadow-xl mx-auto">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xl mb-2">Escolha & Pague</h4>
                    <p className="text-gray-300">Selecione sua raspadinha favorita e confirme o pagamento</p>
                  </div>
                </div>
                
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 text-white rounded-2xl flex items-center justify-center font-bold text-2xl shadow-xl mx-auto">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xl mb-2">Raspe & Descubra</h4>
                    <p className="text-gray-300">Use o dedo ou mouse para revelar os símbolos secretos</p>
                  </div>
                </div>
                
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 text-white rounded-2xl flex items-center justify-center font-bold text-2xl shadow-xl mx-auto">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xl mb-2">Ganhe Prêmios</h4>
                    <p className="text-gray-300">3 símbolos iguais = vitória instantânea!</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl border border-yellow-500/30">
                <div className="text-center">
                  <h5 className="text-yellow-400 font-bold text-lg mb-2">💡 Dica de Ouro</h5>
                  <p className="text-white">
                    Raspadinhas mais caras oferecem prêmios maiores e melhores chances de ganhar!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Modal de Autenticação */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />

      {/* Modal da Raspadinha */}
      {selectedType && (
        <ScratchCardModal
          isOpen={!!selectedType}
          onClose={() => setSelectedType(null)}
          selectedType={selectedType}
          onAuthRequired={() => setShowAuthModal(true)}
        />
      )}
    </div>
  );
};

export default Raspadinha;