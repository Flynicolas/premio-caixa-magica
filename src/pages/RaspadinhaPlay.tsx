import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWalletProvider";
import { useScratchCard } from "@/hooks/useScratchCard";
import ScratchGameCanvas from "@/components/scratch-card/ScratchGameCanvas";
import SimpleScratchWinModal from "@/components/scratch-card/SimpleScratchWinModal";
import { scratchCardTypes, ScratchCardType } from "@/types/scratchCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PrizeItem {
  id: string;
  name: string;
  image_url: string | null;
  rarity: string;
  base_value: number;
  probability_weight: number;
}

const RaspadinhaPlay = () => {
  const { tipo } = useParams<{ tipo: ScratchCardType }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { walletData } = useWallet();
  const [items, setItems] = useState<PrizeItem[]>([]);
  const [winModal, setWinModal] = useState<{ open: boolean; type: "item" | "money"; data: any }>(
    { open: false, type: "item", data: null }
  );
const canvasRef = useRef<{ revealAll: () => void }>(null);
const startedRef = useRef<string | null>(null);

const scratchType = useMemo(() => {
  const key = (tipo as ScratchCardType) || "sorte";
  return key in scratchCardTypes ? key : null;
}, [tipo]);

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

  // Load items with weight > 0 for visual list
  useEffect(() => {
    if (!scratchType) return;
    const load = async () => {
      const { data: probs, error: pErr } = await supabase
        .from('scratch_card_probabilities')
        .select('item_id, probability_weight')
        .eq('scratch_type', scratchType)
        .eq('is_active', true);
      if (pErr) return;
      const valid = (probs || []).filter(p => (p as any).probability_weight > 0);
      if (valid.length === 0) { setItems([]); return; }
      const ids = valid.map((p: any) => p.item_id);
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
        probability_weight: valid.find(v => v.item_id === i.id)?.probability_weight || 1,
      })).sort((a,b)=> b.base_value - a.base_value);
      setItems(merged);
    };
    load();
  }, [scratchType]);

  // Initialize game when page opens
useEffect(() => {
  if (!scratchType) return;
  if (!user) return; // require login to auto-start
  if (startedRef.current === scratchType && scratchCard) return; // avoid re-init loops
  startedRef.current = scratchType;
  resetGame();
  generateScratchCard(scratchType);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [scratchType, user]);

  // When game completes, process and show minimal win modal
  useEffect(() => {
    if (!gameComplete || !scratchType) return;
    const combo = checkWinningCombination();
    const hasWin = !!combo;
    processGame(scratchType, hasWin, combo?.winningSymbol);
    if (hasWin && combo?.winningSymbol) {
      const sym: any = combo.winningSymbol;
      const isMoney = (sym.category === 'dinheiro') || /dinheiro|real/i.test(sym.name || '');
      setWinModal({ open: true, type: isMoney ? 'money' : 'item', data: isMoney ? { amount: sym.base_value } : sym });
    }
  }, [gameComplete, checkWinningCombination, processGame, scratchType]);

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

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 py-6 text-center">
          <h1 className="text-3xl font-bold text-foreground">{config.name}</h1>
          <p className="text-muted-foreground mt-1">R$ {config.price.toFixed(2)}</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-10">
        {/* Game panel */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle>Raspe para revelar</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {user ? (
              scratchCard?.symbols ? (
                <ScratchGameCanvas
                  ref={canvasRef}
                  symbols={scratchCard.symbols}
                  onWin={() => {}}
                  onComplete={() => { /* processing handled by effect */ }}
                  gameStarted={true}
                  scratchType={scratchType}
                  className="w-full max-w-[360px]"
                />
              ) : (
                <Button disabled={isLoading || !balanceOk} onClick={() => generateScratchCard(scratchType)}>
                  {isLoading ? 'Carregando...' : `Jogar: R$ ${config.price.toFixed(2)}`}
                </Button>
              )
            ) : (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-3">Faça login para jogar</p>
                <Link to="/perfil">
                  <Button>Entrar</Button>
                </Link>
              </div>
            )}

            {scratchCard?.symbols && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => canvasRef.current?.revealAll()}>Revelar tudo</Button>
                <Button onClick={() => { resetGame(); generateScratchCard(scratchType); }}>Jogar novamente</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mini como funciona */}
        <section className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Como funciona</h2>
          <p className="text-sm text-muted-foreground">Raspe a cartela e encontre 3 símbolos iguais para ganhar. Itens com peso zero não são premiáveis e servem apenas como preenchimento visual.</p>
        </section>

        {/* Prize list below game */}
        <section className="max-w-5xl mx-auto">
          <h2 className="text-xl font-semibold text-foreground mb-4">Prêmios desta raspadinha</h2>
          {items.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Gift className="w-8 h-8 mx-auto mb-2" />
              <p>Nenhum prêmio configurado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {items.map((it) => (
                <Card key={it.id} className="overflow-hidden">
                  <CardContent className="p-3 text-center">
                    {it.image_url ? (
                      <img src={it.image_url} alt={it.name} className="w-16 h-16 object-contain mx-auto" />
                    ) : (
                      <div className="w-16 h-16 bg-muted rounded mx-auto" />
                    )}
                    <p className="mt-2 text-sm font-medium truncate" title={it.name}>{it.name}</p>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <Badge variant="outline" className="capitalize">{it.rarity}</Badge>
                      <Badge variant="outline">R$ {it.base_value.toFixed(2)}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Shortcuts to other scratch types */}
        <section className="max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold text-foreground mb-3">Outras raspadinhas</h2>
          <div className="flex flex-wrap gap-2">
            {Object.keys(scratchCardTypes)
              .filter((k) => k !== scratchType)
              .map((k) => (
                <Link key={k} to={`/raspadinhas/${k}`} className="inline-block">
                  <Badge variant="secondary" className="cursor-pointer">{scratchCardTypes[k as ScratchCardType].name}</Badge>
                </Link>
              ))}
          </div>
        </section>
      </main>

      {/* Minimal win modal */}
      <SimpleScratchWinModal
        isOpen={winModal.open}
        onClose={() => setWinModal((w) => ({ ...w, open: false }))}
        winType={winModal.type}
        winData={winModal.data}
      />
    </div>
  );
};

export default RaspadinhaPlay;
