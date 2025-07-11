
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
        <div className="text-center py-8">
          {/* Prize Title */}
          <h2 className="text-3xl font-bold text-primary mb-6">
            {prize.name}
          </h2>
          
          {/* Rarity Badge */}
          <div className="mb-8">
            <Badge 
              variant="secondary" 
              className={`bg-gradient-to-r ${rarityColors[prize.rarity]} text-white text-lg px-6 py-2`}
            >
              {rarityLabels[prize.rarity]}
            </Badge>
          </div>

          {/* Close Button */}
          <Button 
            onClick={onCollect}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold hover:opacity-90 py-3"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WinModal;
