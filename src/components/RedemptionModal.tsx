import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Wallet,
  CreditCard,
  Plus,
  Gift,
  Info,
  CheckCircle,
} from 'lucide-react';
import { useRedemptionFlow, RedemptionItem } from '@/hooks/useRedemptionFlow';

interface RedemptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: RedemptionItem | null;
  onAddBalance?: () => void;
}

const RedemptionModal = ({ 
  isOpen, 
  onClose, 
  item, 
  onAddBalance 
}: RedemptionModalProps) => {
  const {
    redeemItem,
    isProcessing,
    canUseWallet,
    userBalance,
    deliveryFee,
  } = useRedemptionFlow();

  const [selectedMethod, setSelectedMethod] = useState<'wallet' | 'external' | null>(null);

  const hasWalletBalance = canUseWallet(userBalance);
  const formattedBalance = userBalance.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
  const formattedFee = deliveryFee.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const handleRedeem = async () => {
    if (!item || !selectedMethod) return;

    const result = await redeemItem(item, selectedMethod);
    if (result.success) {
      onClose();
      setSelectedMethod(null);
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedMethod(null);
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-yellow-400" />
            Resgatar Prêmio
          </DialogTitle>
          <DialogDescription>
            Escolha como deseja pagar a taxa de entrega
          </DialogDescription>
        </DialogHeader>

        {/* Item Preview */}
        <Card className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="flex items-center gap-3">
            <img
              src={item.item?.image_url || '/placeholder.svg'}
              alt={item.item?.name || 'Prêmio'}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h4 className="font-semibold">{item.item?.name}</h4>
              <p className="text-sm text-muted-foreground">
                Valor: {item.item?.base_value?.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </p>
            </div>
          </div>
        </Card>

        {/* Delivery Fee Info */}
        <Card className="p-3 bg-blue-50/50 border-blue-200">
          <div className="flex items-center gap-2 text-blue-700">
            <Info className="w-4 h-4" />
            <span className="text-sm font-medium">
              Taxa de entrega: {formattedFee}
            </span>
          </div>
        </Card>

        {/* Payment Methods */}
        <div className="space-y-3">
          {/* Wallet Payment */}
          <Card 
            className={`p-4 cursor-pointer transition-all border-2 ${
              selectedMethod === 'wallet' 
                ? 'border-primary bg-primary/5' 
                : hasWalletBalance 
                  ? 'border-border hover:border-primary/50' 
                  : 'border-border opacity-50 cursor-not-allowed'
            }`}
            onClick={() => hasWalletBalance && setSelectedMethod('wallet')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-black" />
                </div>
                <div>
                  <p className="font-semibold">Usar saldo da carteira</p>
                  <p className="text-sm text-muted-foreground">
                    Saldo atual: {formattedBalance}
                  </p>
                </div>
              </div>
              {selectedMethod === 'wallet' && (
                <CheckCircle className="w-5 h-5 text-primary" />
              )}
            </div>
            {!hasWalletBalance && (
              <div className="mt-2 p-2 bg-red-50 rounded-md">
                <p className="text-xs text-red-600">
                  Saldo insuficiente. Você precisa de {formattedFee}.
                </p>
              </div>
            )}
          </Card>

          {/* External Payment */}
          <Card 
            className={`p-4 cursor-pointer transition-all border-2 ${
              selectedMethod === 'external' 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => setSelectedMethod('external')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold">PIX ou Cartão</p>
                  <p className="text-sm text-muted-foreground">
                    Pagamento externo via MercadoPago
                  </p>
                </div>
              </div>
              {selectedMethod === 'external' && (
                <CheckCircle className="w-5 h-5 text-primary" />
              )}
            </div>
          </Card>

          {/* Add Balance Option */}
          {!hasWalletBalance && (
            <>
              <Separator />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  onAddBalance?.();
                  handleClose();
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar saldo à carteira
              </Button>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={handleClose} className="flex-1">
            Cancelar
          </Button>
          <Button 
            onClick={handleRedeem}
            disabled={!selectedMethod || isProcessing}
            className="flex-1"
          >
            {isProcessing ? 'Processando...' : 'Confirmar Resgate'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RedemptionModal;