import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ScratchGameCanvas from "./ScratchGameCanvas";
import ScratchCardResult from "./ScratchCardResult";
import { ScratchCardType, scratchCardTypes, ScratchSymbol } from "@/types/scratchCard";

const ScratchCardGame = () => {
  const [selectedType, setSelectedType] = useState<ScratchCardType>('silver');
  const [symbols, setSymbols] = useState<ScratchSymbol[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState("Escolha um tipo e gere sua raspadinha");
  const [showResult, setShowResult] = useState(false);
  const [winningSymbol, setWinningSymbol] = useState<string | null>(null);
  const [hasWin, setHasWin] = useState(false);

  const generateScratchCard = async (forcedWin = false) => {
    setIsLoading(true);
    setResultMessage("Carregando raspadinha...");
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-scratch-card', {
        body: { 
          chestType: selectedType,
          forcedWin 
        }
      });

      if (error) throw error;

      setSymbols(data.symbols || []);
      setHasWin(data.hasWin);
      setResultMessage("Raspe para revelar");
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
                  <SelectItem value="basic">Básica - R${scratchCardTypes.basic.price}</SelectItem>
                  <SelectItem value="silver">Prata - R${scratchCardTypes.silver.price}</SelectItem>
                  <SelectItem value="gold">Ouro - R${scratchCardTypes.gold.price}</SelectItem>
                  <SelectItem value="delas">Delas - R${scratchCardTypes.delas.price}</SelectItem>
                  <SelectItem value="diamond">Diamante - R${scratchCardTypes.diamond.price}</SelectItem>
                  <SelectItem value="ruby">Rubi - R${scratchCardTypes.ruby.price}</SelectItem>
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
                />
                
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