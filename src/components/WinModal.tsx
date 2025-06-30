
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Sparkles, Gift } from 'lucide-react';
import { Prize } from '@/data/chestData';
import { useEffect, useState } from 'react';

interface WinModalProps {
  isOpen: boolean;
  onClose: () => void;
  prize: Prize | null;
}

const WinModal = ({ isOpen, onClose, prize }: WinModalProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // Reset animation after 3 seconds
      const timer = setTimeout(() => setIsAnimating(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!prize) return null;

  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-orange-500'
  };

  const rarityLabels = {
    common: 'Comum',
    rare: 'Raro',
    epic: 'Épico',
    legendary: 'Lendário'
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gradient-to-br from-card via-card to-card/90 border-primary/30 backdrop-blur-sm">
        <div className="text-center py-8">
          {/* Celebration Animation */}
          <div className={`mb-6 ${isAnimating ? 'animate-bounce' : ''}`}>
            <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${rarityColors[prize.rarity]} 
              flex items-center justify-center mb-4 ${isAnimating ? 'pulse-gold' : ''}`}>
              <Trophy className="w-12 h-12 text-white" />
            </div>
            
            <div className="flex justify-center space-x-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Sparkles 
                  key={i} 
                  className={`w-6 h-6 text-primary ${isAnimating ? 'animate-pulse' : ''}`} 
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>

          {/* Win Message */}
          <h2 className="text-3xl font-bold gold-gradient bg-clip-text text-transparent mb-2">
            🎉 PARABÉNS! 🎉
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            Você ganhou um prêmio incrível!
          </p>

          {/* Prize Details */}
          <div className="bg-secondary/50 rounded-lg p-6 mb-6 border border-primary/20">
            <img 
              src={prize.image} 
              alt={prize.name}
              className="w-20 h-20 mx-auto mb-4 rounded-lg object-cover"
            />
            
            <h3 className="text-xl font-bold text-primary mb-2">
              {prize.name}
            </h3>
            
            <p className="text-sm text-muted-foreground mb-3">
              {prize.description}
            </p>
            
            <div className="flex justify-center items-center space-x-2 mb-3">
              <Badge 
                variant="secondary" 
                className={`bg-gradient-to-r ${rarityColors[prize.rarity]} text-white`}
              >
                {rarityLabels[prize.rarity]}
              </Badge>
              <Badge variant="outline" className="text-primary border-primary">
                {prize.value}
              </Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={onClose}
              className="w-full gold-gradient text-black font-bold hover:opacity-90"
            >
              <Gift className="w-4 h-4 mr-2" />
              Adicionar à Carteira
            </Button>
            
            <p className="text-xs text-muted-foreground">
              Seu prêmio foi adicionado automaticamente à sua carteira. 
              Você pode resgatá-lo quando quiser!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WinModal;
