
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useInventory } from '@/hooks/useInventory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Package, Gift, Star, Trophy, Clock, X, Wallet, Plus } from 'lucide-react';
import { useWithdrawItem } from '@/hooks/useWithdrawItem';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@/hooks/useWallet';
import Cookies from "js-cookie";

interface MeusPremiosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MeusPremiosModal = ({ isOpen, onClose }: MeusPremiosModalProps) => {
  const { user } = useAuth();
  const { userItems, loading, refreshUserItems } = useInventory();
  const { walletData, refreshData: refreshWallet, showPaymentModalForAmount, PaymentModalComponent } = useWallet();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [selectedPrize, setSelectedPrize] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { resgateComCarteira } = useWithdrawItem();

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl h-[80vh] bg-gradient-to-br from-gray-900 via-black to-gray-900">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-lg text-white">Carregando seus prêmios...</p>
            </div>
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

  const deliveryFee = 25.0;
  const currentBalance = walletData?.balance || 0;
  const balanceAfterRedemption = currentBalance - deliveryFee;
  const hasSufficientBalance = currentBalance >= deliveryFee;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl h-[90vh] bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary flex items-center justify-between">
              Meus Prêmios Conquistados
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto h-full space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

            {/* Wallet Balance Card */}
            {user && (
              <Card className="bg-gradient-to-br from-emerald-900/20 to-emerald-800/20 border-emerald-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Wallet className="w-6 h-6 text-emerald-400" />
                      <div>
                        <div className="text-lg font-bold text-emerald-300">
                          R$ {currentBalance.toFixed(2).replace('.', ',')}
                        </div>
                        <div className="text-xs text-muted-foreground">Saldo disponível</div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => showPaymentModalForAmount()}
                      className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Prizes Grid */}
            <div className="space-y-4">
              {userItems.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum prêmio ainda</h3>
                  <p className="text-muted-foreground mb-4">
                    Abra alguns baús para conquistar prêmios incríveis!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {userItems.map((userItem, index) => (
                    <Card key={index} className="bg-gradient-to-br from-zinc-800/50 via-zinc-900/50 to-black/50 border-zinc-700/50 hover:border-zinc-600/50 transition-all group">
                      <CardContent className="p-4">
                        <div className="relative mb-4">
                          <img
                            src={userItem.item?.image_url || '/placeholder.png'}
                            alt={userItem.item?.name}
                            className="w-full h-24 object-contain rounded-md drop-shadow-lg"
                          />
                          
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

                        <div className="space-y-2">
                          <div>
                            <h3 className="font-semibold text-white text-sm truncate">
                              {userItem.item?.name || 'Item Desconhecido'}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {new Date(userItem.won_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>

                          {userItem.is_redeemed ? (
                            <div className="flex items-center gap-2 text-green-400">
                              <Package className="w-3 h-3" />
                              <span className="text-xs font-medium">Resgatado</span>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => setSelectedPrize(userItem)}
                              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-semibold text-xs"
                            >
                              <Gift className="w-3 h-3 mr-1" />
                              Resgatar
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Withdrawal Modal */}
      {selectedPrize && (
        <Dialog open={true} onOpenChange={() => setSelectedPrize(null)}>
          <DialogContent className="bg-card border border-yellow-400/50 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center">Confirmar Resgate</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="text-center">
                <img
                  src={selectedPrize.item?.image_url || '/placeholder.png'}
                  alt={selectedPrize.item?.name}
                  className="w-24 h-24 object-contain mx-auto mb-4 drop-shadow-lg"
                />
                <h3 className="font-semibold text-lg mb-2">{selectedPrize.item?.name}</h3>
              </div>

              {/* Balance Information */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Saldo atual:</span>
                  <span className="font-semibold">R$ {currentBalance.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Taxa de entrega:</span>
                  <span className="font-semibold text-yellow-400">R$ {deliveryFee.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="border-t border-blue-500/20 pt-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span>Saldo após resgate:</span>
                    <span className={balanceAfterRedemption >= 0 ? 'text-green-400' : 'text-red-400'}>
                      R$ {balanceAfterRedemption.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Após o resgate, sua entrega será iniciada. Você poderá acompanhar o status na área <strong>Minhas Entregas</strong>.
              </p>

              {hasSufficientBalance ? (
                <Button
                  className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold"
                  disabled={isProcessing}
                  onClick={async () => {
                    if (!user || !selectedPrize) return;

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
                      navigate("/configuracoes");
                      return;
                    }

                    try {
                      setIsProcessing(true);

                      const result = await resgateComCarteira({
                        itemId: selectedPrize.item?.id,
                        inventoryId: selectedPrize.id,
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
                        userBalance: currentBalance
                      });

                      if (result.success) {
                        await refreshUserItems();
                        await refreshWallet();
                        setSelectedPrize(null);
                      } else if (result.insufficientBalance) {
                        toast({
                          title: "Saldo insuficiente",
                          description: "Adicione saldo à sua carteira para continuar.",
                          variant: "destructive",
                        });
                      }
                    } catch (error) {
                      toast({
                        title: "Erro ao processar resgate",
                        description: "Tente novamente em instantes.",
                        variant: "destructive",
                      });
                    } finally {
                      setIsProcessing(false);
                    }
                  }}
                >
                  {isProcessing ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4 mr-2" />
                      Resgatar por R$ {deliveryFee.toFixed(2).replace('.', ',')}
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  className="w-full bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-bold"
                  onClick={() => {
                    const missingAmount = deliveryFee - currentBalance;
                    showPaymentModalForAmount(missingAmount);
                    setSelectedPrize(null);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar R$ {(deliveryFee - currentBalance).toFixed(2).replace('.', ',')}
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      <PaymentModalComponent />
    </>
  );
};

export default MeusPremiosModal;
