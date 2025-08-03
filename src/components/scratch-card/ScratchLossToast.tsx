import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RotateCcw, X } from "lucide-react";

interface ScratchLossToastProps {
  isVisible: boolean;
  onClose: () => void;
  onPlayAgain: () => void;
}

const ScratchLossToast = ({ isVisible, onClose, onPlayAgain }: ScratchLossToastProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Toast content */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            className="relative bg-background border border-border rounded-xl p-6 max-w-sm w-full shadow-xl"
          >
            {/* Botão fechar */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute top-2 right-2 p-1 h-auto"
            >
              <X className="w-4 h-4" />
            </Button>

            <div className="text-center space-y-4">
              {/* Emoji triste */}
              <div className="text-4xl">😔</div>
              
              {/* Mensagem */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  Que pena!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Tente novamente, sua sorte pode estar na próxima!
                </p>
              </div>

              {/* Botão jogar novamente */}
              <Button
                onClick={onPlayAgain}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ScratchLossToast;