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
  backgroundImage?: string;
}

export interface ScratchBlockState {
  id: number;
  isScratched: boolean;
  symbol: ScratchSymbol | null;
}

export type ScratchCardType = 'basic' | 'silver' | 'gold' | 'delas' | 'diamond' | 'ruby' | 'premium';

export const scratchCardTypes = {
  basic: { 
    name: 'Raspadinha Básica', 
    price: 1,
    backgroundImage: '/lovable-uploads/photo-1518770660439-4636190af475.jpg'
  },
  silver: { 
    name: 'Raspadinha de Prata', 
    price: 5,
    backgroundImage: '/lovable-uploads/photo-1487058792275-0ad4aaf24ca7.jpg'
  },
  gold: { 
    name: 'Raspadinha de Ouro', 
    price: 12,
    backgroundImage: '/lovable-uploads/photo-1526374965328-7f61d4dc18c5.jpg'
  },
  delas: { 
    name: 'Raspadinha Delas', 
    price: 25,
    backgroundImage: '/lovable-uploads/photo-1470813740244-df37b8c1edcb.jpg'
  },
  diamond: { 
    name: 'Raspadinha de Diamante', 
    price: 50,
    backgroundImage: '/lovable-uploads/photo-1500375592092-40eb2168fd21.jpg'
  },
  ruby: { 
    name: 'Raspadinha de Rubi', 
    price: 125,
    backgroundImage: '/lovable-uploads/photo-1523712999610-f77fbcfc3843.jpg'
  },
  premium: { 
    name: 'Raspadinha Premium', 
    price: 250,
    backgroundImage: '/lovable-uploads/photo-1500673922987-e212871fec22.jpg'
  }
} as const;