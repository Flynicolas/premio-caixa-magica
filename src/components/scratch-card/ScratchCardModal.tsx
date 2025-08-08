import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWalletProvider';
import { useDemo } from '@/hooks/useDemo';
import { useDemoWallet } from '@/hooks/useDemoWallet';
import { scratchCardTypes, ScratchCardType } from '@/types/scratchCard';
import { useScratchCard } from '@/hooks/useScratchCard';
import { useKirvanoTest } from '@/hooks/useKirvanoTest';
import ScratchGameCanvas from '@/components/scratch-card/ScratchGameCanvas';
import ScratchCardResult from '@/components/scratch-card/ScratchCardResult';
import ScratchCardLoader from '@/components/scratch-card/ScratchCardLoader';
import ScratchCardAnimations from '@/components/scratch-card/ScratchCardAnimations';
import ScratchCardPrizeCatalog from '@/components/scratch-card/ScratchCardPrizeCatalog';
import ScratchWinModal from '@/components/scratch-card/ScratchWinModal';
import ScratchLossToast from '@/components/scratch-card/ScratchLossToast';
import PixTestModal from '@/components/PixTestModal';
import { Coins, Sparkles, X, Star, Diamond, Crown, Eye } from 'lucide-react';

interface ScratchCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedType: ScratchCardType;
  onAuthRequired: () => void;
}

