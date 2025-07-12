import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Lock, AlertTriangle } from 'lucide-react';
import { ChestType } from '@/data/chestData';

interface ChestActionButtonProps {
  chestType: ChestType;
  price: number;
  balance: number;
  hasMinimumItems: boolean;
  loading: boolean;
  onOpen: () => void;
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
  onOpen 
}: ChestActionButtonProps) => {
  const canAfford = balance >= price;
  const canPurchase = canAfford && hasMinimumItems;
  const chestColor = chestColors[chestType] || chestColors.silver;

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

    if (!canAfford) {
      return (
        <>
          <Lock className="w-4 h-4 mr-2" />
          Sem Saldo
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

    if (!canAfford) {
      return `Faltam R$ ${(price - balance).toFixed(2).replace('.', ',')}`;
    }

    return null;
  };

  return (
    <div className="mt-auto pt-6">
      <Button
        onClick={onOpen}
        disabled={!canPurchase || loading}
        className={`w-full font-bold transition-all duration-300 text-xl py-8 ${
          canPurchase 
            ? `bg-gradient-to-r ${chestColor} text-black hover:opacity-90 hover:scale-105 shadow-lg` 
            : 'bg-gray-600 text-gray-300 cursor-not-allowed'
        }`}
      >
        {getButtonContent()}
      </Button>

      {getStatusMessage() && (
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