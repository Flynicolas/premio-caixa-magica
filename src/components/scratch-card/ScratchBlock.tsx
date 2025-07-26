import { ScratchBlockState } from "@/types/scratchCard";
import ScratchCanvas from "./ScratchCanvas";

interface ScratchBlockProps {
  block: ScratchBlockState;
  onScratch: (blockId: number) => void;
  isWinning?: boolean;
  disabled?: boolean;
}

const ScratchBlock = ({ block, onScratch, isWinning = false, disabled = false }: ScratchBlockProps) => {
  const handleScratch = () => {
    if (!disabled && !block.isScratched) {
      onScratch(block.id);
    }
  };

  const handleComplete = () => {
    if (!block.isScratched) {
      onScratch(block.id);
    }
  };

  return (
    <ScratchCanvas
      symbol={block.symbol}
      isRevealed={block.isScratched}
      onScratch={handleScratch}
      onComplete={handleComplete}
      isWinning={isWinning}
      disabled={disabled}
    />
  );
};

export default ScratchBlock;