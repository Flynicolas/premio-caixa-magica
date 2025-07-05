
import { DatabaseItem } from '@/types/database';

export interface SpinCarouselProps {
  isOpen: boolean;
  onClose: () => void;
  prizes: DatabaseItem[];
  onPrizeWon: (prize: DatabaseItem) => void;
  chestName: string;
}

export type SpinPhase = 'ready' | 'spinning' | 'slowing' | 'stopped' | 'showing-result';

export interface SpinCarouselHeaderProps {
  chestName: string;
  spinPhase: SpinPhase;
  selectedPrize: DatabaseItem | null;
}

export interface CarouselContainerProps {
  prizes: DatabaseItem[];
  isSpinning: boolean;
  spinPhase: SpinPhase;
  selectedPrize: DatabaseItem | null;
  carouselRef: React.RefObject<HTMLDivElement>;
}

export interface SpinControlsProps {
  isSpinning: boolean;
  selectedPrize: DatabaseItem | null;
  spinPhase: SpinPhase;
  onSpin: () => void;
  onClose: () => void;
}
