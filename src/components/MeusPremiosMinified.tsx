
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useInventory } from '@/hooks/useInventory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Gift, Star, Trophy, Eye, Wallet } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import MeusPremiosModal from './MeusPremiosModal';

const MeusPremiosMinified = () => {
  const { user } = useAuth();
  const { userItems, loading } = useInventory();
  const { walletData } = useWallet();
  const [showModal, setShowModal] = useState(false);

  // Se não está logado, não mostrar nada
  if (!user) return null;

  if (loading) {
    return (
      <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30 max-w-6xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3"></div>
            <span className="text-white">Carregando seus prêmios...</span>
          </div>
        </CardContent>
      </Card>
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
    <>
      <section className="mb-12">
        <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30 max-w-6xl mx-auto">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-purple-400" />
                <span className="text-xl">Meus Prêmios Conquistados</span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowModal(true)}
                className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
              >
                <Eye className="w-4 h-4 mr-2" />
                Ver Todos
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="text-center bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                <div className="text-2xl font-bold text-blue-300">{totalPrizes}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
              <div className="text-center bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                <div className="text-2xl font-bold text-green-300">{availablePrizes}</div>
                <div className="text-sm text-muted-foreground">Disponíveis</div>
              </div>
              <div className="text-center bg-purple-500/10 rounded-lg p-3 border border-purple-500/20">
                <div className="text-2xl font-bold text-purple-300">{redeemedPrizes}</div>
                <div className="text-sm text-muted-foreground">Resgatados</div>
              </div>
              <div className="text-center bg-yellow-500/10 rounded-lg p-3 border border-yellow-500/20">
                <div className="text-2xl font-bold text-yellow-300">{rarityStats.legendary || 0}</div>
                <div className="text-sm text-muted-foreground">Lendários</div>
              </div>
              <div className="text-center bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/20">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Wallet className="w-4 h-4 text-emerald-300" />
                </div>
                <div className="text-lg font-bold text-emerald-300">
                  R$ {(walletData?.balance || 0).toFixed(2).replace('.', ',')}
                </div>
                <div className="text-sm text-muted-foreground">Saldo</div>
              </div>
            </div>
            
            {/* Recent Prizes Preview */}
            {userItems.length > 0 ? (
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-3">Últimos Prêmios Conquistados</h4>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {userItems.slice(0, 8).map((userItem, index) => (
                    <div key={index} className="flex-shrink-0 w-20 h-20 bg-zinc-800/50 rounded-lg border border-zinc-700/50 flex items-center justify-center relative group">
                      <img
                        src={userItem.item?.image_url || '/placeholder.png'}
                        alt={userItem.item?.name}
                        className="w-16 h-16 object-contain drop-shadow-sm"
                      />
                      {!userItem.is_redeemed && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-zinc-800"></div>
                      )}
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <span className="text-xs text-white font-medium text-center px-1">
                          {userItem.item?.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="text-base font-semibold mb-2">Nenhum prêmio ainda</h3>
                <p className="text-sm text-muted-foreground">
                  Abra alguns baús para conquistar prêmios incríveis!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <MeusPremiosModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};

export default MeusPremiosMinified;
