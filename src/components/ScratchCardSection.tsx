import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { scratchCardTypes, ScratchCardType } from '@/types/scratchCard';
import { useScratchCard } from '@/hooks/useScratchCard';
import { useKirvanoTest } from '@/hooks/useKirvanoTest';
import ScratchGameCanvas from '@/components/scratch-card/ScratchGameCanvas';
import ScratchCardResult from '@/components/scratch-card/ScratchCardResult';
import ScratchCardSelector from '@/components/scratch-card/ScratchCardSelector';
import PixTestModal from '@/components/PixTestModal';
import { Coins, Sparkles, Trophy, TestTube, Star, Diamond, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ScratchCardSectionProps {
  onAuthRequired: () => void;
}

const ScratchCardSection = ({ onAuthRequired }: ScratchCardSectionProps) => {
  const { user } = useAuth();
  const { walletData } = useWallet();
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<ScratchCardType>('sorte');
  const [showResult, setShowResult] = useState(false);
  const [hasDetectedWin, setHasDetectedWin] = useState(false);
  
  const {
    scratchCard,
    blocks,
    isLoading,
    gameComplete,
    generateScratchCard,
    scratchBlock,
    scratchAll,
    resetGame
  } = useScratchCard();

  const { createTestPayment, processTestPayment, isLoading: isKirvanoLoading, showPixModal, setShowPixModal, pixData } = useKirvanoTest();

  const handleGenerate = async (forcedWin = false) => {
    if (!user) {
      onAuthRequired();
      return;
    }

    const price = scratchCardTypes[selectedType].price;
    if (!walletData || walletData.balance < price) {
      return;
    }

    await generateScratchCard(selectedType, forcedWin);
  };

  const handleComplete = () => {
    setShowResult(true);
  };

  const handleWin = (winningSymbol: string) => {
    console.log('🏆 Win detected with symbol:', winningSymbol);
    setHasDetectedWin(true);
    setShowResult(true);
  };

  const handlePlayAgain = () => {
    setShowResult(false);
    setHasDetectedWin(false);
    resetGame();
  };

  const canAfford = walletData && walletData.balance >= scratchCardTypes[selectedType].price;

  const cardIcons = {
    sorte: Star,
    dupla: Star,
    ouro: Coins,
    diamante: Diamond,
    premium: Crown
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Seletor de Raspadinhas com Cards Temáticos */}
      {!scratchCard && (
        <div className="space-y-6">
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
              const Icon = cardIcons[type];
              const isSelected = selectedType === type;
              const canAfford = walletData && walletData.balance >= config.price;
              
              return (
                <Card
                  key={type}
                  className={`p-4 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                    isSelected 
                      ? 'ring-2 ring-primary shadow-xl transform scale-105' 
                      : 'hover:shadow-md'
                  } ${!canAfford ? 'opacity-60' : ''}`}
                  onClick={() => setSelectedType(type)}
                >
                  <div className="text-center space-y-3">
                    <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${config.color} shadow-lg`}>
                      <Icon className="w-8 h-8 text-white drop-shadow-sm" />
                    </div>
                    
                    <div>
                      <h3 className="font-bold text-sm">{config.name}</h3>
                      <Badge 
                        variant="secondary" 
                        className={`mt-1 ${config.textColor} ${config.bgColor} bg-opacity-20 font-semibold`}
                      >
                        R$ {config.price.toFixed(2)}
                      </Badge>
                    </div>

                    {!canAfford && user && (
                      <p className="text-xs text-destructive">
                        Saldo insuficiente
                      </p>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Botão de Compra e Informações */}
          <div className="text-center space-y-4">
            {user && (
              <div className="text-sm text-muted-foreground">
                Seu saldo: <span className="font-bold text-primary">R$ {walletData?.balance.toFixed(2) || '0,00'}</span>
              </div>
            )}

            <div className="flex gap-2 flex-wrap justify-center">
              <Button
                onClick={() => handleGenerate(false)}
                disabled={isLoading || !canAfford || !!scratchCard}
                className={`px-8 py-3 bg-gradient-to-r ${scratchCardTypes[selectedType].color} hover:opacity-90 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Coins className="w-4 h-4 mr-2" />
                    Comprar por R$ {scratchCardTypes[selectedType].price.toFixed(2)}
                  </>
                )}
              </Button>
              
              {user && (
                <>
                  <Button 
                    onClick={() => handleGenerate(true)}
                    disabled={isLoading || !!scratchCard}
                    variant="outline"
                    size="sm"
                    className="border-primary text-primary hover:bg-primary hover:text-white"
                  >
                    Teste (Vitória)
                  </Button>
                  
                  <Button 
                    onClick={() => navigate('/testedepagamento')}
                    variant="secondary"
                    size="sm"
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <TestTube className="w-4 h-4" />
                    Teste de Pagamentos
                  </Button>
                </>
              )}
            </div>

            {!user && (
              <div className="text-center">
                <Badge variant="outline" className="px-4 py-2">
                  Faça login para jogar com dinheiro real
                </Badge>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Área do Jogo Temática */}
      {scratchCard && !showResult && (
        <Card className={`border-2 bg-gradient-to-br ${scratchCardTypes[selectedType].color}/5 ${scratchCardTypes[selectedType].bgColor}/10`}>
          <CardHeader className="text-center pb-4">
            <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br ${scratchCardTypes[selectedType].color} shadow-xl mb-4`}>
              {React.createElement(cardIcons[selectedType], { className: "w-10 h-10 text-white drop-shadow-sm" })}
            </div>
            <CardTitle className="text-2xl font-bold">
              {scratchCardTypes[selectedType].name}
            </CardTitle>
            <p className="text-muted-foreground">
              Raspe para revelar os símbolos e ganhe prêmios incríveis!
            </p>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="bg-background/80 rounded-xl p-4 mb-6">
              <ScratchGameCanvas
                symbols={scratchCard.symbols}
                onWin={handleWin}
                onComplete={handleComplete}
                className="mx-auto"
              />
            </div>

            <div className="flex justify-center gap-3">
              <Button 
                onClick={scratchAll}
                className={`bg-gradient-to-r ${scratchCardTypes[selectedType].color} hover:opacity-90 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-300`}
              >
                Revelar Tudo
              </Button>
              <Button 
                onClick={handlePlayAgain}
                variant="outline"
                className="border-2 hover:bg-muted"
              >
                Nova Raspadinha
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultado */}
      {showResult && scratchCard && (
        <ScratchCardResult
          isOpen={showResult}
          onClose={() => setShowResult(false)}
          onPlayAgain={handlePlayAgain}
          winningCombination={(scratchCard.hasWin || hasDetectedWin) && scratchCard.winningItem ? {
            pattern: [0, 1, 2], // Mock pattern
            winningSymbol: scratchCard.winningItem
          } : null}
          hasWin={scratchCard.hasWin || hasDetectedWin}
        />
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
      
      {/* Modal PIX Teste */}
      <PixTestModal
        isOpen={showPixModal}
        onClose={() => setShowPixModal(false)}
        onProcess={processTestPayment}
        pixData={pixData}
      />
    </div>
  );
};

export default ScratchCardSection;