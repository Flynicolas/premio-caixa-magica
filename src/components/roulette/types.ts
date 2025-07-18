export interface SpinItem {
  id: string;
  name: string;
  image_url?: string | null;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'special';
}

export interface RouletteData {
  rouletteSlots: SpinItem[];
  winnerItem: SpinItem | null;
  centerIndex: number;
  totalSlots: number;
}

export interface SpinRouletteWheelProps {
  rouletteData: RouletteData | null;
  onSpinComplete?: () => void;
  isSpinning?: boolean;
  className?: string;
  chestType?: string;
}

export interface ChestTheme {
  border: string;
  bg: string;
  accent: string;
}