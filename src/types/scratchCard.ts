export interface ScratchSymbol {
  id: string;
  symbolId: string;
  name: string;
  image_url: string;
  rarity: string;
  base_value: number;
  isWinning: boolean;
  category?: string;
}

export interface ScratchCard {
  symbols: ScratchSymbol[];
  winningItem: ScratchSymbol | null;
  hasWin: boolean;
  scratchType: string;
}

export interface ScratchBlockState {
  id: number;
  isScratched: boolean;
  symbol: ScratchSymbol | null;
}

export type ScratchCardType = 'pix' | 'sorte' | 'dupla' | 'ouro' | 'diamante' | 'premium';

export const scratchCardTypes = {
  pix: { 
    name: 'Raspadinha do PIX', 
    price: 0.50,
    color: 'from-cyan-400 to-cyan-600',
    bgColor: 'bg-cyan-500',
    textColor: 'text-cyan-700',
    coverImage: '/lovable-uploads/a4ad10b1-f1f1-4dd4-9bdc-3ff0166406cd.png',
    scratchImage: '/lovable-uploads/48ed5b87-131b-4136-bfc1-5822f0e61a25.png'
  },
  sorte: { 
    name: 'Raspadinha da Sorte', 
    price: 1.00,
    color: 'from-green-400 to-green-600',
    bgColor: 'bg-green-500',
    textColor: 'text-green-700',
    coverImage: 'https://jhbafgzfphiizpuoqksj.supabase.co/storage/v1/object/public/head-images//capa-raspadinha-sorte1.png',
    scratchImage: 'https://jhbafgzfphiizpuoqksj.supabase.co/storage/v1/object/public/head-images//quadradoraspadinha01.png'
  },
  dupla: { 
    name: 'Raspadinha Dupla', 
    price: 2.50,
    color: 'from-green-500 to-green-700',
    bgColor: 'bg-green-600',
    textColor: 'text-green-800',
    coverImage: 'https://jhbafgzfphiizpuoqksj.supabase.co/storage/v1/object/public/head-images//capa-raspadinha-sorte2x.png',
    scratchImage: 'https://jhbafgzfphiizpuoqksj.supabase.co/storage/v1/object/public/head-images//quadradoraspadinha03.png'
  },
  ouro: { 
    name: 'Raspadinha de Ouro', 
    price: 5.00,
    color: 'from-yellow-400 to-yellow-600',
    bgColor: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    coverImage: 'https://jhbafgzfphiizpuoqksj.supabase.co/storage/v1/object/public/head-images//capa-raspadinha-ouro.png',
    scratchImage: 'https://jhbafgzfphiizpuoqksj.supabase.co/storage/v1/object/public/head-images//qaudradoraspadinhaouro2.png'
  },
  diamante: { 
    name: 'Raspadinha Diamante', 
    price: 10.00,
    color: 'from-blue-400 to-blue-600',
    bgColor: 'bg-blue-500',
    textColor: 'text-blue-700',
    coverImage: 'https://jhbafgzfphiizpuoqksj.supabase.co/storage/v1/object/public/head-images//capa-raspadinha-diamante.png',
    scratchImage: 'https://jhbafgzfphiizpuoqksj.supabase.co/storage/v1/object/public/head-images//raspadinha-bannerquadradodiamante01%20(1).png'
  },
  premium: { 
    name: 'Raspadinha Premium', 
    price: 25.00,
    color: 'from-purple-400 via-pink-500 to-purple-600',
    bgColor: 'bg-gradient-to-r from-purple-500 to-pink-500',
    textColor: 'text-purple-700',
    coverImage: 'https://jhbafgzfphiizpuoqksj.supabase.co/storage/v1/object/public/head-images//capa-raspadinha-diamante-premium.png',
    scratchImage: 'https://jhbafgzfphiizpuoqksj.supabase.co/storage/v1/object/public/head-images//raspadinha-bannerquadradopremium01%20(1).png'
  }
} as const;