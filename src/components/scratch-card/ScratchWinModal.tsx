import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Coins, Package, RotateCcw, Eye } from "lucide-react";
import { ScratchSymbol } from "@/types/scratchCard";
import confetti from "canvas-confetti";
import { useEffect } from "react";

interface ScratchWinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayAgain: () => void;
  winType: 'item' | 'money';
  winData: any;
}

const ScratchWinModal = ({
  isOpen,
  onClose,
  onPlayAgain,
  winType,
  winData,
}: ScratchWinModalProps) => {
  
  useEffect(() => {
    if (isOpen) {
      // Disparar confetti
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.8 },
          colors: ['#FFD700', '#FFA500', '#FF6347']
        });
        confetti({
          particleCount: 3,
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
  }, [isOpen]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-secondary border-border';
      case 'uncommon': return 'bg-green-100 dark:bg-green-900/20 border-green-400';
      case 'rare': return 'bg-blue-100 dark:bg-blue-900/20 border-blue-400';
      case 'epic': return 'bg-purple-100 dark:bg-purple-900/20 border-purple-400';
      case 'legendary': return 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-400';
      case 'special': return 'bg-pink-100 dark:bg-pink-900/20 border-pink-400';
      default: return 'bg-secondary border-border';
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
            🎉 Parabéns! Você ganhou!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center space-y-4"
          >
            <div className="flex justify-center">
              {winType === 'money' ? (
                <div className="relative">
                  <Coins className="h-16 w-16 text-yellow-500 animate-bounce" />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute -top-1 -right-1"
                  >
                    <Sparkles className="h-6 w-6 text-yellow-400" />
                  </motion.div>
                </div>
              ) : (
                <Package className="h-16 w-16 text-primary animate-pulse" />
              )}
            </div>

            {winType === 'money' ? (
              // Modal para prêmio em dinheiro
              <div>
                <h3 className="text-xl font-bold text-green-600 mb-2">
                  + R$ {winData.amount.toFixed(2)}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  O valor foi adicionado à sua carteira!
                </p>
                <div className="p-4 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    💰 Saldo atualizado com sucesso!
                  </p>
                </div>
              </div>
            ) : (
              // Modal para prêmio item
              <div>
                <h3 className="text-lg font-semibold text-primary mb-2">
                  Novo item ganho!
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Você conseguiu 3 símbolos iguais!
                </p>

                {/* Item ganho */}
                <div 
                  className={`p-4 rounded-lg border-2 ${getRarityColor(winData.rarity)}`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <img
                      src={winData.image_url}
                      alt={winData.name}
                      className="w-16 h-16 object-contain"
                    />
                    <div className="text-center">
                      <p className="font-semibold">{winData.name}</p>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <Badge variant="outline">
                          {getRarityText(winData.rarity)}
                        </Badge>
                        <Badge variant="outline">
                          R$ {winData.base_value.toFixed(2)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Atalho para inventário */}
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Item adicionado ao seu inventário
                    </p>
                    <Button size="sm" variant="outline" className="text-xs">
                      <Eye className="w-3 h-3 mr-1" />
                      Ver Inventário
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          <div className="flex gap-2">
            <Button
              onClick={onPlayAgain}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Jogar Novamente
            </Button>
            <Button onClick={onClose} variant="outline">
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScratchWinModal;