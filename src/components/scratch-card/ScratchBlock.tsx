import { ScratchBlockState } from "@/types/scratchCard";
import ScratchCanvas from "./ScratchCanvas";

interface ScratchBlockProps {
  block: ScratchBlockState;
  onScratch: (blockId: number) => void;
  isWinning?: boolean;
  disabled?: boolean;
  backgroundImage?: string;
}

const ScratchBlock = ({ block, onScratch, isWinning = false, disabled = false, backgroundImage }: ScratchBlockProps) => {
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
      backgroundImage={backgroundImage}
    />
  );
};

export default ScratchBlock;