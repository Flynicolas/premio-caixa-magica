import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ScratchBlockState } from "@/types/scratchCard";

interface ScratchBlockProps {
  block: ScratchBlockState;
  onScratch: (blockId: number) => void;
  isWinning?: boolean;
  disabled?: boolean;
}

const ScratchBlock = ({ block, onScratch, isWinning = false, disabled = false }: ScratchBlockProps) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-400 bg-gray-100';
      case 'uncommon': return 'border-green-400 bg-green-100';
      case 'rare': return 'border-blue-400 bg-blue-100';
      case 'epic': return 'border-purple-400 bg-purple-100';
      case 'legendary': return 'border-yellow-400 bg-yellow-100';
      case 'special': return 'border-pink-400 bg-pink-100';
      default: return 'border-gray-400 bg-gray-100';
    }
  };

  return (
    <motion.div
      className={cn(
        "relative w-24 h-24 sm:w-28 sm:h-28 rounded-lg border-2 cursor-pointer overflow-hidden",
        "transition-all duration-300 hover:scale-105",
        isWinning && block.isScratched && "ring-4 ring-yellow-400 animate-pulse",
        disabled && "cursor-not-allowed opacity-50"
      )}
      onClick={() => !disabled && !block.isScratched && onScratch(block.id)}
      whileHover={!disabled && !block.isScratched ? { scale: 1.05 } : {}}
      whileTap={!disabled && !block.isScratched ? { scale: 0.95 } : {}}
    >
      {/* Conteúdo do símbolo (sempre presente, mas oculto) */}
      {block.symbol && (
        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center p-1",
            getRarityColor(block.symbol.rarity),
            !block.isScratched && "opacity-0"
          )}
        >
          <img
            src={block.symbol.image_url}
            alt={block.symbol.name}
            className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
          />
          <span className="text-xs font-medium text-center mt-1 leading-tight">
            {block.symbol.name}
          </span>
        </div>
      )}

      {/* Cobertura da raspadinha */}
      <motion.div
        className={cn(
          "absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-500",
          "flex items-center justify-center text-white font-bold text-sm",
          "border-2 border-gray-400 rounded-lg"
        )}
        initial={{ scale: 1, opacity: 1 }}
        animate={{
          scale: block.isScratched ? 0 : 1,
          opacity: block.isScratched ? 0 : 1
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <span className="select-none">?</span>
      </motion.div>

      {/* Efeito de brilho quando vencedor */}
      {isWinning && block.isScratched && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-300/30 to-transparent"
          animate={{
            x: ['-100%', '100%']
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      )}
    </motion.div>
  );
};

export default ScratchBlock;