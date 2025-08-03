import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWalletProvider';
import { scratchCardTypes, ScratchCardType } from '@/types/scratchCard';
import { useScratchCard } from '@/hooks/useScratchCard';
import { useKirvanoTest } from '@/hooks/useKirvanoTest';
import ScratchGameCanvas from '@/components/scratch-card/ScratchGameCanvas';
import ScratchCardResult from '@/components/scratch-card/ScratchCardResult';
import ScratchCardLoader from '@/components/scratch-card/ScratchCardLoader';
import ScratchCardAnimations from '@/components/scratch-card/ScratchCardAnimations';
import ScratchCardPrizeCatalog from '@/components/scratch-card/ScratchCardPrizeCatalog';
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
  const [showResult, setShowResult] = useState(false);
  const [hasDetectedWin, setHasDetectedWin] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [gamePhase, setGamePhase] = useState<'ready' | 'playing' | 'complete'>('ready');
  const [gameStarted, setGameStarted] = useState(false);
  const [showPrizeCatalog, setShowPrizeCatalog] = useState(false);
  const canvasRef = useRef<{ revealAll: () => void } | null>(null);
  
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
    if (!walletData || walletData.balance < price) {
      return;
    }

    // TODO: Integrar com sistema de carteira para debitar saldo
    console.log(`💰 Cobrando R$${price} para iniciar a raspagem`);
    
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
    setImagesLoaded(false);
    setGamePhase('ready');
    setGameStarted(false);
    resetGame();
    
    // Gerar nova raspadinha
    setShowLoader(true);
    await generateScratchCard(selectedType, false);
  };

  const handleComplete = () => {
    setGamePhase('complete');
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
    setImagesLoaded(false);
    resetGame();
  };

  const handleLoaderComplete = () => {
    setShowLoader(false);
    setImagesLoaded(true);
  };

  const handleRevealAll = () => {
    setGamePhase('complete');
    if (canvasRef.current) {
      canvasRef.current.revealAll();
    }
  };

  const handleClose = () => {
    resetGame();
    setGamePhase('ready');
    setGameStarted(false);
    setShowResult(false);
    setHasDetectedWin(false);
    onClose();
  };

  const canAfford = walletData && walletData.balance >= scratchCardTypes[selectedType].price;

  const cardIcons = {
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
                      Saldo: R$ {walletData?.balance.toFixed(2) || '0,00'}
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
                      {/* Canvas da raspadinha - muito maior no mobile */}
                      <div className="bg-background/90 backdrop-blur-sm rounded-2xl p-4 md:p-6 mb-6 relative">
                        {/* Feedback visual quando jogo inicia */}
                        {/* Loading overlay quando não carregado */}
                        {!imagesLoaded && (
                          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-20">
                            <div className="text-center space-y-3">
                              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                              <p className="text-sm text-muted-foreground font-medium">Preparando raspadinha...</p>
                            </div>
                          </div>
                        )}
                        
                        {/* Feedback visual quando jogo inicia */}
                        {gameStarted && gamePhase === 'playing' && imagesLoaded && (
                          <div className="absolute top-4 left-4 right-4 z-20 animate-pulse">
                            <div className="bg-green-500/90 text-white px-4 py-3 rounded-xl text-center font-semibold">
                              🎮 Jogo iniciado! Raspe para revelar os prêmios!
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
                              scratchType={selectedType}
                              gameStarted={gameStarted}
                              disabled={gamePhase === 'ready'}
                              className="w-full max-w-[320px] sm:max-w-[400px] md:max-w-[500px] mx-auto"
                            />
                          )}
                        </div>
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
                            disabled={!imagesLoaded}
                            className={`bg-gradient-to-r ${config.color} hover:opacity-90 text-white font-bold text-lg px-8 py-4 rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 w-full max-w-sm h-14`}
                          >
                            <Sparkles className="w-5 h-5 mr-3" />
                            Revelar Tudo
                          </Button>
                        )}
                        
                        {gamePhase === 'complete' && (
                          <Button 
                            onClick={handleRepeatGame}
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

      {/* Modal de resultado */}
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