
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Truck } from 'lucide-react';
import { DatabaseItem } from '@/types/database';
import { useNavigate } from 'react-router-dom';
import { DeliveryFormModal } from './DeliveryFormModal';

interface WinModalProps {
  isOpen: boolean;
  onClose: () => void;
  prize: DatabaseItem | null;
  onCollect: () => void;
}

const WinModal = ({ isOpen, onClose, prize, onCollect }: WinModalProps) => {
  const navigate = useNavigate();
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);

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

  const handleViewInventory = () => {
    onCollect();
    navigate('/perfil');
  };

  const handleDeliveryRequest = () => {
    setShowDeliveryForm(true);
  };

  const isPhysicalItem = prize.delivery_type === 'physical';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gradient-to-br from-card via-card to-card/90 border-primary/30 backdrop-blur-sm">
        <div className="text-center py-8 space-y-6">
          {/* Prize Title */}
          <h2 className="text-3xl font-bold text-primary">
            {prize.name}
          </h2>
          
          {/* Rarity Badge */}
          <Badge 
            variant="secondary" 
            className={`bg-gradient-to-r ${rarityColors[prize.rarity]} text-white text-lg px-6 py-2`}
          >
            {rarityLabels[prize.rarity]}
          </Badge>

          {/* Action Buttons */}
          <div className="space-y-3">
            {isPhysicalItem && (
              <Button 
                onClick={handleDeliveryRequest}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold hover:opacity-90 py-3"
              >
                <Truck className="w-4 h-4 mr-2" />
                Solicitar Entrega
              </Button>
            )}
            
            <Button 
              onClick={handleViewInventory}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold hover:opacity-90 py-3"
            >
              <Package className="w-4 h-4 mr-2" />
              Ver Inventário
            </Button>
            
            <Button 
              onClick={onCollect}
              variant="outline"
              className="w-full"
            >
              Fechar
            </Button>
          </div>
        </div>

        {/* Delivery Form Modal */}
        {prize && (
          <DeliveryFormModal
            isOpen={showDeliveryForm}
            onClose={() => setShowDeliveryForm(false)}
            item={{ id: prize.id, name: prize.name }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WinModal;
