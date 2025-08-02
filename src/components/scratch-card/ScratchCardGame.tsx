import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ScratchGameCanvas from "./ScratchGameCanvas";
import ScratchCardResult from "./ScratchCardResult";
import { ScratchCardType, scratchCardTypes, ScratchSymbol } from "@/types/scratchCard";

const ScratchCardGame = () => {
  console.log('🎯 ScratchCardGame component mounted');
  
  const [selectedType, setSelectedType] = useState<ScratchCardType>('sorte');
  const [symbols, setSymbols] = useState<ScratchSymbol[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState("Escolha um tipo e gere sua raspadinha");
  const [showResult, setShowResult] = useState(false);
  const [winningSymbol, setWinningSymbol] = useState<string | null>(null);
  const [hasWin, setHasWin] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const canvasRef = useRef<{ revealAll: () => void }>(null);

  console.log('🎯 ScratchCardGame render - symbols.length:', symbols.length);

  const generateScratchCard = async (forcedWin = false) => {
    console.log('🎯 Generating scratch card, type:', selectedType, 'forcedWin:', forcedWin);
    setIsLoading(true);
    setResultMessage("Carregando raspadinha...");
    setGameStarted(false);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-scratch-card', {
        body: { 
          scratchType: selectedType,
          forcedWin 
        }
      });

      if (error) throw error;

      console.log('🎯 Scratch card data received:', data);
      setSymbols(data.symbols || []);
      setHasWin(data.hasWin);
      setResultMessage("Raspe / toque para começar");
      setShowResult(false);
      setWinningSymbol(null);

    } catch (error: any) {
      console.error('Erro ao gerar raspadinha:', error);
      setResultMessage("Erro ao carregar. Tente novamente.");
      toast.error("Erro ao gerar raspadinha");
    } finally {
      setIsLoading(false);
    }
  };

  const handleScratchStart = async () => {
    if (!gameStarted && symbols.length > 0) {
      setGameStarted(true);
      setResultMessage("Raspe para revelar");
      
      // Aqui é onde debitamos o dinheiro - quando o jogo realmente começa
      try {
        await supabase.functions.invoke('debit-scratch-card-cost', {
          body: { 
            scratchType: selectedType,
            symbols: symbols // Garante que se fechar a janela, o prêmio será processado
          }
        });
      } catch (error) {
        console.error('Erro ao debitar custo:', error);
        // Não bloqueamos o jogo se o débito falhar, mas logamos
      }
    }
  };

  const handleRevealAll = () => {
    if (canvasRef.current?.revealAll) {
      canvasRef.current.revealAll();
    }
  };

  const handleWin = (symbol: string) => {
    setWinningSymbol(symbol);
    setResultMessage(`🎉 Você ganhou com ${symbol}!`);
    setTimeout(() => setShowResult(true), 1000);
  };

  const handleComplete = () => {
    setResultMessage("Tente novamente!");
    setTimeout(() => setShowResult(true), 500);
  };

  const handlePlayAgain = () => {
    setShowResult(false);
    setGameStarted(false);
    generateScratchCard();
  };

  const handleCloseResult = () => {
    setShowResult(false);
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
              <Select value={selectedType} onValueChange={(value: ScratchCardType) => setSelectedType(value)}>
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
          </CardContent>
        </Card>

        {/* Área do Jogo */}
        <Card>
          <CardContent className="p-6">
            {symbols.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <ScratchGameCanvas
                  symbols={symbols}
                  onWin={handleWin}
                  onComplete={handleComplete}
                  onScratchStart={handleScratchStart}
                  gameStarted={gameStarted}
                  ref={canvasRef}
                />
                
                {/* Botões de controle */}
                {symbols.length > 0 && (
                  <div className="flex gap-2 mt-4">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={!gameStarted}
                          className="flex-1"
                        >
                          Revelar Tudo
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Revelar todos os símbolos?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja revelar automaticamente todos os símbolos? 
                            Isso irá finalizar o jogo imediatamente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={handleRevealAll}>
                            Sim, revelar tudo
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setShowResult(false);
                        setGameStarted(false);
                        generateScratchCard();
                      }}
                      className="flex-1"
                    >
                      Nova Raspadinha
                    </Button>
                  </div>
                )}
                
                <div className="text-center">
                  <p className={`text-sm font-medium ${
                    winningSymbol ? "text-yellow-500" : "text-muted-foreground"
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

        {/* Modal de Resultado */}
        <ScratchCardResult
          isOpen={showResult}
          onClose={handleCloseResult}
          onPlayAgain={handlePlayAgain}
          winningCombination={winningSymbol ? { 
            pattern: [], 
            winningSymbol: symbols.find(s => s.name === winningSymbol) || symbols[0] 
          } : null}
          hasWin={hasWin}
        />
      </div>
    </div>
  );
};

export default ScratchCardGame;