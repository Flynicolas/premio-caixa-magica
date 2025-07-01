
import { Prize } from '@/data/chestData';

export interface SpinCarouselProps {
  isOpen: boolean;
  onClose: () => void;
  prizes: Prize[];
  onPrizeWon: (prize: Prize) => void;
  chestName: string;
}

export type SpinPhase = 'ready' | 'spinning' | 'slowing' | 'stopped' | 'showing-result';

export interface SpinCarouselHeaderProps {
  chestName: string;
  spinPhase: SpinPhase;
  selectedPrize: Prize | null;
}

export interface CarouselContainerProps {
  prizes: Prize[];
  isSpinning: boolean;
  spinPhase: SpinPhase;
  selectedPrize: Prize | null;
  carouselRef: React.RefObject<HTMLDivElement>;
}

export interface SpinControlsProps {
  isSpinning: boolean;
  selectedPrize: Prize | null;
  spinPhase: SpinPhase;
  onSpin: () => void;
  onClose: () => void;
}
