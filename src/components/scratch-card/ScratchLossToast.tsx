
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface ScratchLossToastProps {
  isVisible: boolean;
  onClose: () => void;
  onPlayAgain: () => void;
}

const ScratchLossToast = ({ isVisible, onClose, onPlayAgain }: ScratchLossToastProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative mx-auto max-w-sm mt-4 bg-card border border-border rounded-lg p-4 shadow-md"
        >
          <div className="text-center space-y-3">
            {/* CORREÇÃO 2.1: Remover animações piscantes excessivas */}
            <div className="text-2xl opacity-70">😔</div>
            
            {/* Mensagem mais discreta */}
            <div className="space-y-2">
              <h3 className="text-base font-medium text-muted-foreground">
                Que pena!
              </h3>
              <p className="text-sm text-muted-foreground/80">
                Tente novamente, sua sorte pode estar na próxima!
              </p>
            </div>

            {/* Botões mais discretos */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="flex-1 text-xs"
              >
                Fechar
              </Button>
              <Button
                onClick={onPlayAgain}
                size="sm"
                className="flex-1 text-xs bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Tentar Novamente
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScratchLossToast;
