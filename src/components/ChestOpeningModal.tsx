import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import SpinRouletteWheel from './SpinRouletteWheel';
import ItemCard from './ItemCard';
import { useRouletteLogic } from '@/hooks/useRouletteLogic';
import { useToast } from '@/hooks/use-toast';

interface ChestOpeningModalProps {
  isOpen: boolean;
  onClose: () => void;
  chestType: string;
  chestName: string;
  chestPrice: number;
}

interface SpinItem {
  id: string;
  name: string;
  image_url?: string | null;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'special';
}

const ChestOpeningModal = ({ 
  isOpen, 
  onClose, 
  chestType, 
  chestName, 
  chestPrice 
}: ChestOpeningModalProps) => {
  const [phase, setPhase] = useState<'preview' | 'spinning' | 'result'>('preview');
  const [wonItem, setWonItem] = useState<SpinItem | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  
  const { generateRoulette, rouletteData, isLoading } = useRouletteLogic();
  const { toast } = useToast();

  const handleOpenChest = async () => {
    try {
      setPhase('spinning');
      
      // Generate roulette data
      const result = await generateRoulette(chestType);
      if (!result) return;
      
      // Start spinning after a short delay
      setTimeout(() => {
        setIsSpinning(true);
      }, 1000);
      
    } catch (error) {
      console.error('Erro ao abrir baú:', error);
      toast({
        title: "Erro",
        description: "Falha ao abrir o baú. Tente novamente.",
        variant: "destructive",
      });
      setPhase('preview');
    }
  };

  const handleSpinComplete = (item: SpinItem) => {
    setWonItem(item);
    setIsSpinning(false);
    setPhase('result');
    
    toast({
      title: "🎉 Parabéns!",
      description: `Você ganhou: ${item.name}`,
    });
  };

  const handleClose = () => {
    setPhase('preview');
    setWonItem(null);
    setIsSpinning(false);
    onClose();
  };

  const handleOpenAnother = () => {
    setPhase('preview');
    setWonItem(null);
    setIsSpinning(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              {phase === 'preview' && `Abrir ${chestName}`}
              {phase === 'spinning' && '🎰 Girando a Roleta'}
              {phase === 'result' && '🎉 Resultado do Sorteio'}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X size={20} />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-6">
          {/* Preview Phase */}
          {phase === 'preview' && (
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">
                  Você está prestes a abrir um {chestName}!
                </h3>
                <p className="text-muted-foreground">
                  Custo: <span className="font-bold text-primary">R$ {chestPrice.toFixed(2)}</span>
                </p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Prepare-se para uma experiência emocionante! A roleta irá girar e revelar seu prêmio.
                </p>
              </div>
              
              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleOpenChest} 
                  disabled={isLoading}
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  {isLoading ? 'Preparando...' : `Abrir Baú - R$ ${chestPrice.toFixed(2)}`}
                </Button>
              </div>
            </div>
          )}

          {/* Spinning Phase */}
          {phase === 'spinning' && rouletteData && (
            <div className="space-y-8">
              <div className="text-center">
                <p className="text-lg font-semibold mb-2">🎰 Girando a roleta...</p>
                <p className="text-sm text-muted-foreground">
                  Aguarde enquanto sorteamos seu prêmio!
                </p>
              </div>
              
              <SpinRouletteWheel
                rouletteData={rouletteData}
                isSpinning={isSpinning}
                onSpinComplete={handleSpinComplete}
                className="mb-8"
              />
            </div>
          )}

          {/* Result Phase */}
          {phase === 'result' && wonItem && (
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <h3 className="text-3xl font-bold text-primary">🎉 Parabéns!</h3>
                <p className="text-xl">Você ganhou:</p>
                
                <div className="flex justify-center">
                  <ItemCard 
                    item={wonItem} 
                    size="lg" 
                    showRarity={true}
                    className="animate-scale-in"
                  />
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-2xl font-bold">{wonItem.name}</h4>
                  <p className="text-lg capitalize font-semibold" style={{
                    color: wonItem.rarity === 'common' ? '#9CA3AF' :
                           wonItem.rarity === 'rare' ? '#3B82F6' :
                           wonItem.rarity === 'epic' ? '#8B5CF6' :
                           wonItem.rarity === 'legendary' ? '#F59E0B' :
                           '#EC4899'
                  }}>
                    {wonItem.rarity === 'common' && 'Comum'}
                    {wonItem.rarity === 'rare' && 'Raro'}
                    {wonItem.rarity === 'epic' && 'Épico'}
                    {wonItem.rarity === 'legendary' && 'Lendário'}
                    {wonItem.rarity === 'special' && 'Especial'}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={handleClose}>
                  Fechar
                </Button>
                <Button 
                  onClick={handleOpenAnother}
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  Abrir Outro Baú
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChestOpeningModal;