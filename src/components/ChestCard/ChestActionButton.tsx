
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChestType } from '@/data/chestData';
import { 
  Wallet, 
  Lock, 
  Loader2, 
  Package,
  Sparkles,
  Crown,
  Diamond,
  Star,
  Flame,
  Heart
} from 'lucide-react';

interface ChestActionButtonProps {
  chestType: ChestType;
  price: number;
  balance: number;
  hasMinimumItems: boolean;
  loading: boolean;
  isAuthenticated: boolean;
  onOpen: () => void;
  onAddBalance?: () => void;
  variant?: 'default' | 'catalog';
}

const ChestActionButton = ({
  chestType,
  price,
  balance,
  hasMinimumItems,
  loading,
  isAuthenticated,
  onOpen,
  onAddBalance,
  variant = 'default'
}: ChestActionButtonProps) => {
  const canOpen = balance >= price && hasMinimumItems;

  // Configurações temáticas para cada tipo de baú
  const chestThemes = {
    silver: {
      icon: Star,
      gradient: 'from-gray-400 to-gray-600',
      hoverGradient: 'hover:from-gray-500 hover:to-gray-700',
      shadow: 'hover:shadow-gray-500/50',
      glow: 'group-hover:shadow-gray-400/30'
    },
    gold: {
      icon: Crown,
      gradient: 'from-yellow-400 to-yellow-600',
      hoverGradient: 'hover:from-yellow-500 hover:to-yellow-700',
      shadow: 'hover:shadow-yellow-500/50',
      glow: 'group-hover:shadow-yellow-400/30'
    },
    delas: {
      icon: Heart,
      gradient: 'from-pink-400 to-rose-500',
      hoverGradient: 'hover:from-pink-500 hover:to-rose-600',
      shadow: 'hover:shadow-pink-500/50',
      glow: 'group-hover:shadow-pink-400/30'
    },
    diamond: {
      icon: Diamond,
      gradient: 'from-blue-400 to-cyan-400',
      hoverGradient: 'hover:from-blue-500 hover:to-cyan-500',
      shadow: 'hover:shadow-blue-500/50',
      glow: 'group-hover:shadow-blue-400/30'
    },
    ruby: {
      icon: Flame,
      gradient: 'from-red-400 to-pink-500',
      hoverGradient: 'hover:from-red-500 hover:to-pink-600',
      shadow: 'hover:shadow-red-500/50',
      glow: 'group-hover:shadow-red-400/30'
    },
    premium: {
      icon: Sparkles,
      gradient: 'from-purple-500 to-pink-600',
      hoverGradient: 'hover:from-purple-600 hover:to-pink-700',
      shadow: 'hover:shadow-purple-500/50',
      glow: 'group-hover:shadow-purple-400/30'
    }
  };

  const theme = chestThemes[chestType] || chestThemes.silver;
  const IconComponent = theme.icon;

  if (loading) {
    return (
      <Button disabled className="w-full bg-muted">
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Carregando...
      </Button>
    );
  }

  if (!isAuthenticated) {
    return (
      <Button
        onClick={onOpen}
        className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-bold"
      >
        <Package className="w-4 h-4 mr-2" />
        {variant === 'catalog' ? 'Ver Baú' : 'Entrar para Abrir'}
      </Button>
    );
  }

  if (!hasMinimumItems) {
    return (
      <div className="space-y-2">
        <Badge variant="secondary" className="w-full justify-center">
          <Lock className="w-3 h-3 mr-1" />
          Sem itens disponíveis
        </Badge>
      </div>
    );
  }

  if (balance < price) {
    return (
      <div className="space-y-2">
        <Badge variant="destructive" className="w-full justify-center text-xs">
          Saldo: R$ {balance.toFixed(2)} | Necessário: R$ {price.toFixed(2)}
        </Badge>
        <Button
          onClick={onAddBalance}
          variant="outline"
          className="w-full text-xs"
        >
          <Wallet className="w-3 h-3 mr-1" />
          Adicionar Saldo
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={onOpen}
      disabled={!canOpen}
      className={`w-full bg-gradient-to-r ${theme.gradient} ${theme.hoverGradient} text-white font-bold transition-all duration-300 ${theme.shadow} group ${theme.glow} hover:scale-105 border-0 shadow-lg`}
    >
      <IconComponent className="w-4 h-4 mr-2 drop-shadow-lg group-hover:animate-pulse" />
      {variant === 'catalog' ? 'Abrir Baú' : 'Abrir Baú'}
      <Sparkles className="w-3 h-3 ml-2 opacity-70 group-hover:opacity-100 transition-opacity" />
    </Button>
  );
};

export default ChestActionButton;
