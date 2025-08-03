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

          {/* Descrição de Como Funciona - Moderna e Compacta */}
          <Card className="bg-gradient-to-r from-primary/5 via-background to-secondary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-foreground mb-2">🎯 Como Jogar</h3>
                <p className="text-muted-foreground text-sm">É simples e divertido!</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3 md:flex-col md:text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-lg">
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">Escolha & Pague</h4>
                    <p className="text-sm text-muted-foreground">Selecione sua raspadinha favorita</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 md:flex-col md:text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-secondary to-secondary/80 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-lg">
                    2
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">Raspe & Descubra</h4>
                    <p className="text-sm text-muted-foreground">Revele os símbolos secretos</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 md:flex-col md:text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-lg">
                    3
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">Ganhe Prêmios</h4>
                    <p className="text-sm text-muted-foreground">3 símbolos iguais = vitória!</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg text-center border border-yellow-500/20">
                <p className="text-sm font-medium text-foreground">
                  💡 <strong>Dica Especial:</strong> Raspadinhas mais caras têm prêmios maiores e melhores chances!
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