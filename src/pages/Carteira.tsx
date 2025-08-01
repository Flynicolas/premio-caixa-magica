
import { useState } from 'react';
import { useWallet } from '@/hooks/useWalletProvider';
import { useInventory } from '@/hooks/useInventory';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  Plus, 
  Clock, 
  CreditCard, 
  Gift,
  ArrowLeft,
  Package,
  Truck,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PaymentModal from '@/components/PaymentModal';

const Carteira = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { walletData, transactions, loading } = useWallet();
  const { userItems } = useInventory();
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);

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

  const availablePrizes = userItems.filter(item => !item.is_redeemed).length;

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
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-primary/5">
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

      {/* Navigation Shortcuts */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4">Acesso Rápido</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card 
            className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30 hover:border-primary/50 transition-all cursor-pointer group"
            onClick={() => navigate('/premios')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Gift className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h4 className="font-semibold text-primary">Meus Prêmios</h4>
                  <p className="text-sm text-muted-foreground">
                    {availablePrizes} prêmios disponíveis
                  </p>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Card>

          <Card 
            className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30 hover:border-blue-500/50 transition-all cursor-pointer group"
            onClick={() => navigate('/entregas')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-400">Minhas Entregas</h4>
                  <p className="text-sm text-muted-foreground">
                    Acompanhar resgates
                  </p>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-blue-400 transition-colors" />
            </div>
          </Card>
        </div>
      </div>

      {/* History Section - Main Focus */}
      <div className="mb-8">
        <div className="mb-4">
          <h3 className="text-xl font-bold mb-2 text-primary">Histórico de Transações</h3>
          <p className="text-muted-foreground text-sm">Acompanhe todas as movimentações da sua carteira</p>
        </div>
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <Card className="p-8 text-center bg-secondary/20 border-primary/10">
              <Clock className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Sem histórico</h3>
              <p className="text-muted-foreground">Suas transações aparecerão aqui</p>
            </Card>
          ) : (
            transactions.slice(0, 5).map((transaction) => (
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
          {transactions.length > 5 && (
            <Button 
              variant="outline" 
              onClick={() => navigate('/carteira')}
              className="w-full"
            >
              Ver todas as transações
            </Button>
          )}
        </div>
      </div>

      {/* Modals */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
      />
      </div>
    </div>
  );
};

export default Carteira;
