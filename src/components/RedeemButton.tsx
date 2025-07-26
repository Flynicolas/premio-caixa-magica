
import { Button } from '@/components/ui/button';
import { Gift, Package, Clock, Timer } from 'lucide-react';
import { useRedemptionControl } from '@/hooks/useRedemptionControl';
import { useEffect, useState } from 'react';

interface RedeemButtonProps {
  isRedeemed: boolean;
  isProcessing?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  inventoryId?: string; // Para controle global
}

const RedeemButton = ({ 
  isRedeemed, 
  isProcessing = false, 
  onClick, 
  size = 'default',
  className = '',
  inventoryId
}: RedeemButtonProps) => {
  const { checkItemRedemptionStatus } = useRedemptionControl();
  const [redemptionStatus, setRedemptionStatus] = useState<any>(null);

  // Verificar status de resgate quando o componente carregar
  useEffect(() => {
    if (inventoryId) {
      checkItemRedemptionStatus(inventoryId).then(setRedemptionStatus);
    }
  }, [inventoryId, checkItemRedemptionStatus]);

  // Se temos controle global e o item não pode ser resgatado
  if (inventoryId && redemptionStatus) {
    if (redemptionStatus.isRedeemed) {
      return (
        <div className={`flex items-center gap-2 text-green-400 ${className}`}>
          <Package className="w-4 h-4" />
          <span className="text-sm font-medium">Resgatado</span>
        </div>
      );
    }

    if (redemptionStatus.isPending) {
      const hoursRemaining = Math.ceil(redemptionStatus.timeRemaining || 0);
      return (
        <div className={`flex items-center gap-2 text-orange-400 ${className}`}>
          <Timer className="w-4 h-4" />
          <span className="text-sm font-medium">
            Aguardando ({hoursRemaining}h restantes)
          </span>
        </div>
      );
    }
  }
  if (isRedeemed) {
    return (
      <div className={`flex items-center gap-2 text-green-400 ${className}`}>
        <Package className="w-4 h-4" />
        <span className="text-sm font-medium">Resgatado</span>
      </div>
    );
  }

  return (
    <Button
      onClick={onClick}
      disabled={isProcessing}
      size={size}
      className={`bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-semibold ${className}`}
    >
      {isProcessing ? (
        <>
          <Clock className="w-4 h-4 mr-2 animate-spin" />
          Processando...
        </>
      ) : (
        <>
          <Gift className="w-4 h-4 mr-2" />
          Resgatar Prêmio
        </>
      )}
    </Button>
  );
};

export default RedeemButton;