const ScratchCardModal = ({ isOpen, onClose, selectedType, onAuthRequired }: ScratchCardModalProps) => {
  const { user } = useAuth();
  const { walletData } = useWallet();
  const { isDemo } = useDemo();
  const { walletData: demoWallet, purchaseChestDemo, refreshData: refreshDemoWallet } = useDemoWallet();
  const [showResult, setShowResult] = useState(false);
  const [hasDetectedWin, setHasDetectedWin] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [gamePhase, setGamePhase] = useState<'ready' | 'playing' | 'complete' | 'locked'>('ready');
  const [gameStarted, setGameStarted] = useState(false);
  const [showPrizeCatalog, setShowPrizeCatalog] = useState(false);
  const [winningResult, setWinningResult] = useState<{type: 'item' | 'money', data: any} | null>(null);
  const [showLossMessage, setShowLossMessage] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const canvasRef = useRef<{ revealAll: () => void } | null>(null);
  
  const {
    scratchCard,
    blocks,
    isLoading,
    gameComplete,
    generateScratchCard,
    processGame,
    scratchBlock,
    scratchAll,
    resetGame
  } = useScratchCard();

  const { createTestPayment, processTestPayment, isLoading: isKirvanoLoading, showPixModal, setShowPixModal, pixData } = useKirvanoTest();

  // Inicializar raspadinha ao abrir modal
  React.useEffect(() => {
    if (isOpen && !scratchCard) {
      initializeGame();
    }
  }, [isOpen, selectedType]);

  const initializeGame = async () => {
    if (!user) {
      onAuthRequired();
      return;
    }

    setShowLoader(true);
    setImagesLoaded(false);
    setGamePhase('ready');
    setGameStarted(false);
    setShowResult(false);
    setHasDetectedWin(false);
    resetGame();

    await generateScratchCard(selectedType, false);
  };

// Cobrar e iniciar jogo
  const handleStartGame = async () => {
    if (!user) {
      onAuthRequired();
      return;
    }

    const price = scratchCardTypes[selectedType].price;
    const balance = isDemo ? (demoWallet?.balance || 0) : (walletData?.balance || 0);
    if (balance < price) {
      return;
    }

    // No DEMO, debita do crédito demo sem back-end
    if (isDemo) {
      const res = await purchaseChestDemo(selectedType, price);
      if (res && res.error) return;
      await refreshDemoWallet();
    }
    
    setGamePhase('playing');
    setGameStarted(true);
  };

  // Repetir jogo (nova raspadinha)
  const handleRepeatGame = async () => {
    if (!user) {
      onAuthRequired();
      return;
    }
    
    // Reset completo do jogo
    setShowResult(false);
    setHasDetectedWin(false);
    setWinningResult(null);
    setShowLossMessage(false);
    setImagesLoaded(false);
    setGamePhase('ready');
    setGameStarted(false);
    setIsRevealing(false);
    resetGame();
    
    // Gerar nova raspadinha
    setShowLoader(true);
    await generateScratchCard(selectedType, false);
  };

  const handleComplete = async () => {
    setGamePhase('locked');
    
    // Dar um pequeno delay para que o usuário veja o resultado antes do processamento
    setTimeout(async () => {
      // Verificar se ganhou algo
      const winningCombination = checkWinningCombination();
      const hasWin = !!winningCombination;
      
      // Processar o jogo no backend
      const result = await processGame(selectedType, hasWin, winningCombination?.winningSymbol);
      
      if (result && result.success) {
        // Pequeno delay adicional para dar tempo de processar
        setTimeout(() => {
          if (hasWin && winningCombination) {
            const winningItem = winningCombination.winningSymbol;
            
            // Determinar tipo de prêmio
            if (winningItem.category === 'dinheiro' || winningItem.name.toLowerCase().includes('dinheiro') || winningItem.name.toLowerCase().includes('real')) {
              setWinningResult({
                type: 'money',
                data: { amount: winningItem.base_value, name: winningItem.name }
              });
            } else {
              setWinningResult({
                type: 'item', 
                data: winningItem
              });
            }
            setHasDetectedWin(true);
          } else {
            // Mostrar mensagem de perda
            setShowLossMessage(true);
          }
        }, 500);
      }
    }, 200);
  };

  const handleWin = (winningSymbol: string) => {
    console.log('🏆 Win detected with symbol:', winningSymbol);
    setHasDetectedWin(true);
  };

  // Função para verificar combinação vencedora (do hook useScratchCard)
  const checkWinningCombination = () => {
    if (!scratchCard || !scratchCard.symbols) return null;

    const symbolCount: Record<string, number[]> = {};
    
    scratchCard.symbols.forEach((symbol, index) => {
      if (symbol) {
        const symbolId = symbol.id;
        if (!symbolCount[symbolId]) {
          symbolCount[symbolId] = [];
        }
        symbolCount[symbolId].push(index);
      }
    });

    // Verificar se algum símbolo aparece 3 ou mais vezes
    for (const [symbolId, positions] of Object.entries(symbolCount)) {
      if (positions.length >= 3) {
        const winningSymbol = scratchCard.symbols[positions[0]];
        if (winningSymbol) {
          return {
            pattern: positions.slice(0, 3),
            winningSymbol
          };
        }
      }
    }

    return null;
  };

  const handlePlayAgain = () => {
    setShowResult(false);
    setHasDetectedWin(false);
    setImagesLoaded(false);
    resetGame();
  };

  const handleLoaderComplete = () => {
    setShowLoader(false);
    setImagesLoaded(true);
  };

  const handleRevealAll = () => {
    setIsRevealing(true);
    setGamePhase('locked');
    
    if (canvasRef.current) {
      // Animação de 1-2 segundos apagando o canvas
      setTimeout(() => {
        canvasRef.current?.revealAll();
        setIsRevealing(false);
        handleComplete();
      }, 1500);
    }
  };

  const handleClose = () => {
    resetGame();
    setGamePhase('ready');
    setGameStarted(false);
    setShowResult(false);
    setHasDetectedWin(false);
    setWinningResult(null);
    setShowLossMessage(false);
    setIsRevealing(false);
    onClose();
  };

  const displayedBalance = isDemo ? (demoWallet?.balance || 0) : (walletData?.balance || 0);
  const canAfford = displayedBalance >= scratchCardTypes[selectedType].price;

  const cardIcons = {
    pix: Coins,
    sorte: Star,
    dupla: Star,
    ouro: Coins,
    diamante: Diamond,
    premium: Crown
  };

  const config = scratchCardTypes[selectedType];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-full max-h-full w-screen h-screen p-0 m-0 rounded-none border-0 bg-gradient-to-br from-background via-secondary/20 to-background overflow-hidden">
          {/* Header fixo com botão fechar e título */}
          <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br ${config.color} shadow-lg`}>
                {React.createElement(cardIcons[selectedType], { className: "w-5 h-5 text-white" })}
              </div>
              <div className="flex flex-col">
                <h1 className="font-bold text-lg text-foreground">{config.name}</h1>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">R$ {config.price.toFixed(2)}</p>
                  {user && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      Saldo: R$ {displayedBalance.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Botão catálogo de prêmios */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPrizeCatalog(true)}
                className="flex items-center gap-1"
                title="Ver catálogo de prêmios"
              >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Ver Prêmios</span>
                <span className="sm:hidden">Prêmios</span>
              </Button>
              
              {/* Botão fechar */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="p-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Conteúdo principal */}
          <div className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 py-6 max-w-4xl">

              {/* Área do Jogo - Maior no mobile */}
              {scratchCard && !showResult && (
                <div className="space-y-6">
                  <Card className={`border-2 bg-gradient-to-br ${config.color}/5 relative overflow-hidden`}>
                    {/* Animações de fundo */}
                    <ScratchCardAnimations 
                      isActive={imagesLoaded && !showResult}
                      winState={hasDetectedWin ? 'big' : 'none'}
                    />

                    <CardContent className="p-4 md:p-8 relative z-10">
                      {/* Canvas da raspadinha - área limpa de jogo */}
                      <div className="bg-background/90 backdrop-blur-sm rounded-2xl p-4 md:p-6 mb-4 relative">
                        {/* Loading overlay quando não carregado */}
                        {!imagesLoaded && (
                          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-20">
                            <div className="text-center space-y-3">
                              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                              <p className="text-sm text-muted-foreground font-medium">Preparando raspadinha...</p>
                            </div>
                          </div>
                        )}

                        {/* Loading de revelação */}
                        {isRevealing && (
                          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-20">
                            <div className="text-center space-y-3">
                              <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                              <p className="text-sm text-muted-foreground font-medium">Revelando tudo...</p>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex justify-center">
                          {imagesLoaded && (
                            <ScratchGameCanvas
                              ref={canvasRef}
                              symbols={scratchCard.symbols}
                              onWin={handleWin}
                              onComplete={handleComplete}
                              onScratchStart={() => setGamePhase('playing')}
                              scratchType={selectedType}
                              gameStarted={gameStarted}
                              disabled={gamePhase === 'ready' || gamePhase === 'locked' || isRevealing}
                              className="w-full max-w-[320px] sm:max-w-[400px] md:max-w-[500px] mx-auto"
                            />
                          )}
                        </div>
                      </div>

                      {/* Área de feedback sutil embaixo do jogo */}
                      <div className="text-center mb-4">
                        {gamePhase === 'ready' && !gameStarted && imagesLoaded && (
                          <p className="text-sm text-muted-foreground font-medium">
                            💰 Clique em raspar para começar
                          </p>
                        )}
                        
                        {gamePhase === 'playing' && gameStarted && imagesLoaded && (
                          <p className="text-sm text-green-600 font-medium animate-pulse">
                            ✨ Raspe gradualmente para revelar os prêmios
                          </p>
                        )}
                        
                        {isRevealing && (
                          <p className="text-sm text-orange-600 font-medium animate-pulse">
                            🎰 Verificando combinações...
                          </p>
                        )}
                        
                        {gamePhase === 'locked' && !isRevealing && (
                          <p className="text-sm text-muted-foreground font-medium">
                            🎲 Jogo finalizado! Clique em "Raspar denovo" para jogar novamente
                          </p>
                        )}
                      </div>

                      {/* Botão Dinâmico - Muito maior no mobile */}
                      <div className="flex justify-center">
                        {gamePhase === 'ready' && (
                          <Button 
                            onClick={handleStartGame}
                            disabled={!imagesLoaded || !canAfford}
                            className={`bg-gradient-to-r ${config.color} hover:opacity-90 text-white font-bold text-lg px-8 py-4 rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 w-full max-w-sm h-14`}
                          >
                            <Coins className="w-5 h-5 mr-3" />
                            Raspar: R$ {config.price.toFixed(2)}
                          </Button>
                        )}
                        
                        {gamePhase === 'playing' && (
                          <Button 
                            onClick={handleRevealAll}
                            disabled={!imagesLoaded || isRevealing}
                            className={`bg-gradient-to-r ${config.color} hover:opacity-90 text-white font-bold text-lg px-8 py-4 rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 w-full max-w-sm h-14 disabled:opacity-50`}
                          >
                            <Sparkles className="w-5 h-5 mr-3" />
                            {isRevealing ? 'Revelando...' : 'Revelar Tudo'}
                          </Button>
                        )}
                        
                        {gamePhase === 'locked' && (
                          <Button 
                            onClick={handleRepeatGame}
                            disabled={!canAfford}
                            className={`bg-gradient-to-r ${config.color} hover:opacity-90 text-white font-bold text-lg px-8 py-4 rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 w-full max-w-sm h-14`}
                          >
                            <Coins className="w-5 h-5 mr-3" />
                            Raspar denovo: R$ {config.price.toFixed(2)}
                          </Button>
                        )}
                      </div>

                      {/* Aviso de saldo insuficiente */}
                      {!canAfford && user && (
                        <div className="text-center mt-4">
                          <Badge variant="destructive" className="px-4 py-2">
                            Saldo insuficiente para jogar
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Instruções rápidas minimizadas */}
              <div className="bg-background/50 backdrop-blur-sm rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground mb-2 font-medium">Como Jogar</p>
                <div className="flex items-center justify-center gap-4 text-xs">
                  <span className="flex items-center gap-1">
                    <span className="w-4 h-4 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-[10px] font-bold">1</span>
                    Pague
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-4 h-4 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-[10px] font-bold">2</span>
                    Raspe
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-4 h-4 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-[10px] font-bold">3</span>
                    Ganhe!
                  </span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Loader de preparação da raspadinha */}
      <ScratchCardLoader
        isVisible={showLoader}
        onLoadComplete={handleLoaderComplete}
      />

      {/* Modal de ganho */}
      {hasDetectedWin && winningResult && (
        <ScratchWinModal
          isOpen={hasDetectedWin && !!winningResult}
          onClose={() => {
            setHasDetectedWin(false);
            setWinningResult(null);
          }}
          onPlayAgain={handleRepeatGame}
          winType={winningResult.type}
          winData={winningResult.data}
        />
      )}

      {/* Toast de perda */}
      <ScratchLossToast
        isVisible={showLossMessage}
        onClose={() => setShowLossMessage(false)}
        onPlayAgain={handleRepeatGame}
      />

      {/* Catálogo de prêmios */}
      <ScratchCardPrizeCatalog
        isOpen={showPrizeCatalog}
        onClose={() => setShowPrizeCatalog(false)}
        scratchType={selectedType}
      />
      
      {/* Modal PIX Teste */}
      <PixTestModal
        isOpen={showPixModal}
        onClose={() => setShowPixModal(false)}
        onProcess={processTestPayment}
        pixData={pixData}
      />
    </>
  );
};

export default ScratchCardModal;