import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import ScratchBlock from "./ScratchBlock";
import ScratchCardControls from "./ScratchCardControls";
import ScratchCardResult from "./ScratchCardResult";
import { useScratchCard } from "@/hooks/useScratchCard";
import { ScratchCardType } from "@/types/scratchCard";

const ScratchCardGame = () => {
  const [selectedType, setSelectedType] = useState<ScratchCardType>('silver');
  const [showResult, setShowResult] = useState(false);
  const {
    generateScratchCard,
    scratchBlock,
    scratchAll,
    checkWinningCombination,
    resetGame,
    scratchCard,
    blocks,
    isLoading,
    gameComplete,
  } = useScratchCard();

  const winningCombination = checkWinningCombination();

  // Mostrar resultado quando o jogo estiver completo
  useEffect(() => {
    if (gameComplete && scratchCard) {
      setTimeout(() => {
        setShowResult(true);
      }, 500);
    }
  }, [gameComplete, scratchCard]);

  const handleGenerate = async (forcedWin = false) => {
    setShowResult(false);
    await generateScratchCard(selectedType, forcedWin);
  };

  const handleReset = () => {
    setShowResult(false);
    resetGame();
  };

  const handlePlayAgain = () => {
    setShowResult(false);
    handleGenerate();
  };

  const handleCloseResult = () => {
    setShowResult(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">🎫 Raspadinha BETA</h1>
          <p className="text-muted-foreground">
            Raspe 3 símbolos iguais para ganhar! Sistema em desenvolvimento.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Controles */}
          <div className="lg:col-span-1">
            <ScratchCardControls
              selectedType={selectedType}
              onTypeChange={setSelectedType}
              onGenerate={handleGenerate}
              onReset={handleReset}
              onRevealAll={scratchAll}
              isLoading={isLoading}
              hasActiveGame={!!scratchCard}
            />
          </div>

          {/* Área do jogo */}
          <div className="lg:col-span-2">
            {scratchCard ? (
              <div className="space-y-6">
                {/* Grid da raspadinha */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-card rounded-xl p-6 border shadow-lg"
                >
                  {/* Grid 3x3 melhorado para raspadinha */}
                  <div className="grid grid-cols-3 gap-4 max-w-md mx-auto bg-muted/10 p-6 rounded-xl">
                    {blocks.map((block, index) => (
                      <motion.div
                        key={block.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={cn(
                          "relative",
                          winningCombination?.pattern.includes(index) && 
                          "ring-2 ring-yellow-400 ring-offset-2 ring-offset-background"
                        )}
                      >
                        <ScratchBlock
                          block={block}
                          onScratch={scratchBlock}
                          isWinning={
                            winningCombination?.pattern.includes(index) || false
                          }
                          disabled={gameComplete}
                        />
                      </motion.div>
                    ))}
                  </div>

                  {/* Indicador de progresso */}
                  <div className="mt-6 text-center">
                    <div className="text-sm text-muted-foreground mb-2">
                      Blocos raspados: {blocks.filter(b => b.isScratched).length}/9
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <motion.div
                        className="bg-primary h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(blocks.filter(b => b.isScratched).length / 9) * 100}%`
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Informações da carta */}
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <h3 className="font-semibold mb-2">
                    {scratchCard.chestType === 'silver' && '🥈 Raspadinha de Prata'}
                    {scratchCard.chestType === 'gold' && '🥇 Raspadinha de Ouro'}
                    {scratchCard.chestType === 'delas' && '💄 Raspadinha Delas'}
                    {scratchCard.chestType === 'diamond' && '💎 Raspadinha de Diamante'}
                    {scratchCard.chestType === 'ruby' && '🔴 Raspadinha de Rubi'}
                    {scratchCard.chestType === 'premium' && '⭐ Raspadinha Premium'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Clique nos blocos para revelar os símbolos
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-xl p-12 border shadow-lg text-center">
                <div className="space-y-4">
                  <div className="text-6xl">🎫</div>
                  <h3 className="text-xl font-semibold">Pronto para jogar?</h3>
                  <p className="text-muted-foreground">
                    Selecione um tipo de raspadinha e clique em "Gerar" para começar!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal de resultado */}
        <ScratchCardResult
          isOpen={showResult}
          onClose={handleCloseResult}
          onPlayAgain={handlePlayAgain}
          winningCombination={winningCombination}
          hasWin={scratchCard?.hasWin || false}
        />
      </div>
    </div>
  );
};

export default ScratchCardGame;