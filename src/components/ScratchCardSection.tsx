import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { scratchCardTypes, ScratchCardType } from '@/types/scratchCard';
import { useScratchCard } from '@/hooks/useScratchCard';
import { useKirvanoTest } from '@/hooks/useKirvanoTest';
import ScratchGameCanvas from '@/components/scratch-card/ScratchGameCanvas';
import ScratchCardResult from '@/components/scratch-card/ScratchCardResult';
import { Coins, Sparkles, Trophy, CreditCard } from 'lucide-react';

interface ScratchCardSectionProps {
  onAuthRequired: () => void;
}

const ScratchCardSection = ({ onAuthRequired }: ScratchCardSectionProps) => {
  const { user } = useAuth();
  const { walletData } = useWallet();
  const [selectedType, setSelectedType] = useState<ScratchCardType>('basic');
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

  const { createTestPayment, isLoading: isKirvanoLoading } = useKirvanoTest();

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

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Banner da Raspadinha */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-red-400/20 border border-yellow-400/30 h-32">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/30 via-orange-500/30 to-red-500/30" />
        <div className="relative px-6 py-4 text-center h-full flex flex-col justify-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
              RASPADINHA PREMIADA
            </h1>
            <Sparkles className="w-6 h-6 text-yellow-500" />
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            Raspe e ganhe prêmios incríveis instantaneamente!
          </p>
        </div>
      </div>

      {/* Seleção de Tipo e Controles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Escolha Sua Raspadinha
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Select
              value={selectedType}
              onValueChange={(value: ScratchCardType) => setSelectedType(value)}
            >
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(scratchCardTypes).map(([type, info]) => (
                  <SelectItem key={type} value={type}>
                    <div className="flex items-center justify-between w-full">
                      <span>{info.name}</span>
                      <Badge variant="outline" className="ml-2">
                        R$ {info.price}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2 flex-wrap justify-center">
              <Button 
                onClick={() => handleGenerate(false)}
                disabled={isLoading || !canAfford || !!scratchCard}
                className="flex items-center gap-2"
              >
                <Coins className="w-4 h-4" />
                {isLoading ? 'Gerando...' : 'Comprar'}
              </Button>
              
              {user && (
                <>
                  <Button 
                    onClick={() => handleGenerate(true)}
                    disabled={isLoading || !!scratchCard}
                    variant="outline"
                    size="sm"
                  >
                    Teste (Vitória)
                  </Button>
                  
                  <Button 
                    onClick={() => createTestPayment(scratchCardTypes[selectedType].price)}
                    disabled={isKirvanoLoading}
                    variant="secondary"
                    size="sm"
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <CreditCard className="w-4 h-4" />
                    {isKirvanoLoading ? 'Testando...' : 'Teste Kirvano'}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Informações do Saldo */}
          {user && (
            <div className="text-center text-sm text-muted-foreground">
              Saldo atual: R$ {walletData?.balance.toFixed(2) || '0,00'}
              {!canAfford && (
                <span className="text-red-500 ml-2">
                  (Saldo insuficiente)
                </span>
              )}
            </div>
          )}

          {!user && (
            <div className="text-center">
              <Badge variant="outline" className="px-4 py-2">
                Faça login para jogar com dinheiro real
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Área do Jogo */}
      {scratchCard && !showResult && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold mb-2">
                {scratchCardTypes[selectedType].name}
              </h3>
              <p className="text-muted-foreground">
                Raspe para revelar os símbolos!
              </p>
            </div>

            <ScratchGameCanvas
              symbols={scratchCard.symbols}
              onWin={handleWin}
              onComplete={handleComplete}
              className="mx-auto"
            />

            <div className="flex justify-center gap-2 mt-4">
              <Button 
                onClick={scratchAll}
                variant="outline"
                size="sm"
              >
                Revelar Tudo
              </Button>
              <Button 
                onClick={handlePlayAgain}
                variant="outline"
                size="sm"
              >
                Reiniciar
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
    </div>
  );
};

export default ScratchCardSection;