
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowUp } from 'lucide-react';
import { ChestType } from '@/data/chestData';

interface ChestConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onUpgrade: () => void;
  chestType: ChestType;
  chestName: string;
  chestPrice: number;
  balance: number;
  nextChestType?: ChestType;
  nextChestName?: string;
  nextChestPrice?: number;
}

const ChestConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  onUpgrade,
  chestType,
  chestName,
  chestPrice,
  balance,
  nextChestType,
  nextChestName,
  nextChestPrice
}: ChestConfirmModalProps) => {
  const chestColors = {
    silver: 'from-gray-400 to-gray-600',
    gold: 'from-yellow-400 to-yellow-600',
    diamond: 'from-blue-400 to-cyan-400',
    ruby: 'from-red-400 to-pink-500',
    premium: 'from-purple-500 to-pink-600'
  };

  const chestImages = {
    silver: '/lovable-uploads/8f503764-12ee-4e00-8148-76b279be343f.png',
    gold: '/lovable-uploads/8c5dedca-ad61-4b14-a649-8b854950a875.png',
    diamond: '/lovable-uploads/0ec6f6c5-203f-4fca-855d-59171f78adf3.png',
    ruby: '/lovable-uploads/a7b012cc-0fae-4b69-b2f4-690740a0ba92.png',
    premium: '/lovable-uploads/d43f06a5-1532-42ba-8362-5aefb160b408.png'
  };

  const canAfford = balance >= chestPrice;
  const canAffordUpgrade = nextChestPrice ? balance >= nextChestPrice : false;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 border-0 bg-transparent shadow-none">
        <div className={`relative rounded-2xl p-8 bg-gradient-to-br ${chestColors[chestType]} shadow-2xl animate-scale-in`}>
          {/* Background overlay */}
          <div className="absolute inset-0 bg-black/20 rounded-2xl" />
          
          {/* Floating sparkles */}
          <div className="absolute -top-2 -left-2">
            <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
          </div>
          <div className="absolute -top-1 -right-3">
            <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse delay-300" />
          </div>
          <div className="absolute -bottom-2 -right-2">
            <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse delay-500" />
          </div>
          
          <div className="relative z-10 text-center">
            {/* Chest Image */}
            <div className="mb-6 flex justify-center">
              <div className="w-32 h-32 flex items-center justify-center">
                <img 
                  src={chestImages[chestType]} 
                  alt={chestName}
                  className="w-full h-full object-contain drop-shadow-2xl animate-float"
                />
              </div>
            </div>

            {/* Question */}
            <h2 className="text-2xl font-bold text-black mb-2">
              Abrir o {chestName}?
            </h2>
            
            <p className="text-black/80 mb-2">
              R$ {chestPrice.toFixed(2).replace('.', ',')}
            </p>
            
            <p className="text-sm text-black/70 mb-6">
              Saldo: R$ {balance.toFixed(2).replace('.', ',')}
            </p>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={onConfirm}
                disabled={!canAfford}
                className="w-full bg-black/80 hover:bg-black text-white font-bold py-3"
              >
                {canAfford ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Sim, Abrir Baú!
                  </>
                ) : (
                  'Saldo Insuficiente'
                )}
              </Button>

              {nextChestType && nextChestName && nextChestPrice && (
                <Button
                  onClick={onUpgrade}
                  disabled={!canAffordUpgrade}
                  variant="outline"
                  className="w-full border-black/50 text-black hover:bg-black/10 font-bold py-3"
                >
                  <ArrowUp className="w-4 h-4 mr-2" />
                  Mais Chances - {nextChestName}
                </Button>
              )}

              <Button
                onClick={onClose}
                variant="ghost"
                className="w-full text-black/70 hover:text-black hover:bg-black/10"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChestConfirmModal;
