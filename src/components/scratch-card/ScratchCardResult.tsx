import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Gift, RotateCcw } from "lucide-react";
import { ScratchSymbol } from "@/types/scratchCard";
import confetti from "canvas-confetti";
import { useEffect } from "react";

interface ScratchCardResultProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayAgain: () => void;
  winningCombination: {
    pattern: number[];
    winningSymbol: ScratchSymbol;
  } | null;
  hasWin: boolean;
}

const ScratchCardResult = ({
  isOpen,
  onClose,
  onPlayAgain,
  winningCombination,
  hasWin,
}: ScratchCardResultProps) => {
  
  useEffect(() => {
    if (isOpen && hasWin && winningCombination) {
      // Disparar confetti
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.8 },
          colors: ['#FFD700', '#FFA500', '#FF6347']
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.8 },
          colors: ['#FFD700', '#FFA500', '#FF6347']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isOpen, hasWin, winningCombination]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 border-gray-400';
      case 'uncommon': return 'bg-green-100 border-green-400';
      case 'rare': return 'bg-blue-100 border-blue-400';
      case 'epic': return 'bg-purple-100 border-purple-400';
      case 'legendary': return 'bg-yellow-100 border-yellow-400';
      case 'special': return 'bg-pink-100 border-pink-400';
      default: return 'bg-gray-100 border-gray-400';
    }
  };

  const getRarityText = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'Comum';
      case 'uncommon': return 'Incomum';
      case 'rare': return 'Raro';
      case 'epic': return 'Épico';
      case 'legendary': return 'Lendário';
      case 'special': return 'Especial';
      default: return rarity;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {hasWin ? "🎉 Parabéns!" : "😔 Que pena!"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {hasWin && winningCombination ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center space-y-4"
            >
              <div className="flex justify-center">
                <Sparkles className="h-16 w-16 text-yellow-500 animate-pulse" />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-green-600 mb-2">
                  Você ganhou!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Você conseguiu 3 símbolos iguais!
                </p>
              </div>

              {/* Prêmio */}
              <div 
                className={`p-4 rounded-lg border-2 ${getRarityColor(winningCombination.winningSymbol.rarity)}`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <img
                    src={winningCombination.winningSymbol.image_url}
                    alt={winningCombination.winningSymbol.name}
                    className="w-16 h-16 object-contain"
                  />
                  <div className="text-center">
                    <p className="font-semibold">{winningCombination.winningSymbol.name}</p>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <Badge variant="outline">
                        {getRarityText(winningCombination.winningSymbol.rarity)}
                      </Badge>
                      <Badge variant="outline">
                        R$ {winningCombination.winningSymbol.base_value.toFixed(2)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center space-y-4"
            >
              <div className="flex justify-center">
                <Gift className="h-16 w-16 text-gray-400" />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Não foi desta vez!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Você não conseguiu 3 símbolos iguais. Tente novamente!
                </p>
              </div>
            </motion.div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={onPlayAgain}
              className="flex-1"
              variant={hasWin ? "default" : "default"}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Jogar Novamente
            </Button>
            <Button onClick={onClose} variant="outline">
              Fechar
            </Button>
          </div>

          {hasWin && (
            <div className="text-xs text-center text-muted-foreground">
              <p>⚠️ Modo de teste - prêmio não será entregue</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScratchCardResult;