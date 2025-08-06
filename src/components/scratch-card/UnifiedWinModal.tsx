
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { ScratchSymbol } from "@/types/scratchCard";

interface UnifiedWinModalProps {
  isOpen: boolean;
  onClose: () => void;
  winningItem: ScratchSymbol | null;
  onPlayAgain: () => void;
}

const UnifiedWinModal = ({ isOpen, onClose, winningItem, onPlayAgain }: UnifiedWinModalProps) => {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen && winningItem) {
      setShowConfetti(true);
      
      // Parar confetti após 3 segundos
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, winningItem]);

  if (!winningItem) return null;

  const isMoneyPrize = winningItem.category === 'dinheiro';

  const handleViewPrize = () => {
    onClose();
    if (isMoneyPrize) {
      navigate('/carteira');
    } else {
      navigate('/perfil');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-yellow-500/30 text-white">
        {/* Confetti Effect */}
        {showConfetti && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 bg-yellow-400 rounded"
                initial={{
                  x: Math.random() * 400,
                  y: -20,
                  rotate: 0,
                  opacity: 1
                }}
                animate={{
                  x: Math.random() * 400,
                  y: 600,
                  rotate: 360,
                  opacity: 0
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>
        )}

        <div className="text-center space-y-6 p-6">
          {/* Header de Vitória */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 10 }}
            className="space-y-2"
          >
            <div className="text-6xl animate-bounce">🎉</div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              PARABÉNS!
            </h2>
            <p className="text-slate-300">Você ganhou um prêmio incrível!</p>
          </motion.div>

          {/* Item Vencedor */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-800/50 rounded-xl p-6 border border-yellow-500/20"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 p-1">
                <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center">
                  <img
                    src={winningItem.image_url}
                    alt={winningItem.name}
                    className="w-12 h-12 object-contain"
                  />
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-1">
                  {winningItem.name}
                </h3>
                <div className="flex items-center justify-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    winningItem.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-400' :
                    winningItem.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400' :
                    winningItem.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400' :
                    winningItem.rarity === 'uncommon' ? 'bg-green-500/20 text-green-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {winningItem.rarity}
                  </span>
                </div>
                
                {isMoneyPrize && (
                  <div className="mt-2 text-2xl font-bold text-green-400">
                    R$ {winningItem.base_value.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Mensagem personalizada */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <p className="text-slate-300 text-sm">
              {isMoneyPrize 
                ? "🎊 Saldo atualizado em sua carteira!"
                : "🎁 Prêmio adicionado ao seu inventário!"
              }
            </p>
          </motion.div>

          {/* Botões de Ação */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex gap-3"
          >
            <Button
              onClick={handleViewPrize}
              className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-slate-900 font-bold"
            >
              {isMoneyPrize ? "Ver Carteira 💰" : "Ver Inventário 🎁"}
            </Button>
            
            <Button
              onClick={onPlayAgain}
              variant="outline"
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Jogar Novamente 🎲
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UnifiedWinModal;
