
import { Button } from '@/components/ui/button';
import { Gift, Package, Clock, Timer, Wallet, AlertCircle } from 'lucide-react';
import { useRedemptionControl } from '@/hooks/useRedemptionControl';
import { useMoneyItemRedemption } from '@/hooks/useMoneyItemRedemption';
import { useEffect, useState } from 'react';

interface RedeemButtonProps {
  isRedeemed: boolean;
  isProcessing?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  inventoryId?: string; // Para controle global
  item?: any; // Dados do item para verificar conversão monetária
}

const RedeemButton = ({ 
  isRedeemed, 
  isProcessing = false, 
  onClick, 
  size = 'default',
  className = '',
  inventoryId,
  item
}: RedeemButtonProps) => {
  const { checkItemRedemptionStatus } = useRedemptionControl();
  const { redeemMoneyItem, loading } = useMoneyItemRedemption();
  const [redemptionStatus, setRedemptionStatus] = useState<any>(null);
  const [isConverting, setIsConverting] = useState(false);

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

  // Verificar se é item de dinheiro
  const isMoneyItem = item && item.category === 'dinheiro';
  const conversionAmount = isMoneyItem ? item.base_value : 0;

  // Função para lidar com resgate direto de dinheiro
  const handleMonetaryRedemption = async () => {
    if (!inventoryId || !item) return;
    
    setIsConverting(true);
    try {
      const result = await redeemMoneyItem(
        item.id,
        inventoryId,
        conversionAmount
      );
      
      // Se o resgate foi bem-sucedido, recarregar para atualizar o estado
      if (result.success) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Erro no resgate de dinheiro:', error);
    } finally {
      setIsConverting(false);
    }
  };

  // Se é item de dinheiro, mostrar botão específico para resgate direto
  if (isMoneyItem) {
    return (
      <Button
        onClick={handleMonetaryRedemption}
        disabled={isConverting || loading}
        size={size}
        className={`bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold ${className}`}
      >
        {isConverting || loading ? (
          <>
            <Clock className="w-4 h-4 mr-2 animate-spin" />
            Resgatando...
          </>
        ) : (
          <>
            <Wallet className="w-4 h-4 mr-2" />
            Resgatar R$ {conversionAmount.toFixed(2)}
          </>
        )}
      </Button>
    );
  }

  // Botão padrão para itens físicos
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
