import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWalletProvider';
import { scratchCardTypes, ScratchCardType } from '@/types/scratchCard';

import AuthModal from '@/components/AuthModal';
import ResponsiveBanner from '@/components/ResponsiveBanner';
import { Star, Diamond, Crown, Coins, Zap, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Raspadinha = () => {
  const { user } = useAuth();
  const { walletData } = useWallet();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();

  const handleCardClick = (type: ScratchCardType) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    navigate(`/raspadinhas/${type}`);
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
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            🎰 Raspadinhas Premium
          </h2>
          <p className="text-gray-300 text-lg">
            Prêmios incríveis te esperam! Escolha sua raspadinha favorita
          </p>
        </div>

        {/* Balance Display */}
        {user && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-gray-800/50 rounded-xl px-6 py-3 border border-gray-700">
              <span className="text-gray-300">💰 Seu saldo:</span>
              <span className="text-yellow-400 font-bold text-lg">R$ {walletData?.balance.toFixed(2).replace('.', ',') || '0,00'}</span>
            </div>
          </div>
        )}
        
        {!user && (
          <div className="text-center mb-8">
            <Badge variant="outline" className="px-6 py-3 text-lg border-yellow-500/30 text-yellow-400">
              <Star className="w-4 h-4 mr-2" />
              Faça login para jogar com dinheiro real
            </Badge>
          </div>
        )}

        {/* Grid de Cards Premium - Estilo do PremiumScratchCatalog */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-6xl mx-auto mb-16">
          {premiumScratchCards.map((card) => {
            const canAfford = walletData && walletData.balance >= card.price;
            const scratchType = card.id as ScratchCardType;
            
            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(scratchType)}
                className={`
                  relative group cursor-pointer transition-all duration-300 transform
                  ${canAfford || !user ? 'hover:scale-[1.03] hover:shadow-2xl' : 'opacity-60 cursor-not-allowed'}
                `}
              >
                {/* Main Card Container */}
                <div className="relative bg-gray-900 rounded-2xl overflow-hidden border border-gray-700/50 shadow-xl">
                  
                  {/* Background Image with Overlay */}
                  <div className="relative h-64 md:h-72 overflow-hidden">
                    <img 
                      src={card.imageUrl}
                      alt={card.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                    
                    {/* Price Seal - Top Right (Mobile focused) */}
                    <div className="absolute top-3 right-3 z-10">
                      <div className="bg-yellow-400 text-black px-3 py-1.5 md:px-4 md:py-2 rounded-full font-bold text-sm md:text-lg shadow-lg border-2 border-yellow-300">
                        R$ {card.price.toFixed(2).replace('.', ',')}
                      </div>
                    </div>

                    {/* Badge Premium - Top Left */}
                    <div className="absolute top-3 left-3 z-10">
                      <div className={`bg-gradient-to-r ${card.gradient} text-white px-2 py-1 md:px-3 md:py-1.5 rounded-full text-xs md:text-sm font-bold shadow-lg animate-pulse`}>
                        {card.badge}
                      </div>
                    </div>

                    {/* Content Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white">
                      
                      {/* Title */}
                      <h3 className="text-xl md:text-2xl font-bold mb-2 text-white drop-shadow-lg">
                        {card.title}
                      </h3>

                      {/* Prize Amount - Mobile optimized */}
                      <div className="mb-3">
                        <span className="text-yellow-400 font-bold text-sm md:text-lg">PRÊMIOS ATÉ </span>
                        <span className="text-yellow-400 font-black text-xl md:text-2xl">
                          {card.maxPrize}
                        </span>
                      </div>

                      {/* Description - Mobile optimized */}
                      <p className="text-gray-200 text-xs md:text-sm mb-3 leading-relaxed line-clamp-2">
                        {card.description}
                      </p>

                      {/* Overlay de saldo insuficiente para usuários logados */}
                      {!canAfford && user && (
                        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20 rounded-2xl">
                          <div className="text-center">
                            <p className="text-red-400 font-bold text-lg mb-2">Saldo Insuficiente</p>
                            <p className="text-gray-400 text-sm">Adicione créditos para jogar</p>
                          </div>
                        </div>
                      )}

                      {/* Action Button - Mobile optimized */}
                      <button
                        disabled={!canAfford && !!user}
                        className={`
                          w-full py-2.5 md:py-4 px-4 md:px-6 rounded-lg font-bold text-sm md:text-lg
                          transition-all duration-300 flex items-center justify-center gap-2
                          ${canAfford || !user
                            ? 'bg-yellow-400 hover:bg-yellow-300 text-black shadow-lg hover:shadow-xl' 
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          }
                        `}
                      >
                        {!user ? (
                          <>
                            <Star className="w-4 h-4 md:w-5 md:h-5" />
                            Jogar Agora
                          </>
                        ) : canAfford ? (
                          <>
                            <Zap className="w-4 h-4 md:w-5 md:h-5" />
                            Raspar Agora
                          </>
                        ) : (
                          'Saldo Insuficiente'
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Shimmer Effect on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Instructions */}
        <div className="text-center mb-8">
          <p className="text-gray-400 text-sm">
            ✨ Raspe e ganhe prêmios incríveis instantaneamente! ✨
          </p>
        </div>

        {/* Seção Como Jogar - Premium Compacta */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="bg-gray-800/40 border border-gray-700/50 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-white mb-2">
                🎯 Como Jogar
              </CardTitle>
              <p className="text-gray-300">É simples, rápido e divertido!</p>
            </CardHeader>
            
            <CardContent className="px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-yellow-400 text-black rounded-xl flex items-center justify-center font-bold text-xl shadow-lg mx-auto">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg mb-1">Escolha & Pague</h4>
                    <p className="text-gray-300 text-sm">Selecione sua raspadinha favorita</p>
                  </div>
                </div>
                
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-yellow-400 text-black rounded-xl flex items-center justify-center font-bold text-xl shadow-lg mx-auto">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg mb-1">Raspe & Descubra</h4>
                    <p className="text-gray-300 text-sm">Use o dedo ou mouse para revelar</p>
                  </div>
                </div>
                
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-yellow-400 text-black rounded-xl flex items-center justify-center font-bold text-xl shadow-lg mx-auto">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg mb-1">Ganhe Prêmios</h4>
                    <p className="text-gray-300 text-sm">3 símbolos iguais = vitória!</p>
                  </div>
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

    </div>
  );
};

export default Raspadinha;