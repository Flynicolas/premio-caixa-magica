export interface ScratchSymbol {
  id: string;
  symbolId: string;
  name: string;
  image_url: string;
  rarity: string;
  base_value: number;
  isWinning: boolean;
}

export interface ScratchCard {
  symbols: ScratchSymbol[];
  winningItem: ScratchSymbol | null;
  hasWin: boolean;
  chestType: string;
}

export interface ScratchBlockState {
  id: number;
  isScratched: boolean;
  symbol: ScratchSymbol | null;
}

export type ScratchCardType = 'basic' | 'silver' | 'gold' | 'delas' | 'diamond' | 'ruby' | 'premium';

export const scratchCardTypes = {
  basic: { name: 'Raspadinha Básica', price: 1 },
  silver: { name: 'Raspadinha de Prata', price: 5 },
  gold: { name: 'Raspadinha de Ouro', price: 12 },
  delas: { name: 'Raspadinha Delas', price: 25 },
  diamond: { name: 'Raspadinha de Diamante', price: 50 },
  ruby: { name: 'Raspadinha de Rubi', price: 125 },
  premium: { name: 'Raspadinha Premium', price: 250 }
} as const;