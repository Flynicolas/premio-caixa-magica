import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWalletProvider";
import { useScratchCard } from "@/hooks/useScratchCard";
import ScratchGameCanvas from "@/components/scratch-card/ScratchGameCanvas";
import ScratchActionButton, { ScratchGameState } from "@/components/scratch-card/ScratchActionButton";
import SimpleScratchWinModal from "@/components/scratch-card/SimpleScratchWinModal";
import BannerRaspadinha from "@/components/scratch-card/BannerRaspadinha";
import ResponsiveSwitchBar from "@/components/scratch-card/ResponsiveSwitchBar";
import StatusBar from "@/components/scratch-card/StatusBar";
import { scratchCardTypes, ScratchCardType } from "@/types/scratchCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

// Removed - using FSM from ScratchActionButton

const RaspadinhaPlay = () => {
  const { tipo } = useParams<{ tipo: ScratchCardType }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { walletData } = useWallet();
  const [items, setItems] = useState<PrizeItem[]>([]);
  const [winModal, setWinModal] = useState<{ open: boolean; type: "item" | "money"; data: any }>(
    { open: false, type: "item", data: null }
  );
  
  const [isTransitioning, setIsTransitioning] = useState(false);
  const canvasRef = useRef<{ revealAll: () => void }>(null);
  
  // Watchdog timer para prevenir loops infinitos no estado 'resolving'
  const watchdogTimerRef = useRef<NodeJS.Timeout | null>(null);

const [currentScratch, setCurrentScratch] = useState<ScratchCardType>('pix');

const scratchType = useMemo(() => {
  const key = (tipo as ScratchCardType) || "pix";
  return key in scratchCardTypes ? key : null;
}, [tipo]);

// Sync current scratch with URL param
useEffect(() => {
  if (scratchType) {
    setCurrentScratch(scratchType);
  }
}, [scratchType]);

  const {
    scratchCard,
    isLoading,
    gameComplete,
    gameState,
    setGameState,
    startGame,
    triggerFastReveal,
    processGameResult,
    resetGame,
    checkWinningCombination,
  } = useScratchCard();

  // SEO basics
  useEffect(() => {
    if (!scratchType) return;
    const config = scratchCardTypes[scratchType];
    document.title = `${config.name} | Raspadinha`;
    const desc = `Jogue a raspadinha ${config.name} e concorra a prêmios. Preço: R$ ${config.price.toFixed(2)}`;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc);
    // canonical
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', window.location.href);
  }, [scratchType]);

  // Carregar TODOS os itens (inclusive prob 0) para o mostruário
  useEffect(() => {
    if (!scratchType) return;
    const load = async () => {
      const { data: probs, error: pErr } = await supabase
        .from('scratch_card_probabilities')
        .select('item_id, probability_weight')
        .eq('scratch_type', scratchType)
        .eq('is_active', true);
      if (pErr) return;
      const ids = (probs || []).map((p: any) => p.item_id);
      if (ids.length === 0) { setItems([]); return; }
      const { data: its } = await supabase
        .from('items')
        .select('id, name, image_url, rarity, base_value')
        .in('id', ids)
        .eq('is_active', true);
      const merged: PrizeItem[] = (its || []).map(i => ({
        id: i.id,
        name: i.name,
        image_url: i.image_url,
        rarity: i.rarity as string,
        base_value: i.base_value,
        probability_weight: (probs || []).find((v: any) => v.item_id === i.id)?.probability_weight ?? 0,
      })).sort((a,b)=> b.base_value - a.base_value);
      setItems(merged);
    };
    load();
  }, [scratchType]);

  // Inicialização: resetar quando mudar tipo
  useEffect(() => {
    if (!scratchType) return;
    resetGame();
    setGameState('idle');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scratchType]);

  // Watchdog para prevenir loop infinito no estado 'resolving'
  useEffect(() => {
    if (gameState === 'resolving') {
      watchdogTimerRef.current = setTimeout(() => {
        console.warn('🚨 Watchdog: Estado resolving por mais de 3s, forçando término');
        setGameState('fail');
        if (watchdogTimerRef.current) {
          clearTimeout(watchdogTimerRef.current);
          watchdogTimerRef.current = null;
        }
      }, 3000);
    } else {
      if (watchdogTimerRef.current) {
        clearTimeout(watchdogTimerRef.current);
        watchdogTimerRef.current = null;
      }
    }

    return () => {
      if (watchdogTimerRef.current) {
        clearTimeout(watchdogTimerRef.current);
        watchdogTimerRef.current = null;
      }
    };
  }, [gameState]);

  // Limpar timers no unmount
  useEffect(() => {
    return () => {
      if (watchdogTimerRef.current) {
        clearTimeout(watchdogTimerRef.current);
        watchdogTimerRef.current = null;
      }
    };
  }, []);

  // Handlers de canvas inline
  const handleCanvasWin = useCallback((winningSymbol: string) => {
    const sym = scratchCard?.symbols.find(s => s.name === winningSymbol);
    if (sym) {
      // Trigger confetti apenas em vitórias
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      const isMoney = (sym.category === 'dinheiro') || /dinheiro|real/i.test(sym.name || '');
      
      // Aguardar animação dourada por 2.5s
      setTimeout(() => {
        setWinModal({ 
          open: true, 
          type: isMoney ? 'money' : 'item', 
          data: isMoney ? { amount: sym.base_value } : sym 
        });
        processGameResult(scratchType, true, sym);
      }, 2500);
    }
  }, [scratchCard, processGameResult, scratchType]);

  const handleCanvasComplete = useCallback(() => {
    // Derrota rápida e discreta - apenas atualizar estado
    setGameState('fail');
    processGameResult(scratchType, false);
  }, [processGameResult, scratchType, setGameState]);

  const handleCanvasScratchStart = useCallback(() => {
    setGameState('scratching');
  }, []);

  // Handlers de navegação
  const handleScratchChange = (newType: ScratchCardType) => {
    if (isTransitioning || newType === currentScratch) return;
    
    setIsTransitioning(true);
    setGameState('locked');
    
    // Micro-loading com skeleton
    setTimeout(() => {
      setCurrentScratch(newType);
      navigate(`/raspadinhas/${newType}`, { replace: true });
      setIsTransitioning(false);
      setGameState('idle');
    }, 250);
  };

  const config = scratchCardTypes[scratchType];
  const balanceOk = !!walletData && walletData.balance >= config.price;

  // Determinar estado do botão baseado na autenticação, saldo e game state
  const getButtonState = useCallback((): ScratchGameState => {
    if (!user) return 'locked';
    if (isLoading || isTransitioning) return 'locked';
    if (!balanceOk) return 'locked';

    return gameState;
  }, [user, isLoading, isTransitioning, balanceOk, gameState]);

  const buttonState = getButtonState();

  // Handle main button action based on current state
  const handleButtonAction = useCallback(async () => {
    switch (buttonState) {
      case 'idle':
      case 'ready':
        // Iniciar jogo inline
        setGameState('ready');
        await startGame(scratchType);
        break;
      
      case 'scratching':
        // Revelar tudo
        if (canvasRef.current) {
          setGameState('fastReveal');
          canvasRef.current.revealAll();
        }
        break;
      
      case 'success':
      case 'fail':
        // Jogar de novo - reset completo
        resetGame();
        setGameState('ready');
        // Dar foco no botão após reset
        setTimeout(() => {
          const button = document.querySelector('[aria-label*="Raspar"]') as HTMLButtonElement;
          if (button) button.focus();
        }, 100);
        break;
      
      default:
        // Do nothing for locked states
        break;
    }
  }, [buttonState, resetGame, setGameState, startGame, scratchType]);

  // Handle add balance (for locked state)
  const handleAddBalance = useCallback(() => {
    navigate('/carteira');
  }, [navigate]);

  if (!scratchType) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Raspadinha inválida.</p>
        <Button className="mt-4" onClick={() => navigate('/raspadinha')}>Voltar</Button>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-background">
      {/* Banner Header */}
      <header className="w-full">
        <BannerRaspadinha 
          imageUrl={config.coverImage || "/placeholder.svg"}
          alt={`Banner ${config.name}`}
          height={100}
          width="auto" 
          mode="cover"
          className="w-full"
        />
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Switch Bar - Responsiva e Robusta */}
        <div className="max-w-4xl mx-auto">
          <ResponsiveSwitchBar
            currentScratch={currentScratch}
            onScratchChange={handleScratchChange}
            isLoading={isTransitioning}
            hideOnScratch={true}
            gameState={gameState}
          />
        </div>

        {/* Game panel - Canvas Inline sempre visível */}
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-6">
              {/* Canvas area - responsivo */}
              <div className="w-full aspect-square max-w-[400px] relative">
                {scratchCard && scratchCard.symbols ? (
                  <ScratchGameCanvas
                    ref={canvasRef}
                    symbols={scratchCard.symbols}
                    onWin={handleCanvasWin}
                    onComplete={handleCanvasComplete}
                    onScratchStart={handleCanvasScratchStart}
                    gameStarted={gameState === 'scratching' || gameState === 'fastReveal'}
                    scratchType={scratchType}
                    disabled={gameState !== 'scratching'}
                    className="w-full h-full"
                  />
                ) : (
                  // Placeholder até carregar jogo
                  <div className="w-full h-full bg-muted rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <div className="text-4xl opacity-50">🎲</div>
                      <p className="text-sm text-muted-foreground">
                        {gameState === 'idle' ? 'Clique em "Raspar" para iniciar' : 'Carregando...'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Smart Action Button */}
              <ScratchActionButton
                state={buttonState}
                onAction={handleButtonAction}
                onAddBalance={handleAddBalance}
                price={config.price}
                balance={walletData?.balance || 0}
                className="w-full max-w-[300px]"
              />

              {/* Auth prompt for non-authenticated users */}
              {!user && (
                <div className="text-center space-y-3">
                  <p className="text-sm text-muted-foreground">Faça login para jogar</p>
                  <Link to="/perfil">
                    <Button variant="outline">Entrar</Button>
                  </Link>
                </div>
              )}

              {/* Saldo info para usuários autenticados */}
              {user && walletData && (
                <p className="text-xs text-muted-foreground text-center">
                  Saldo: R$ {walletData.balance.toFixed(2)}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Como funciona - Copys limpas */}
        <section className="max-w-3xl mx-auto text-center space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Como funciona</h2>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>1. Escolha a raspadinha e toque em <strong>Raspar</strong></p>
            <p>2. Revele os quadrados — ao encontrar <strong>3 figuras iguais</strong>, você vence</p>
            <p>3. Use <strong>Revelar tudo</strong> se quiser acelerar</p>
            <p>4. O resultado aparece na hora e você pode jogar novamente</p>
          </div>
        </section>

        {/* Catálogo removido conforme solicitado */}
      </main>

      {/* Minimal win modal */}
      <SimpleScratchWinModal
        isOpen={winModal.open}
        onClose={() => setWinModal((w) => ({ ...w, open: false }))}
        winType={winModal.type}
        winData={winModal.data}
      />

      {/* Status Bar - abaixo do botão */}
      <StatusBar 
        status={gameState as any} 
      />
    </div>
  );
};

export default RaspadinhaPlay;
