import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Coins, Package } from "lucide-react";
import confetti from "canvas-confetti";
import { useEffect } from "react";

interface SimpleScratchWinModalProps {
  isOpen: boolean;
  onClose: () => void;
  winType: "item" | "money";
  winData: any; // { amount } for money or item object
}

const SimpleScratchWinModal = ({ isOpen, onClose, winType, winData }: SimpleScratchWinModalProps) => {
  useEffect(() => {
    if (!isOpen) return;
    const duration = 1500;
    const end = Date.now() + duration;
    const tick = () => {
      confetti({ particleCount: 4, spread: 60, origin: { x: 0.2, y: 0.8 } });
      confetti({ particleCount: 4, spread: 60, origin: { x: 0.8, y: 0.8 } });
      if (Date.now() < end) requestAnimationFrame(tick);
    };
    tick();
  }, [isOpen]);

  const isMoney = winType === "money";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Parabéns! Você ganhou</DialogTitle>
        </DialogHeader>
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            {isMoney ? (
              <Coins className="h-14 w-14 text-yellow-500" />
            ) : (
              <Package className="h-14 w-14 text-primary" />
            )}
          </div>
          {isMoney ? (
            <div>
              <p className="text-2xl font-bold text-green-600">+ R$ {Number(winData?.amount || 0).toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Valor adicionado à sua carteira</p>
            </div>
          ) : (
            <div className="space-y-2">
              {winData?.image_url && (
                <img src={winData.image_url} alt={winData.name} className="w-16 h-16 object-contain mx-auto" />
              )}
              <p className="font-semibold">{winData?.name}</p>
              <div className="flex items-center justify-center gap-2">
                {winData?.rarity && (
                  <Badge variant="outline" className="capitalize">{winData.rarity}</Badge>
                )}
                {typeof winData?.base_value === "number" && (
                  <Badge variant="outline">R$ {winData.base_value.toFixed(2)}</Badge>
                )}
              </div>
            </div>
          )}
          <p className="text-xs text-muted-foreground">Feche para continuar jogando</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SimpleScratchWinModal;
