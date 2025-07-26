
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useInventory } from '@/hooks/useInventory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Gift, Star, Trophy } from 'lucide-react';
import { useRedemptionFlow } from '@/hooks/useRedemptionFlow';
import RedemptionModal from '@/components/RedemptionModal';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import RedeemButton from '@/components/RedeemButton';
import Cookies from "js-cookie";

const MeusPremios = () => {
  const { user } = useAuth();
  const { userItems, loading } = useInventory();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [selectedPrize, setSelectedPrize] = useState<any>(null);
  const [showRedemptionModal, setShowRedemptionModal] = useState(false);
  const { isProcessing } = useRedemptionFlow();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-white">Carregando seus prêmios...</p>
        </div>
      </div>
    );
  }

  const totalPrizes = userItems.length;
  const redeemedPrizes = userItems.filter(item => item.is_redeemed).length;
  const availablePrizes = totalPrizes - redeemedPrizes;

  const rarityStats = userItems.reduce((acc, item) => {
    const rarity = item.item?.rarity || 'common';
    acc[rarity] = (acc[rarity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleRedeemPrize = (userItem: any) => {
    setSelectedPrize(userItem);
    setShowRedemptionModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">Meus Prêmios</h1>
          <p className="text-lg text-muted-foreground">Gerencie e resgate seus prêmios conquistados</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-500/30">
            <CardContent className="p-6 text-center">
              <Trophy className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-300">{totalPrizes}</div>
              <div className="text-sm text-muted-foreground">Total de Prêmios</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-500/30">
            <CardContent className="p-6 text-center">
              <Gift className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-300">{availablePrizes}</div>
              <div className="text-sm text-muted-foreground">Disponíveis</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-500/30">
            <CardContent className="p-6 text-center">
              <Package className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-300">{redeemedPrizes}</div>
              <div className="text-sm text-muted-foreground">Resgatados</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 border-yellow-500/30">
            <CardContent className="p-6 text-center">
              <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-300">{rarityStats.legendary || 0}</div>
              <div className="text-sm text-muted-foreground">Lendários</div>
            </CardContent>
          </Card>
        </div>

        {/* Prizes Grid */}
        <Card className="bg-card/50 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-6 h-6 text-primary" />
              Seus Prêmios Conquistados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userItems.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum prêmio ainda</h3>
                <p className="text-muted-foreground mb-4">
                  Abra alguns baús para conquistar prêmios incríveis!
                </p>
                <Button 
                  onClick={() => navigate('/premios')}
                  className="bg-primary hover:bg-primary/90"
                >
                  Ir para Prêmios
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {userItems.map((userItem, index) => (
                  <Card key={index} className="bg-gradient-to-br from-zinc-800/50 via-zinc-900/50 to-black/50 border-zinc-700/50 hover:border-zinc-600/50 transition-all group">
                    <CardContent className="p-4">
                      <div className="relative mb-4">
                        <img
                          src={userItem.item?.image_url || '/placeholder.png'}
                          alt={userItem.item?.name}
                          className="w-full h-24 md:h-32 object-contain rounded-md drop-shadow-lg"
                        />
                        
                        {/* Rarity indicator */}
                        <Badge
                          className={`absolute top-2 right-2 px-2 py-1 text-xs font-semibold ${
                            userItem.item?.rarity === 'legendary'
                              ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black'
                              : userItem.item?.rarity === 'epic'
                              ? 'bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white'
                              : userItem.item?.rarity === 'rare'
                              ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white'
                              : 'bg-gradient-to-r from-gray-400 to-gray-600 text-white'
                          }`}
                        >
                          {userItem.item?.rarity}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-white truncate">
                            {userItem.item?.name || 'Item Desconhecido'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Ganho em {new Date(userItem.won_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>

                        <RedeemButton
                          isRedeemed={userItem.is_redeemed}
                          isProcessing={isProcessing && selectedPrize?.id === userItem.id}
                          onClick={() => handleRedeemPrize(userItem)}
                          className="w-full"
                          inventoryId={userItem.id}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <RedemptionModal
          isOpen={showRedemptionModal}
          onClose={() => {
            setShowRedemptionModal(false);
            setSelectedPrize(null);
          }}
          item={selectedPrize}
        />
      </div>
    </div>
  );
};

export default MeusPremios;
