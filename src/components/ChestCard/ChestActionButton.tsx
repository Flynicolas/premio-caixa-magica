import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Lock, AlertTriangle, Wallet } from 'lucide-react';
import { ChestType } from '@/data/chestData';

interface ChestActionButtonProps {
  chestType: ChestType;
  price: number;
  balance: number;
  hasMinimumItems: boolean;
  loading: boolean;
  isAuthenticated: boolean;
  onOpen: () => void;
  onAddBalance?: () => void;
}

const chestColors = {
  silver: 'from-gray-400 to-gray-600',
  gold: 'from-yellow-400 to-yellow-600',
  delas: 'from-pink-400 to-rose-500',
  diamond: 'from-blue-400 to-cyan-400',
  ruby: 'from-red-400 to-pink-500',
  premium: 'from-purple-500 to-pink-600'
};

const ChestActionButton = ({ 
  chestType, 
  price, 
  balance, 
  hasMinimumItems, 
  loading, 
  isAuthenticated,
  onOpen,
  onAddBalance
}: ChestActionButtonProps) => {
  const canAfford = balance >= price;
  const canPurchase = canAfford && hasMinimumItems;
  const chestColor = chestColors[chestType] || chestColors.silver;
  const shouldShowAddBalance = isAuthenticated && !canAfford && hasMinimumItems;

  const getButtonContent = () => {
    if (loading) {
      return (
        <>
          <Sparkles className="w-4 h-4 mr-2" />
          Carregando...
        </>
      );
    }

    if (!hasMinimumItems) {
      return (
        <>
          <AlertTriangle className="w-4 h-4 mr-2" />
          Indisponível
        </>
      );
    }

    // Para não-usuários, sempre mostrar "Abrir Baú" sem mensagem de saldo
    if (!isAuthenticated) {
      return (
        <>
          <Sparkles className="w-4 h-4 mr-2" />
          Abrir Baú
        </>
      );
    }

    if (shouldShowAddBalance) {
      return (
        <>
          <Wallet className="w-4 h-4 mr-2" />
          Adicionar Saldo
        </>
      );
    }

    return (
      <>
        <Sparkles className="w-4 h-4 mr-2" />
        Abrir Baú
      </>
    );
  };

  const getStatusMessage = () => {
    if (!hasMinimumItems) {
      return 'Baú indisponível no momento';
    }

    // Não mostrar mensagem de saldo para não-usuários
    if (!isAuthenticated) {
      return null;
    }

    if (!canAfford) {
      return `Faltam R$ ${(price - balance).toFixed(2).replace('.', ',')}`;
    }

    return null;
  };

  const handleClick = () => {
    if (shouldShowAddBalance && onAddBalance) {
      onAddBalance();
    } else {
      onOpen();
    }
  };

  return (
    <div className="mt-auto pt-6">
      <Button
        onClick={handleClick}
        disabled={(!canPurchase && !shouldShowAddBalance && isAuthenticated) || loading}
        className={`w-full font-bold transition-all duration-300 text-xl py-8 ${
          (canPurchase || shouldShowAddBalance || !isAuthenticated)
            ? `bg-gradient-to-r ${chestColor} text-black hover:opacity-90 hover:scale-105 shadow-lg` 
            : 'bg-gray-600 text-gray-300 cursor-not-allowed'
        }`}
      >
        {getButtonContent()}
      </Button>

      {getStatusMessage() && !shouldShowAddBalance && (
        <Badge 
          variant="destructive" 
          className="mt-4 text-sm text-center w-full py-3"
        >
          {getStatusMessage()}
        </Badge>
      )}
    </div>
  );
};

export default ChestActionButton;