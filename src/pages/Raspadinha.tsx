import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWalletProvider';
import { scratchCardTypes, ScratchCardType } from '@/types/scratchCard';
import ScratchCardModal from '@/components/scratch-card/ScratchCardModal';
import AuthModal from '@/components/AuthModal';
import ResponsiveBanner from '@/components/ResponsiveBanner';
import { Star, Diamond, Crown, Coins } from 'lucide-react';

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

  const cardIcons = {
    sorte: Star,
    dupla: Star,
    ouro: Coins,
    diamante: Diamond,
    premium: Crown
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      {/* Banner Principal */}
      <ResponsiveBanner 
        imageUrlPC="/banners/raspadinha-banner-pc.jpg"
        imageUrlMobile="/banners/raspadinha-banner-mobile.jpg"
        altText="Banner principal da página de raspadinha"
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Catálogo de Raspadinhas */}
        <div className="w-full max-w-6xl mx-auto space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Escolha sua Raspadinha
            </h2>
            <p className="text-muted-foreground">
              Selecione o tipo de raspadinha e teste sua sorte!
            </p>
          </div>

          {/* Grid de Cards de Raspadinha */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {(Object.entries(scratchCardTypes) as [ScratchCardType, typeof scratchCardTypes[ScratchCardType]][]).map(([type, config]) => {
              const canAfford = walletData && walletData.balance >= config.price;
              
              return (
                <div
                  key={type}
                  className={`relative aspect-square cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg rounded-xl overflow-hidden ${
                    !canAfford && user ? 'opacity-60' : ''
                  }`}
                  onClick={() => handleCardClick(type)}
                >
                  {/* Imagem de capa preenchendo todo o card */}
                  <img
                    src={config.coverImage}
                    alt={config.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Etiqueta de preço discreta */}
                  <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-lg text-xs font-semibold">
                    R$ {config.price.toFixed(2)}
                  </div>

                  {/* Overlay de saldo insuficiente */}
                  {!canAfford && user && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <p className="text-white text-xs font-semibold bg-destructive px-2 py-1 rounded">
                        Saldo insuficiente
                      </p>
                    </div>
                  )}
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end">
                    <div className="p-3 text-white w-full">
                      <h3 className="font-bold text-sm">{config.name}</h3>
                      <p className="text-xs opacity-90">Clique para jogar</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Informações do usuário */}
          {user && (
            <div className="text-center">
              <div className="text-sm text-muted-foreground">
                Seu saldo: <span className="font-bold text-primary">R$ {walletData?.balance.toFixed(2) || '0,00'}</span>
              </div>
            </div>
          )}

          {!user && (
            <div className="text-center">
              <Badge variant="outline" className="px-4 py-2">
                Faça login para jogar com dinheiro real
              </Badge>
            </div>
          )}

          {/* Descrição de Como Funciona */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Como Funciona</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-2 font-bold">
                    1
                  </div>
                  <p><strong>Escolha</strong> o tipo de raspadinha que deseja jogar</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-2 font-bold">
                    2
                  </div>
                  <p><strong>Raspe</strong> os blocos para revelar os símbolos</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-2 font-bold">
                    3
                  </div>
                  <p><strong>Ganhe</strong> se conseguir 3 símbolos iguais!</p>
                </div>
              </div>
              <div className="text-center pt-4 border-t">
                <p>
                  <strong>Dica:</strong> Quanto maior o valor da raspadinha, maiores são os prêmios disponíveis!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Modal de Autenticação */}
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </div>

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