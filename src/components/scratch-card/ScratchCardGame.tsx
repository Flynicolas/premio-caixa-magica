
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import ScratchGameCanvas from "./ScratchGameCanvas";
import UnifiedWinModal from "./UnifiedWinModal";
import ScratchLossToast from "./ScratchLossToast";
import { ScratchCardType, scratchCardTypes, ScratchSymbol } from "@/types/scratchCard";
import { useWallet } from "@/hooks/useWalletProvider";

const ScratchCardGame = () => {
  const [selectedType, setSelectedType] = useState<ScratchCardType>('sorte');
  const [symbols, setSymbols] = useState<ScratchSymbol[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState("Escolha um tipo e gere sua raspadinha");
  const [showWinModal, setShowWinModal] = useState(false);
  const [showLossToast, setShowLossToast] = useState(false);
  const [winningItem, setWinningItem] = useState<ScratchSymbol | null>(null);
  const [hasWin, setHasWin] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gamePhase, setGamePhase] = useState<'ready' | 'playing' | 'complete'>('ready');
  const canvasRef = useRef<{ revealAll: () => void }>(null);
  const { refetchWallet } = useWallet();

  const generateScratchCard = async (forcedWin = false) => {
    console.log('🎯 Generating scratch card, type:', selectedType, 'forcedWin:', forcedWin);
    setIsLoading(true);
    setResultMessage("Carregando raspadinha...");
    setGameStarted(false);
    setShowLossToast(false);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-scratch-card-optimized', {
        body: { 
          scratchType: selectedType,
          forcedWin 
        }
      });

      if (error) throw error;

      console.log('🎯 Scratch card data received:', data);
      setSymbols(data.symbols || []);
      setHasWin(data.hasWin);
      setWinningItem(data.winningItem);
      setResultMessage("Raspe / toque para começar");
      setGamePhase('ready');

    } catch (error: any) {
      console.error('Erro ao gerar raspadinha:', error);
      setResultMessage("Erro ao carregar. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleScratchStart = async () => {
    if (!gameStarted && symbols.length > 0) {
      setGameStarted(true);
      setGamePhase('playing');
      setResultMessage("Raspe para revelar os símbolos");
      
      // Processar pagamento quando o jogo inicia
      try {
        const { data, error } = await supabase.rpc('process_scratch_card_game', {
          p_user_id: (await supabase.auth.getUser()).data.user?.id,
          p_scratch_type: selectedType,
          p_game_price: scratchCardTypes[selectedType].price,
          p_symbols: JSON.stringify(symbols),
          p_has_win: hasWin,
          p_winning_item_id: hasWin && winningItem ? winningItem.id : null,
          p_winning_amount: hasWin && winningItem ? winningItem.base_value : 0
        });

        if (error) throw error;
        
        // Atualizar carteira
        await refetchWallet();
        
      } catch (error) {
        console.error('Erro ao processar jogo:', error);
      }
    }
  };

  const handleRevealAll = () => {
    if (canvasRef.current?.revealAll && gamePhase === 'playing') {
      canvasRef.current.revealAll();
    }
  };

  const handleWin = (symbolName: string) => {
    setGamePhase('complete');
    setResultMessage("🎉 Você ganhou!");
    
    // Encontrar o item vencedor
    const winner = symbols.find(s => s.name === symbolName && s.isWinning);
    if (winner) {
      setWinningItem(winner);
      setTimeout(() => setShowWinModal(true), 800);
    }
  };

  const handleComplete = () => {
    setGamePhase('complete');
    setResultMessage("Não foi desta vez!");
    
    // Mostrar toast de derrota de forma discreta
    setTimeout(() => {
      setShowLossToast(true);
      
      // Esconder toast após 3 segundos
      setTimeout(() => setShowLossToast(false), 3000);
    }, 500);
  };

  const handlePlayAgain = () => {
    setShowWinModal(false);
    setShowLossToast(false);
    setGameStarted(false);
    setGamePhase('ready');
    generateScratchCard();
  };

  const handleCloseWinModal = () => {
    setShowWinModal(false);
  };

  // Função para determinar o texto do botão baseado na fase
  const getButtonText = () => {
    if (gamePhase === 'ready') {
      return `Começar Jogo: R$ ${scratchCardTypes[selectedType].price.toFixed(2)}`;
    } else if (gamePhase === 'playing') {
      return 'Revelar Tudo';
    } else {
      return `Jogar Novamente: R$ ${scratchCardTypes[selectedType].price.toFixed(2)}`;
    }
  };

  const getButtonAction = () => {
    if (gamePhase === 'ready') {
      return handleScratchStart;
    } else if (gamePhase === 'playing') {
      return handleRevealAll;
    } else {
      return handlePlayAgain;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">🎫 Raspadinha dos Baús</CardTitle>
            <p className="text-muted-foreground text-sm">
              Raspe para revelar 3 símbolos iguais e ganhe!
            </p>
          </CardHeader>
        </Card>

        {/* Controles */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Raspadinha:</label>
              <Select 
                value={selectedType} 
                onValueChange={(value: ScratchCardType) => setSelectedType(value)}
                disabled={gamePhase === 'playing'}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sorte">Sorte - R${scratchCardTypes.sorte.price}</SelectItem>
                  <SelectItem value="dupla">Dupla - R${scratchCardTypes.dupla.price}</SelectItem>
                  <SelectItem value="ouro">Ouro - R${scratchCardTypes.ouro.price}</SelectItem>
                  <SelectItem value="diamante">Diamante - R${scratchCardTypes.diamante.price}</SelectItem>
                  <SelectItem value="premium">Premium - R${scratchCardTypes.premium.price}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {gamePhase === 'ready' && (
              <div className="flex gap-2">
                <Button 
                  onClick={() => generateScratchCard()} 
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? "Gerando..." : "Gerar Raspadinha"}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => generateScratchCard(true)}
                  disabled={isLoading}
                  className="whitespace-nowrap"
                >
                  Teste (Vitória)
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Área do Jogo */}
        <Card className="relative">
          <CardContent className="p-6">
            {symbols.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                {/* Toast de derrota discreto */}
                <ScratchLossToast 
                  isVisible={showLossToast}
                  message="Que pena! Tente novamente com sorte."
                />

                <ScratchGameCanvas
                  symbols={symbols}
                  onWin={handleWin}
                  onComplete={handleComplete}
                  onScratchStart={handleScratchStart}
                  gameStarted={gameStarted}
                  scratchType={selectedType}
                  ref={canvasRef}
                />
                
                {/* Botão dinâmico unificado */}
                {symbols.length > 0 && (
                  <div className="mt-4">
                    <Button 
                      onClick={getButtonAction()}
                      className="w-full"
                      disabled={isLoading}
                    >
                      {getButtonText()}
                    </Button>
                  </div>
                )}
                
                <div className="text-center">
                  <p className={`text-sm font-medium ${
                    winningItem ? "text-yellow-500" : "text-muted-foreground"
                  }`}>
                    {resultMessage}
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <div className="text-6xl">🎫</div>
                <h3 className="text-lg font-semibold">Pronto para jogar?</h3>
                <p className="text-muted-foreground text-sm">
                  Selecione um tipo de raspadinha e clique em "Gerar" para começar!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal Unificado de Vitória */}
        <UnifiedWinModal
          isOpen={showWinModal}
          onClose={handleCloseWinModal}
          winningItem={winningItem}
          onPlayAgain={handlePlayAgain}
        />
      </div>
    </div>
  );
};

export default ScratchCardGame;
