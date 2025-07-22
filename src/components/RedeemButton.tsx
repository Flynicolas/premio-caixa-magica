
import { Button } from '@/components/ui/button';
import { Gift, Package, Clock } from 'lucide-react';

interface RedeemButtonProps {
  isRedeemed: boolean;
  isProcessing?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

const RedeemButton = ({ 
  isRedeemed, 
  isProcessing = false, 
  onClick, 
  size = 'default',
  className = '' 
}: RedeemButtonProps) => {
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
