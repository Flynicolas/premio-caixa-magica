
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wallet, 
  Plus, 
  TrendingUp, 
  CreditCard, 
  History, 
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  X
} from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import PaymentModal from './PaymentModal';

interface WalletPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const WalletPanel = ({ isOpen, onClose }: WalletPanelProps) => {
  const { walletData, transactions } = useWallet();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getTransactionIcon = (type: string) => {
    return type === 'deposit' ? (
      <ArrowUpRight className="w-4 h-4 text-green-500" />
    ) : (
      <ArrowDownLeft className="w-4 h-4 text-red-500" />
    );
  };

  const getTransactionColor = (type: string) => {
    return type === 'deposit' ? 'text-green-500' : 'text-red-500';
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-full sm:max-w-2xl lg:max-w-4xl w-full mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto bg-gradient-to-br from-card via-card/95 to-card/90 border-primary/20 backdrop-blur-sm">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-primary/20">
            <DialogTitle className="flex items-center text-xl sm:text-2xl text-primary font-bold">
              <div className="w-8 h-8 sm:w-10 sm:h-10 mr-3 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              Minha Carteira
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 sm:h-10 sm:w-10"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </DialogHeader>

          <div className="space-y-6 sm:space-y-8 py-4 sm:py-6">
            {/* Balance Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20 hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm sm:text-base font-medium text-green-400 flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Saldo Atual
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-500">
                    {formatCurrency(walletData?.balance || 0)}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                    Disponível para usar
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20 hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm sm:text-base font-medium text-blue-400 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Total Depositado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-500">
                    {formatCurrency(walletData?.total_deposited || 0)}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                    Valor total adicionado
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20 hover:shadow-lg transition-all duration-200 sm:col-span-2 lg:col-span-1">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm sm:text-base font-medium text-purple-400 flex items-center">
                    <ArrowDownLeft className="w-4 h-4 mr-2" />
                    Total Gasto
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-500">
                    {formatCurrency(walletData?.total_spent || 0)}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                    Investido em baús
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Action Button */}
            <div className="flex justify-center">
              <Button
                onClick={() => setShowPaymentModal(true)}
                className="w-full sm:w-auto gold-gradient text-black font-bold hover:opacity-90 h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg touch-manipulation"
              >
                <Plus className="w-5 h-5 mr-2" />
                Adicionar Saldo
              </Button>
            </div>

            {/* Transactions */}
            <Tabs defaultValue="transactions" className="w-full">
              <TabsList className="grid grid-cols-1 sm:grid-cols-2 w-full mb-6">
                <TabsTrigger value="transactions" className="h-12 text-sm sm:text-base">
                  <History className="w-4 h-4 mr-2" />
                  Histórico
                </TabsTrigger>
                <TabsTrigger value="stats" className="h-12 text-sm sm:text-base">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Estatísticas
                </TabsTrigger>
              </TabsList>

              <TabsContent value="transactions" className="space-y-4">
                <div className="max-h-60 sm:max-h-80 overflow-y-auto space-y-3">
                  {transactions && transactions.length > 0 ? (
                    transactions.slice(0, 10).map((transaction) => (
                      <Card key={transaction.id} className="bg-secondary/20 border-secondary/30 hover:bg-secondary/30 transition-colors">
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {getTransactionIcon(transaction.type)}
                              <div className="min-w-0 flex-1">
                                <p className="text-sm sm:text-base font-medium text-foreground truncate">
                                  {transaction.description || 
                                    (transaction.type === 'deposit' ? 'Depósito' : 'Pagamento')}
                                </p>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                  {new Date(transaction.created_at).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`text-sm sm:text-base font-bold ${getTransactionColor(transaction.type)}`}>
                                {transaction.type === 'deposit' ? '+' : '-'}
                                {formatCurrency(Math.abs(transaction.amount))}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {transaction.status}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card className="bg-secondary/10 border-secondary/20">
                      <CardContent className="p-6 sm:p-8 text-center">
                        <CreditCard className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-sm sm:text-base text-muted-foreground">
                          Nenhuma transação encontrada
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="stats" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg text-orange-400">
                        Média por Transação
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl sm:text-2xl font-bold text-orange-500">
                        {formatCurrency(
                          transactions && transactions.length > 0
                            ? transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / transactions.length
                            : 0
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-cyan-500/20">
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg text-cyan-400">
                        Total de Transações
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl sm:text-2xl font-bold text-cyan-500">
                        {transactions?.length || 0}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
      />
    </>
  );
};

export default WalletPanel;
