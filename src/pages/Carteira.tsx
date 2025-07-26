
import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useInventory } from '@/hooks/useInventory';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wallet, 
  Plus, 
  Trophy, 
  Clock, 
  CreditCard, 
  Gift,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PaymentModal from '@/components/PaymentModal';
import { useToast } from '@/hooks/use-toast';
import { useRedemptionFlow } from '@/hooks/useRedemptionFlow';
import RedemptionModal from '@/components/RedemptionModal';
import { useProfile } from '@/hooks/useProfile';
import Cookies from 'js-cookie';

const Carteira = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { walletData, transactions, loading } = useWallet();
  const { userItems } = useInventory();
  const { toast } = useToast();
  const { profile } = useProfile();
  const { isProcessing } = useRedemptionFlow();
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<any>(null);
  const [showRedemptionModal, setShowRedemptionModal] = useState(false);

  const quickAmounts = [10, 25, 50, 100, 200];
  const balance = walletData?.balance || 0;

  const rarityColors = {
    common: "from-gray-400 to-gray-600",
    rare: "from-blue-400 to-blue-600", 
    epic: "from-purple-400 to-purple-600",
    legendary: "from-yellow-400 to-orange-500",
  };

  const chestColors = {
    silver: "text-gray-400",
    gold: "text-yellow-500",
    diamond: "text-cyan-400",
    ruby: "text-red-400",
    premium: "text-purple-400",
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case "deposit": return "text-green-500";
      case "withdrawal": return "text-red-500";
      case "purchase": return "text-orange-500";
      case "prize": return "text-purple-500";
      default: return "text-muted-foreground";
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit": return "+";
      case "withdrawal": return "-";
      case "purchase": return "🛒";
      case "prize": return "🏆";
      default: return "•";
    }
  };

  const handlePrizeWithdraw = (prize: any) => {
    setSelectedPrize(prize);
    setShowRedemptionModal(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <Wallet className="w-6 h-6 text-black" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Minha Carteira
            </h1>
          </div>
        </div>
      </div>

      {/* Balance Card */}
      <Card className="p-6 mb-8 bg-gradient-to-br from-primary/10 via-secondary/50 to-primary/5 border-2 border-primary/30 shadow-xl">
        <div className="text-center">
          <div className="w-20 h-20 gold-gradient rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl ring-4 ring-primary/20">
            <Wallet className="w-10 h-10 text-black" />
          </div>
          <h2 className="text-4xl font-bold text-yellow-400 mb-3">
            {balance.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </h2>
          <p className="text-muted-foreground text-lg mb-4">Saldo Disponível</p>
          <div className="px-4 py-2 bg-primary/10 rounded-full inline-block">
            <span className="text-sm text-primary font-medium">💰 Carteira Ativa</span>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          {quickAmounts.map((amount) => (
            <Button
              key={amount}
              variant="outline"
              onClick={() => setShowPaymentModal(true)}
              className="h-12 border-2 border-primary/30 hover:border-primary hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/20 transition-all duration-200 font-semibold"
            >
              R$ {amount}
            </Button>
          ))}
        </div>
        <Button
          onClick={() => setShowPaymentModal(true)}
          className="w-full gold-gradient text-black font-bold hover:opacity-90 h-14 text-lg shadow-lg transition-all duration-200 hover:shadow-xl"
        >
          <Plus className="w-5 h-5 mr-2" />
          Adicionar Saldo
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="prizes" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-secondary to-secondary/80 p-1 rounded-xl border border-primary/20">
          <TabsTrigger
            value="prizes"
            className="flex items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-white rounded-lg transition-all duration-200"
          >
            <Trophy className="w-4 h-4 mr-2" />
            Prêmios ({userItems.length})
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="flex items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-white rounded-lg transition-all duration-200"
          >
            <Clock className="w-4 h-4 mr-2" />
            Histórico
          </TabsTrigger>
        </TabsList>

        {/* Prizes Tab */}
        <TabsContent value="prizes" className="mt-6">
          <div className="space-y-4">
            {userItems.length === 0 ? (
              <div className="text-center py-12">
                <Gift className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum prêmio ainda</h3>
                <p className="text-muted-foreground">Abra baús para conquistar prêmios incríveis!</p>
              </div>
            ) : (
              userItems.map((item, index) => (
                <Card key={index} className="p-4 bg-secondary/30 border border-primary/10 rounded-xl shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <img
                      src={item.item?.image_url || '/placeholder.svg'}
                      alt={item.item?.name || 'Prêmio'}
                      className="w-16 h-16 rounded-md object-cover border border-border shadow-sm flex-shrink-0"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground capitalize">{item.item?.name}</h4>
                        <Badge className={`px-2 py-0.5 text-xs rounded-full bg-gradient-to-r ${rarityColors[item.rarity as keyof typeof rarityColors]} text-white capitalize`}>
                          {item.rarity}
                        </Badge>
                      </div>
                      <div className="flex flex-col text-sm text-muted-foreground">
                        <span className="font-medium text-primary">R$ {item.item?.base_value?.toFixed(2)}</span>
                        <span className="text-xs">Ganho em {new Date(item.won_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                     <Button
                       size="sm"
                       onClick={() => handlePrizeWithdraw(item)}
                       className="gold-gradient text-black font-bold hover:opacity-90 h-9 rounded-md px-4 text-sm"
                     >
                       Resgatar
                     </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="mt-6">
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Sem histórico</h3>
                <p className="text-muted-foreground">Suas transações aparecerão aqui</p>
              </div>
            ) : (
              transactions.map((transaction) => (
                <Card key={transaction.id} className="p-4 bg-secondary/20 border-primary/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                        transaction.type === "deposit" ? "bg-green-500/20" :
                        transaction.type === "purchase" ? "bg-orange-500/20" : "bg-gray-500/20"
                      }`}>
                        <span className={getTransactionTypeColor(transaction.type)}>
                          {getTransactionIcon(transaction.type)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium">{transaction.description}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleDateString()} às{" "}
                          {new Date(transaction.created_at).toLocaleTimeString()}
                        </p>
                        <Badge variant={transaction.status === "completed" ? "default" : "secondary"} className="text-xs mt-1">
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold ${getTransactionTypeColor(transaction.type)}`}>
                        {transaction.type === "deposit" ? "+" : "-"}R$ {transaction.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <RedemptionModal
        isOpen={showRedemptionModal}
        onClose={() => {
          setShowRedemptionModal(false);
          setSelectedPrize(null);
        }}
        item={selectedPrize}
        onAddBalance={() => setShowPaymentModal(true)}
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
      />
    </div>
  );
};

export default Carteira;
