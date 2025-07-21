
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useInventory } from '@/hooks/useInventory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Gift, Star, Trophy, Clock } from 'lucide-react';
import { useWithdrawItem } from '@/hooks/useWithdrawItem';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Cookies from "js-cookie";

const MeusPremios = () => {
  const { user } = useAuth();
  const { userItems, loading } = useInventory();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [selectedPrize, setSelectedPrize] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { solicitarRetirada } = useWithdrawItem();

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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {userItems.map((userItem, index) => (
                  <Card key={index} className="bg-gradient-to-br from-zinc-800/50 via-zinc-900/50 to-black/50 border-zinc-700/50 hover:border-zinc-600/50 transition-all group">
                    <CardContent className="p-4">
                      <div className="relative mb-4">
                        <img
                          src={userItem.item?.image_url || '/placeholder.png'}
                          alt={userItem.item?.name}
                          className="w-full h-32 object-contain rounded-md drop-shadow-lg"
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

                        {userItem.is_redeemed ? (
                          <div className="flex items-center gap-2 text-green-400">
                            <Package className="w-4 h-4" />
                            <span className="text-sm font-medium">Resgatado</span>
                          </div>
                        ) : (
                          <Button
                            onClick={() => setSelectedPrize(userItem)}
                            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-semibold"
                          >
                            <Gift className="w-4 h-4 mr-2" />
                            Resgatar Prêmio
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Withdrawal Modal */}
        {selectedPrize && (
          <Dialog open={true} onOpenChange={() => setSelectedPrize(null)}>
            <DialogContent className="bg-card border border-yellow-400/50 max-w-md">
              <DialogHeader>
                <DialogTitle className="text-center">Confirmar Retirada</DialogTitle>
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

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <p className="text-sm text-center mb-2">
                    Para receber seu prêmio, é necessário pagar a taxa de entrega de
                  </p>
                  <p className="text-2xl font-bold text-yellow-400 text-center">R$ 25,00</p>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Após o pagamento, sua entrega será iniciada. Você poderá acompanhar o status na área <strong>Minhas Entregas</strong>.
                </p>

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

                      await solicitarRetirada({
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
                      });

                      setSelectedPrize(null);
                    } catch (error) {
                      toast({
                        title: "Erro ao solicitar retirada",
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
                      <Gift className="w-4 h-4 mr-2" />
                      Retirar meu prêmio
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default MeusPremios;
