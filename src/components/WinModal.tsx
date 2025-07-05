
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Sparkles, Gift, X } from 'lucide-react';
import { DatabaseItem } from '@/types/database';
import { useEffect, useState } from 'react';

interface WinModalProps {
  isOpen: boolean;
  onClose: () => void;
  prize: DatabaseItem | null;
  onCollect: () => void;
}

const WinModal = ({ isOpen, onClose, prize, onCollect }: WinModalProps) => {
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

  // Generate more specific descriptions based on prize name
  const getSpecificDescription = (prize: DatabaseItem) => {
    if (prize.name.includes('iPhone') || prize.name.includes('Celular')) {
      return `${prize.description || 'Smartphone premium'}. Produto novo, lacrado, com garantia oficial. Inclui carregador e fones de ouvido originais.`;
    }
    if (prize.name.includes('PlayStation') || prize.name.includes('Xbox')) {
      return `${prize.description || 'Console de última geração'}. Console completo com 1 controle, todos os cabos e 3 jogos grátis à sua escolha.`;
    }
    if (prize.name.includes('TV')) {
      return `${prize.description || 'Smart TV premium'}. Smart TV com tecnologia 4K, HDR, conectividade Wi-Fi e todas as principais plataformas de streaming.`;
    }
    if (prize.name.includes('Notebook') || prize.name.includes('PC')) {
      return `${prize.description || 'Computador de alta performance'}. Equipamento completo com Windows licenciado, pacote Office e suporte técnico de 1 ano.`;
    }
    if (prize.name.includes('Moto') || prize.name.includes('Bicicleta')) {
      return `${prize.description || 'Veículo em perfeito estado'}. Produto novo com documentação, seguro DPVAT e capacete de brinde.`;
    }
    if (prize.name.includes('Viagem')) {
      return `${prize.description || 'Pacote de viagem completo'}. Pacote completo com passagens aéreas, hospedagem, café da manhã e transfer aeroporto.`;
    }
    if (prize.name.includes('PIX') || prize.name.includes('Dinheiro')) {
      return `${prize.description || 'Valor em dinheiro'}. Valor depositado em até 24 horas na sua conta bancária via PIX.`;
    }
    return `${prize.description || 'Produto premium'}. Produto original, novo e com garantia. Entrega realizada em todo território nacional.`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-gradient-to-br from-card via-card to-card/90 border-primary/30 backdrop-blur-sm">
        <div className="text-center py-8 relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-muted-foreground hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Celebration Animation */}
          <div className={`mb-6 ${isAnimating ? 'animate-bounce' : ''}`}>
            <div className={`w-28 h-28 mx-auto rounded-full bg-gradient-to-br ${rarityColors[prize.rarity]} 
              flex items-center justify-center mb-4 ${isAnimating ? 'pulse-gold' : ''}`}>
              <Trophy className="w-14 h-14 text-white" />
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

          {/* Congratulations Text */}
          <h2 className={`text-4xl font-bold text-primary mb-4 ${isAnimating ? 'animate-bounce' : ''}`}>
            🎉 PARABÉNS! 🎉
          </h2>
          
          <p className="text-lg text-muted-foreground mb-6">
            Você ganhou um prêmio incrível!
          </p>

          {/* Prize Details */}
          <div className="bg-secondary/50 rounded-lg p-6 mb-6 border border-primary/20">
            {prize.image_url && (
              <img 
                src={prize.image_url} 
                alt={prize.name}
                className="w-24 h-24 mx-auto mb-4 rounded-lg object-contain"
              />
            )}
            
            <h3 className="text-2xl font-bold text-primary mb-3">
              {prize.name}
            </h3>
            
            {/* More specific description */}
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              {getSpecificDescription(prize)}
            </p>
            
            <div className="flex justify-center items-center space-x-2 mb-3">
              <Badge 
                variant="secondary" 
                className={`bg-gradient-to-r ${rarityColors[prize.rarity]} text-white`}
              >
                {rarityLabels[prize.rarity]}
              </Badge>
              <Badge variant="outline" className="text-primary border-primary">
                R$ {Number(prize.base_value).toFixed(2)}
              </Badge>
            </div>
          </div>

          {/* Single Action Button */}
          <div className="space-y-3">
            <Button 
              onClick={onCollect}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold hover:opacity-90 py-3"
            >
              <Gift className="w-4 h-4 mr-2" />
              Fechar
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
