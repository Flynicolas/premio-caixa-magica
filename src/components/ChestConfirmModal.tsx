
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowUp, AlertTriangle } from 'lucide-react';
import { ChestType } from '@/data/chestData';
import { useChestItemCount } from '@/hooks/useChestItemCount';

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
  const { itemCount, hasMinimumItems, loading } = useChestItemCount(chestType);

  const chestConfigs = {
    silver: {
      gradient: 'from-gray-400 to-gray-600',
      glow: 'shadow-gray-400/50',
      accent: 'text-gray-300',
      buttonGlow: 'shadow-gray-400/30'
    },
    gold: {
      gradient: 'from-yellow-400 to-yellow-600',
      glow: 'shadow-yellow-400/50',
      accent: 'text-yellow-300',
      buttonGlow: 'shadow-yellow-400/30'
    },
    delas: {
      gradient: 'from-pink-400 to-rose-500',
      glow: 'shadow-pink-400/50',
      accent: 'text-pink-300',
      buttonGlow: 'shadow-pink-400/30'
    },
    diamond: {
      gradient: 'from-blue-400 to-cyan-400',
      glow: 'shadow-blue-400/50',
      accent: 'text-blue-300',
      buttonGlow: 'shadow-blue-400/30'
    },
    ruby: {
      gradient: 'from-red-400 to-pink-500',
      glow: 'shadow-red-400/50',
      accent: 'text-red-300',
      buttonGlow: 'shadow-red-400/30'
    },
    premium: {
      gradient: 'from-purple-500 to-pink-600',
      glow: 'shadow-purple-500/50',
      accent: 'text-purple-300',
      buttonGlow: 'shadow-purple-500/30'
    }
  };

  const chestImages = {
    silver: '/lovable-uploads/8f503764-12ee-4e00-8148-76b279be343f.png',
    gold: '/lovable-uploads/8c5dedca-ad61-4b14-a649-8b854950a875.png',
    delas: '/lovable-uploads/85b1ecea-b443-4391-9986-fb77979cf6ea.png',
    diamond: '/lovable-uploads/0ec6f6c5-203f-4fca-855d-59171f78adf3.png',
    ruby: '/lovable-uploads/a7b012cc-0fae-4b69-b2f4-690740a0ba92.png',
    premium: '/lovable-uploads/d43f06a5-1532-42ba-8362-5aefb160b408.png'
  };

  // Add safety check with fallback to silver config
  const config = chestConfigs[chestType] || chestConfigs.silver;
  const chestImage = chestImages[chestType] || chestImages.silver;
  
  const canAfford = balance >= chestPrice;
  const canAffordUpgrade = nextChestPrice ? balance >= nextChestPrice : false;
  const canPurchase = canAfford && hasMinimumItems;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 border-0 bg-transparent shadow-none">
        <div className={`relative rounded-3xl p-8 bg-gradient-to-br ${config.gradient} ${config.glow} shadow-2xl animate-scale-in border-4 border-white/30`}>
          {/* Background overlay */}
          <div className="absolute inset-0 bg-black/20 rounded-3xl" />
          
          {/* Floating sparkles */}
          <div className="absolute -top-2 -left-2">
            <Sparkles className={`w-6 h-6 ${config.accent} animate-pulse`} />
          </div>
          <div className="absolute -top-1 -right-3">
            <Sparkles className={`w-4 h-4 ${config.accent} animate-pulse delay-300`} />
          </div>
          <div className="absolute -bottom-2 -right-2">
            <Sparkles className={`w-5 h-5 ${config.accent} animate-pulse delay-500`} />
          </div>
          
          <div className="relative z-10 text-center">
            {/* Chest Image */}
            <div className="mb-6 flex justify-center">
              <div className={`w-40 h-40 flex items-center justify-center rounded-full bg-white/10 ${config.glow}`}>
                <img 
                  src={chestImage} 
                  alt={chestName}
                  className="w-32 h-32 object-contain drop-shadow-2xl animate-float"
                />
              </div>
            </div>

            {/* Question */}
            <h2 className="text-3xl font-bold text-white mb-3 drop-shadow-lg">
              Abrir o {chestName}?
            </h2>
            
            <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-white/20">
              <p className="text-white font-bold text-xl mb-2">
                R$ {chestPrice.toFixed(2).replace('.', ',')}
              </p>
              
              <p className="text-white/80 text-sm mb-2">
                Saldo: R$ {balance.toFixed(2).replace('.', ',')}
              </p>

              <p className="text-white/70 text-sm">
                {loading ? 'Carregando...' : `${itemCount} itens disponíveis`}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              {!hasMinimumItems ? (
                <div className="bg-black/60 backdrop-blur-sm text-white font-bold py-4 px-6 rounded-xl text-center border border-white/20">
                  <AlertTriangle className="w-5 h-5 mx-auto mb-2 text-red-400" />
                  <p className="text-sm">Baú Indisponível</p>
                  <p className="text-xs text-white/70">Aguarde mais itens serem adicionados</p>
                  <p className="text-xs text-white/70">({itemCount}/10 itens)</p>
                </div>
              ) : (
                <Button
                  onClick={onConfirm}
                  disabled={!canPurchase}
                  className={`w-full bg-black/60 backdrop-blur-sm hover:bg-black/40 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 hover:scale-105 border border-white/20 ${config.buttonGlow}`}
                >
                  {canAfford ? (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Sim, Abrir Baú!
                    </>
                  ) : (
                    'Saldo Insuficiente'
                  )}
                </Button>
              )}

              {nextChestType && nextChestName && nextChestPrice && hasMinimumItems && (
                <Button
                  onClick={onUpgrade}
                  disabled={!canAffordUpgrade}
                  variant="outline"
                  className="w-full border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 font-bold py-4 px-6 rounded-xl transition-all duration-300 hover:scale-105"
                >
                  <ArrowUp className="w-5 h-5 mr-2" />
                  Upgrade - {nextChestName}
                </Button>
              )}

              <Button
                onClick={onClose}
                variant="ghost"
                className="w-full text-white/80 hover:text-white hover:bg-white/10 backdrop-blur-sm rounded-xl py-3 transition-all duration-300"
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
