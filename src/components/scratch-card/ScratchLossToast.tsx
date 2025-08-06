
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw } from 'lucide-react';

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
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-80 max-w-[90vw]"
        >
          <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white p-4 rounded-lg shadow-xl border border-red-400/30">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg">Que pena!</h3>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-white/90 mb-4 text-sm">
              Não foi desta vez, mas não desista! Tente novamente.
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors backdrop-blur-sm border border-white/20"
              >
                Fechar
              </button>
              <button
                onClick={onPlayAgain}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-200 font-medium shadow-lg"
              >
                <RotateCcw className="w-4 h-4" />
                Tentar Novamente
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScratchLossToast;
