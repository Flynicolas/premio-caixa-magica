
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useInventory } from '@/hooks/useInventory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Gift, Star, Trophy, X } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useWithdrawItem } from '@/hooks/useWithdrawItem';
import RedeemButton from './RedeemButton';
import Cookies from "js-cookie";

interface MeusPremiosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MeusPremiosModal = ({ isOpen, onClose }: MeusPremiosModalProps) => {
  const { user } = useAuth();
  const { userItems, loading, refreshInventory } = useInventory();
  const { walletData, refreshData: refreshWallet, showPaymentModalForAmount, PaymentModalComponent } = useWallet();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [selectedPrize, setSelectedPrize] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { resgateComCarteira } = useWithdrawItem();

  if (!user) return null;

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-primary/30 max-w-5xl max-h-[90vh] overflow-y-auto">
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg text-white">Carregando seus prêmios...</p>
          </div>
        </DialogContent>
      </Dialog>
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

  const handleRedeemPrize = async (userItem: any) => {
    if (!user || !userItem) return;

    const fullName = profile?.full_name;
    const cpf = profile?.cpf;
    const addressComplete =
      profile?.zip_code &&
      profile?.street &&
      profile?.number &&
      profile?.neighborhood &&
      profile?.city &&
      profile?.state;

    if (!fullName || !cpf || !addressComplete) {
      toast({
        title: "Complete seu cadastro",
        description: "Você precisa informar nome completo, CPF e endereço para retirar prêmios.",
        variant: "destructive",
      });

      Cookies.set("redirected_from_retirada", "true", { path: "/" });
      onClose();
      navigate("/configuracoes");
      return;
    }

    if ((walletData?.balance || 0) < 25) {
      toast({
        title: "Saldo insuficiente",
        description: "Você precisa de R$ 25,00 para pagar a taxa de entrega.",
        variant: "destructive",
      });
      
      showPaymentModalForAmount(25);
      return;
    }

    try {
      setIsProcessing(true);
      setSelectedPrize(userItem);

      const result = await resgateComCarteira({
        itemId: userItem.item?.id,
        inventoryId: userItem.id,
        fullName,
        cpf,
        address: {
          zip_code: profile.zip_code,
          street: profile.street,
          number: profile.number,
          complement: profile.complement,
          neighborhood: profile.neighborhood,
          city: profile.city,
          state: profile.state,
        },
        userBalance: walletData?.balance || 0,
      });

      if (result.success) {
        await refreshInventory();
        await refreshWallet();
        setSelectedPrize(null);
      } else if (result.insufficientBalance) {
        toast({
          title: "Saldo insuficiente",
          description: "Você precisa de R$ 25,00 para pagar a taxa de entrega.",
          variant: "destructive",
        });
        
        showPaymentModalForAmount(25);
      }

    } catch (error) {
      console.error('Erro ao solicitar retirada:', error);
      toast({
        title: "Erro ao solicitar retirada",
        description: "Tente novamente em instantes.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-primary/30 max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-primary">Meus Prêmios</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-500/30">
              <CardContent className="p-4 text-center">
                <Trophy className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-blue-300">{totalPrizes}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-500/30">
              <CardContent className="p-4 text-center">
                <Gift className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-green-300">{availablePrizes}</div>
                <div className="text-xs text-muted-foreground">Disponíveis</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-500/30">
              <CardContent className="p-4 text-center">
                <Package className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-purple-300">{redeemedPrizes}</div>
                <div className="text-xs text-muted-foreground">Resgatados</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 border-yellow-500/30">
              <CardContent className="p-4 text-center">
                <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-yellow-300">{rarityStats.legendary || 0}</div>
                <div className="text-xs text-muted-foreground">Lendários</div>
              </CardContent>
            </Card>
          </div>

          {/* Prizes Grid */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Seus Prêmios Conquistados
            </h3>
            
            {userItems.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum prêmio ainda</h3>
                <p className="text-muted-foreground mb-4">
                  Abra alguns baús para conquistar prêmios incríveis!
                </p>
                <Button 
                  onClick={() => {
                    onClose();
                    navigate('/premios');
                  }}
                  className="bg-primary hover:bg-primary/90"
                >
                  Ir para Prêmios
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {userItems.map((userItem, index) => (
                  <Card key={index} className="bg-gradient-to-br from-zinc-800/50 via-zinc-900/50 to-black/50 border-zinc-700/50 hover:border-zinc-600/50 transition-all">
                    <CardContent className="p-4">
                      <div className="relative mb-4">
                        <img
                          src={userItem.item?.image_url || '/placeholder.png'}
                          alt={userItem.item?.name}
                          className="w-full h-24 object-contain rounded-md drop-shadow-lg"
                        />
                        
                        {/* Rarity indicator */}
                        <Badge
                          className={`absolute top-1 right-1 px-2 py-1 text-xs font-semibold ${
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
                          <h3 className="font-semibold text-white truncate text-sm">
                            {userItem.item?.name || 'Item Desconhecido'}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            Ganho em {new Date(userItem.won_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>

                        <RedeemButton
                          isRedeemed={userItem.is_redeemed}
                          isProcessing={isProcessing && selectedPrize?.id === userItem.id}
                          onClick={() => handleRedeemPrize(userItem)}
                          size="sm"
                          className="w-full"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <PaymentModalComponent />
    </>
  );
};

export default MeusPremiosModal;
