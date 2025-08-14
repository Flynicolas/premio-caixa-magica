import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWalletProvider";
import { useScratchCard } from "@/hooks/useScratchCard";
import ScratchActionButton, { ScratchGameState } from "@/components/scratch-card/ScratchActionButton";
import SimpleScratchWinModal from "@/components/scratch-card/SimpleScratchWinModal";
import StatusBar from "@/components/scratch-card/StatusBar";
import CompactScratchCatalog from "@/components/scratch-card/CompactScratchCatalog";
import ScratchGameCanvas from "@/components/scratch-card/ScratchGameCanvas";
import BannerRaspadinha from "@/components/scratch-card/BannerRaspadinha";
import RaspadinhasSwitchBar from "@/components/scratch-card/RaspadinhasSwitchBar";
import ModernAuthModal from "@/components/ModernAuthModal";
import { scratchCardTypes, ScratchCardType } from "@/types/scratchCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogIn, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import confetti from 'canvas-confetti';

interface PrizeItem {
  id: string;
  name: string;
  image_url: string | null;
  rarity: string;
  base_value: number;
  probability_weight: number;
}

const APP_NAME = "Raspadinha";

const RaspadinhaPlay = () => {
  const { tipo } = useParams<{ tipo: ScratchCardType }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { walletData } = useWallet();
  
  const isAuthenticated = !!user;
  const balance = walletData?.balance || 0;
  
  const [showWinModal, setShowWinModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [winResult, setWinResult] = useState<any>(null);
  const [items, setItems] = useState<PrizeItem[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Current scratch type management
  const currentScratch = useMemo(() => {
    return (tipo && scratchCardTypes[tipo]) ? tipo : 'pix';
  }, [tipo]);

  const currentPrice = scratchCardTypes[currentScratch]?.price || 5;

  // Usar o hook de scratch card
  const {
    isLoading,
    scratchCard,
    blocks,
    symbols,
    gameComplete,
    gameState,
    scratchBlock,
    resetGame,
    startGame,
    triggerFastReveal,
    processGameResult
  } = useScratchCard();

  // Carregar itens do catálogo (inclusive probabilidade 0)
  useEffect(() => {
    const loadItems = async () => {
      try {
        const { data: probs } = await supabase
          .from('scratch_card_probabilities')
          .select('item_id, probability_weight')
          .eq('scratch_type', currentScratch)
          .eq('is_active', true);

        if (!probs || probs.length === 0) {
          setItems([]);
          return;
        }

        const itemIds = probs.map(p => p.item_id);
        const { data: itemsData } = await supabase
          .from('items')
          .select('id, name, image_url, rarity, base_value')
          .in('id', itemIds)
          .eq('is_active', true);

        if (!itemsData) {
          setItems([]);
          return;
        }

        const mergedItems: PrizeItem[] = itemsData.map(item => ({
          id: item.id,
          name: item.name,
          image_url: item.image_url,
          rarity: item.rarity as string,
          base_value: item.base_value,
          probability_weight: probs.find(p => p.item_id === item.id)?.probability_weight || 0,
        })).sort((a, b) => b.base_value - a.base_value);

        setItems(mergedItems);
      } catch (error) {
        console.error('Erro ao carregar itens:', error);
        setItems([]);
      }
    };

    loadItems();
  }, [currentScratch]);

  // Auto-reset when changing scratch type
  useEffect(() => {
    resetGame();
  }, [currentScratch, resetGame]);

  // Process game completion
  useEffect(() => {
    if (!gameComplete || !scratchCard) return;

    // Check for winning combination
    const symbolCount: Record<string, number> = {};
    let winningSymbol: any = null;

    blocks.forEach(block => {
      if (block.symbol && block.isScratched) {
        const symbolId = block.symbol.id;
        symbolCount[symbolId] = (symbolCount[symbolId] || 0) + 1;
        
        if (symbolCount[symbolId] >= 3) {
          winningSymbol = block.symbol;
        }
      }
    });

    const hasWin = !!winningSymbol;

    // Process result
    processGameResult(currentScratch, hasWin, winningSymbol);

    if (hasWin) {
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Show win modal after golden highlight
      setTimeout(() => {
        setWinResult(winningSymbol);
        setShowWinModal(true);
      }, 2500);
    }
  }, [gameComplete, blocks, scratchCard, currentScratch, processGameResult]);

  // Handle scratch type change
  const handleScratchChange = useCallback((newType: ScratchCardType) => {
    if (isTransitioning || newType === currentScratch) return;
    
    setIsTransitioning(true);
    
    // Micro-loading com skeleton
    setTimeout(() => {
      navigate(`/raspadinhas/${newType}`, { replace: true });
      setIsTransitioning(false);
    }, 250);
  }, [isTransitioning, currentScratch, navigate]);

  // Determine button state
  const getButtonState = useCallback((): ScratchGameState => {
    if (!isAuthenticated) return 'locked';
    if (isLoading || isTransitioning) return 'locked';
    if (balance < currentPrice) return 'locked';

    return gameState;
  }, [isAuthenticated, isLoading, isTransitioning, balance, currentPrice, gameState]);

  // Handle button action
  const handleButtonAction = useCallback(async () => {
    const buttonState = getButtonState();

    if (buttonState === 'idle' || buttonState === 'ready') {
      // Start game
      await startGame(currentScratch);
    } else if (buttonState === 'scratching') {
      // Reveal all
      triggerFastReveal();
    } else if (buttonState === 'success' || buttonState === 'fail') {
      // Play again
      resetGame();
      setWinResult(null);
      setShowWinModal(false);
    }
  }, [getButtonState, startGame, currentScratch, triggerFastReveal, resetGame]);

  // Função para lidar com a conclusão do jogo
  const handleComplete = useCallback((hasWin: boolean, winningItem?: any) => {
    console.log('Jogo completo:', { hasWin, winningItem });
    
    if (hasWin && winningItem) {
      setWinResult(winningItem);
      setShowWinModal(true);
    }
    
    processGameResult(currentScratch, hasWin, winningItem);
  }, [currentScratch, processGameResult]);

  const handleAddBalance = useCallback(() => {
    navigate('/carteira');
  }, [navigate]);

  // Função para obter mensagem de status
  const getStatusMessage = useCallback(() => {
    switch (gameState) {
      case 'ready':
      case 'idle':
        return "Pronto para jogar.";
      case 'scratching':
        return "Raspando... toque novamente para revelar tudo.";
      case 'fastReveal':
        return "Revelando...";
      case 'resolving':
        return "Verificando resultado...";
      case 'success':
        return "Você ganhou! 🎉";
      case 'fail':
        return "Não foi desta vez 😕";
      case 'locked':
        return "Saldo insuficiente.";
      default:
        return "";
    }
  }, [gameState]);

  if (!scratchCardTypes[currentScratch]) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">
            Raspadinha não encontrada
          </h1>
          <p className="text-muted-foreground mb-6">
            O tipo de raspadinha "{currentScratch}" não existe.
          </p>
          <Button onClick={() => navigate('/raspadinhas/pix')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para PIX
          </Button>
        </Card>
      </div>
    );
  }

      return (
        <>

      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* Banner da raspadinha */}
          <BannerRaspadinha 
            imageUrl={scratchCardTypes[currentScratch]?.coverImage || "/placeholder.svg"}
            alt={`Banner ${scratchCardTypes[currentScratch]?.name}`}
          />
          
          {/* Switch bar para trocar de raspadinha */}
          <RaspadinhasSwitchBar 
            currentScratch={currentScratch}
            onScratchChange={handleScratchChange}
            isLoading={isTransitioning}
            gameState={gameState}
            hideOnScratch={true}
          />

          {/* Canvas inline - sempre visível */}
          <Card className="p-6">
            <div className="space-y-4">
              {/* Canvas de jogo */}
              <div className="relative">
                <ScratchGameCanvas
                  symbols={symbols}
                  onWin={() => {}}
                  onComplete={() => {}}
                  disabled={!isAuthenticated || (gameState !== 'scratching' && gameState !== 'fastReveal')}
                />
              </div>

              {/* Status bar */}
              <StatusBar 
                status={gameState} 
                message={getStatusMessage()}
                className="text-center"
              />

              {/* Saldo e botão de ação */}
              {isAuthenticated ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-muted/30 p-3 rounded-lg">
                    <span className="text-sm text-muted-foreground">Seu saldo:</span>
                    <span className="font-bold text-primary">
                      R$ {balance.toFixed(2)}
                    </span>
                  </div>

                  <ScratchActionButton
                    state={getButtonState()}
                    onAction={handleButtonAction}
                    price={currentPrice}
                    balance={balance}
                    onAddBalance={handleAddBalance}
                  />
                </div>
              ) : (
                <div className="bg-muted/50 p-4 rounded-lg border border-border text-center">
                  <p className="text-muted-foreground mb-4">
                    Entre para jogar e concorrer a prêmios reais!
                  </p>
                  <Button onClick={() => setShowLoginModal(true)} className="w-full">
                    <LogIn className="w-4 h-4 mr-2" />
                    Entrar
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Catálogo de prêmios */}
          <CompactScratchCatalog currentType={currentScratch} onPlayType={handleScratchChange} />
        </div>

        {/* Modais */}
        <ModernAuthModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />

        <SimpleScratchWinModal
          isOpen={showWinModal}
          onClose={() => setShowWinModal(false)}
          winType={winResult?.category === 'dinheiro' ? 'money' : 'item'}
          winData={winResult}
        />
      </main>
    </>
  );
};

export default RaspadinhaPlay;