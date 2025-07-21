import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Crown, UserPlus, RotateCcw } from 'lucide-react';

interface SimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  prize: any;
  attemptsLeft: number;
  onTryAgain?: () => void;
}

const rarityColors = {
  common: 'border-gray-400 bg-gray-900/50',
  rare: 'border-blue-400 bg-blue-900/50',
  epic: 'border-purple-400 bg-purple-900/50',
  legendary: 'border-yellow-400 bg-yellow-900/50'
};

const rarityIcons = {
  common: <Star className="w-4 h-4" />,
  rare: <Star className="w-4 h-4" />,
  epic: <Crown className="w-4 h-4" />,
  legendary: <Crown className="w-4 h-4" />
};

const SimulationModal = ({ isOpen, onClose, prize, attemptsLeft, onTryAgain }: SimulationModalProps) => {
  if (!prize) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-primary">
            🎉 Parabéns! (Simulação)
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center space-y-6">
          <Card className={`${rarityColors[prize.rarity]} border-2 max-w-xs mx-auto`}>
            <CardContent className="p-4">
              <img
                src={prize.image_url}
                alt={prize.name}
                className="w-24 h-24 object-contain mx-auto mb-3 drop-shadow-lg"
              />
              <h3 className="font-bold text-lg mb-2">{prize.name}</h3>
              <Badge variant="secondary" className="mb-2">
                {rarityIcons[prize.rarity]}
                <span className="ml-1 capitalize">{prize.rarity}</span>
              </Badge>
            </CardContent>
          </Card>

          <div className="bg-amber-100/10 border border-amber-500/20 rounded-lg p-4">
            <p className="text-sm text-amber-200 mb-2">
              ⚠️ Esta foi apenas uma demonstração!
            </p>
            <p className="text-xs text-muted-foreground">
              Para ganhar prêmios reais, cadastre-se em nossa plataforma
            </p>
          </div>

          <div className="space-y-3">
            {onTryAgain ? (
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={onTryAgain}
                  variant="outline"
                  className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Tentar Novamente ({attemptsLeft})
                </Button>
                <Button
                  onClick={onClose}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Cadastrar Grátis
                </Button>
              </div>
            ) : (
              <Button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Cadastre-se para Ganhar de Verdade!
              </Button>
            )}
          </div>

          {attemptsLeft === 0 && (
            <p className="text-xs text-muted-foreground">
              Você usou todas as tentativas gratuitas. Cadastre-se para continuar!
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SimulationModal;