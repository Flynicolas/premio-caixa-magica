
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw } from 'lucide-react';

interface ScratchLossToastProps {
  isVisible: boolean;
  onClose: () => void;
  onPlayAgain: () => void;
}

const ScratchLossToast = ({ isVisible, onClose, onPlayAgain }: ScratchLossToastProps) => {
  // Mensagens discretas A/B
  const messages = [
    "Não foi desta vez 😕",
    "Quase lá 😔 — tentar novamente?",
    "Continue tentando, a sorte gira 😉"
  ];
  
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 w-72 max-w-[90vw]"
        >
          {/* Versão discreta e minimalista */}
          <div className="bg-muted/90 backdrop-blur-sm text-muted-foreground p-3 rounded-lg shadow-lg border border-border/50">
            {/* Mensagem discreta com emoji */}
            <p className="text-sm text-center mb-3 font-medium">
              {randomMessage}
            </p>
            
            {/* Botão principal em destaque */}
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 px-3 py-2 text-xs bg-background/50 text-muted-foreground rounded-md hover:bg-background/80 transition-colors"
              >
                Fechar
              </button>
              <button
                onClick={onPlayAgain}
                className="flex-2 flex items-center justify-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all duration-200 font-bold shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                autoFocus
              >
                <RotateCcw className="w-4 h-4" />
                Jogar de novo
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScratchLossToast;
