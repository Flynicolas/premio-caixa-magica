import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWalletProvider";
import { useScratchCard } from "@/hooks/useScratchCard";
import ScratchGameCanvas from "@/components/scratch-card/ScratchGameCanvas";
import ScratchCardAnimations from "@/components/scratch-card/ScratchCardAnimations";
import SimpleScratchWinModal from "@/components/scratch-card/SimpleScratchWinModal";
import ScratchLossToast from "@/components/scratch-card/ScratchLossToast";
import BannerRaspadinha from "@/components/scratch-card/BannerRaspadinha";
import RaspadinhasSwitchBar from "@/components/scratch-card/RaspadinhasSwitchBar";
import StatusBar from "@/components/scratch-card/StatusBar";
import CompactScratchCatalog from "@/components/scratch-card/CompactScratchCatalog";
import { scratchCardTypes, ScratchCardType } from "@/types/scratchCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, AlertCircle, RefreshCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PrizeItem {
  id: string;
  name: string;
  image_url: string | null;
  rarity: string;
  base_value: number;
  probability_weight: number;
}

type GamePhase = 'idle' | 'ready' | 'scratching' | 'revealing' | 'success' | 'fail' | 'loading';

const RaspadinhaPlay = () => {
  const { tipo } = useParams<{ tipo: ScratchCardType }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { walletData } = useWallet();
  const [items, setItems] = useState<PrizeItem[]>([]);
  const [winModal, setWinModal] = useState<{ open: boolean; type: "item" | "money"; data: any }>(
    { open: false, type: "item", data: null }
  );
  const [showLossBanner, setShowLossBanner] = useState(false);
  const [gamePhase, setGamePhase] = useState<GamePhase>('idle');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const canvasRef = useRef<{ revealAll: () => void }>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");

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
    generateScratchCard,
    processGame,
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
    setGamePhase('idle');
    setStatusMessage("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scratchType]);

  // Quando o jogo termina, processar e mostrar win/loss
  useEffect(() => {
    if (!gameComplete || !scratchType) return;
    const combo = checkWinningCombination();
    const hasWin = !!combo;
    
    setGamePhase('revealing');
    setTimeout(() => {
      processGame(scratchType, hasWin, combo?.winningSymbol);
      
      if (hasWin && combo?.winningSymbol) {
        setGamePhase('success');
        const sym: any = combo.winningSymbol;
        const isMoney = (sym.category === 'dinheiro') || /dinheiro|real/i.test(sym.name || '');
        
        // Aguardar animação dourada por 2.5s
        setTimeout(() => {
          setWinModal({ open: true, type: isMoney ? 'money' : 'item', data: isMoney ? { amount: sym.base_value } : sym });
        }, 2500);
      } else {
        setGamePhase('fail');
        setShowLossBanner(true);
        setTimeout(() => setShowLossBanner(false), 3500);
      }
    }, 300);
  }, [gameComplete, checkWinningCombination, processGame, scratchType]);

  // Handlers
  const handleScratchChange = (newType: ScratchCardType) => {
    if (isTransitioning || newType === currentScratch) return;
    
    setIsTransitioning(true);
    setGamePhase('loading');
    
    // Micro-loading com skeleton
    setTimeout(() => {
      setCurrentScratch(newType);
      navigate(`/raspadinhas/${newType}`, { replace: true });
      setIsTransitioning(false);
      setGamePhase('idle');
    }, 250);
  };

  const handleStartGame = async () => {
    if (!scratchType || gamePhase === 'scratching' || isLoading) return;
    
    setGamePhase('scratching');
    setStatusMessage("Raspando cartela...");
    
    try {
      await generateScratchCard(scratchType);
    } catch (error) {
      setGamePhase('idle');
      setStatusMessage("Erro ao gerar cartela");
    }
  };

  const handleRepeatGame = () => {
    if (isLoading) return;
    
    setGamePhase('loading');
    resetGame();
    setTimeout(() => {
      handleStartGame();
    }, 150);
  };

  const handleRevealAll = () => {
    if (gamePhase !== 'scratching' || !canvasRef.current) return;
    canvasRef.current.revealAll();
  };

  if (!scratchType) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Raspadinha inválida.</p>
        <Button className="mt-4" onClick={() => navigate('/raspadinha')}>Voltar</Button>
      </div>
    );
  }

  const config = scratchCardTypes[scratchType];
  const balanceOk = !!walletData && walletData.balance >= config.price;
  
  // Button state logic
  const getButtonState = () => {
    if (gamePhase === 'scratching') return { disabled: true, label: "Raspando..." };
    if (gamePhase === 'loading') return { disabled: true, label: "Carregando..." };
    if (gamePhase === 'success' || gamePhase === 'fail') return { disabled: false, label: "Jogar de novo" };
    if (!balanceOk) return { disabled: true, label: `Raspar • R$ ${config.price.toFixed(2)}` };
    return { disabled: false, label: `Raspar • R$ ${config.price.toFixed(2)}` };
  };

  const buttonState = getButtonState();

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
        {/* Switch Bar */}
        <div className="max-w-4xl mx-auto">
          <RaspadinhasSwitchBar
            currentScratch={currentScratch}
            onScratchChange={handleScratchChange}
            isLoading={isTransitioning}
          />
        </div>

        {/* Game panel */}
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-4">
              {user ? (
                scratchCard?.symbols ? (
                  <>
                    <ScratchGameCanvas
                      ref={canvasRef}
                      symbols={scratchCard.symbols}
                      onWin={() => {}}
                      onComplete={() => { /* processing handled by effect */ }}
                      gameStarted={true}
                      scratchType={scratchType}
                      className="w-full max-w-[360px]"
                    />
                    
                    {/* Game Controls */}
                    <div className="flex gap-2 w-full max-w-[360px]">
                      <Button 
                        variant="outline" 
                        onClick={handleRevealAll}
                        disabled={gamePhase !== 'scratching'}
                        className="flex-1"
                      >
                        Revelar tudo
                      </Button>
                      <Button 
                        onClick={handleRepeatGame}
                        disabled={buttonState.disabled && gamePhase !== 'success' && gamePhase !== 'fail'}
                        className="flex-1"
                      >
                        Jogar de novo
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center space-y-4">
                    <Button 
                      disabled={buttonState.disabled} 
                      onClick={gamePhase === 'success' || gamePhase === 'fail' ? handleRepeatGame : handleStartGame}
                      className="min-w-[200px]"
                      size="lg"
                    >
                      {buttonState.label}
                    </Button>
                    
                    {!balanceOk && (
                      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <AlertCircle className="w-4 h-4" />
                        <span>Saldo insuficiente</span>
                      </div>
                    )}
                    
                    {walletData && (
                      <p className="text-xs text-muted-foreground">
                        Saldo: R$ {walletData.balance.toFixed(2)}
                      </p>
                    )}
                  </div>
                )
              ) : (
                <div className="text-center space-y-3">
                  <p className="text-sm text-muted-foreground">Faça login para jogar</p>
                  <Link to="/perfil">
                    <Button>Entrar</Button>
                  </Link>
                </div>
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

        {/* Catálogo Compacto */}
        <section className="max-w-6xl mx-auto">
          <CompactScratchCatalog
            currentType={currentScratch}
            onPlayType={handleScratchChange}
          />
        </section>
      </main>

      {/* Minimal win modal */}
      <SimpleScratchWinModal
        isOpen={winModal.open}
        onClose={() => setWinModal((w) => ({ ...w, open: false }))}
        winType={winModal.type}
        winData={winModal.data}
      />

      {/* Loss toast */}
      <ScratchLossToast
        isVisible={showLossBanner}
        onClose={() => setShowLossBanner(false)}
        onPlayAgain={handleRepeatGame}
      />

      {/* Status Bar */}
      <StatusBar 
        status={gamePhase} 
        message={statusMessage}
      />
    </div>
  );
};

export default RaspadinhaPlay;
