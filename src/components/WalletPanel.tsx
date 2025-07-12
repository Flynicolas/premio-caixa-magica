
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, Plus, Trophy, Gift, Clock, CreditCard } from 'lucide-react';
import { Prize, ChestType } from '@/data/chestData';
import { useState } from 'react';
import PaymentModal from './PaymentModal';
import { useWallet } from '@/hooks/useWallet';

interface WalletPanelProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  prizes: (Prize & { chestType: ChestType, timestamp: Date })[];
  onAddBalance?: (amount: number) => void;
}

const WalletPanel = ({ isOpen, onClose, balance, prizes }: WalletPanelProps) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { transactions } = useWallet();

  const quickAmounts = [10, 25, 50, 100, 200];

  const handleAddBalance = (amount: number) => {
    setShowPaymentModal(true);
  };

  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-orange-500'
  };

  const chestColors = {
    silver: 'text-gray-400',
    gold: 'text-yellow-500',
    diamond: 'text-cyan-400',
    ruby: 'text-red-400',
    premium: 'text-purple-400'
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'deposit': return 'text-green-500';
      case 'withdrawal': return 'text-red-500';
      case 'purchase': return 'text-orange-500';
      case 'prize': return 'text-purple-500';
      default: return 'text-muted-foreground';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return '+';
      case 'withdrawal': return '-';
      case 'purchase': return '🛒';
      case 'prize': return '🏆';
      default: return '•';
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden bg-gradient-to-br from-card via-card/95 to-card/90 border-2 border-primary/30 shadow-2xl">
          <DialogHeader className="pb-6 border-b border-primary/20">
            <DialogTitle className="flex items-center text-3xl gold-gradient bg-clip-text text-transparent">
              <div className="w-10 h-10 gold-gradient rounded-full flex items-center justify-center mr-3 shadow-lg">
                <Wallet className="w-6 h-6 text-black" />
              </div>
              Minha Carteira Premium
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="balance" className="w-full mt-6">
            <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-secondary to-secondary/80 p-1 rounded-xl border border-primary/20">
              <TabsTrigger value="balance" className="flex items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-white rounded-lg transition-all duration-200">
                <CreditCard className="w-4 h-4 mr-2" />
                Saldo
              </TabsTrigger>
              <TabsTrigger value="prizes" className="flex items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-white rounded-lg transition-all duration-200">
                <Trophy className="w-4 h-4 mr-2" />
                Prêmios ({prizes.length})
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-white rounded-lg transition-all duration-200">
                <Clock className="w-4 h-4 mr-2" />
                Histórico
              </TabsTrigger>
            </TabsList>

            {/* Balance Tab */}
            <TabsContent value="balance" className="space-y-6 mt-6">
              <Card className="p-8 bg-gradient-to-br from-primary/10 via-secondary/50 to-primary/5 border-2 border-primary/30 shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-transparent"></div>
                <div className="relative text-center">
                  <div className="w-20 h-20 gold-gradient rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl ring-4 ring-primary/20">
                    <Wallet className="w-10 h-10 text-black" />
                  </div>
                  <h3 className="text-4xl font-bold gold-gradient bg-clip-text text-transparent mb-3">
                    R$ {balance.toFixed(2)}
                  </h3>
                  <p className="text-muted-foreground text-lg">Saldo Disponível</p>
                  <div className="mt-4 px-4 py-2 bg-primary/10 rounded-full inline-block">
                    <span className="text-sm text-primary font-medium">💰 Carteira Premium Ativa</span>
                  </div>
                </div>
              </Card>

              <div className="space-y-6">
                <div className="text-center">
                  <h4 className="font-bold text-xl mb-2">Recarregar Carteira</h4>
                  <p className="text-muted-foreground">Escolha um valor rápido ou personalize</p>
                </div>
                
                <div className="grid grid-cols-5 gap-3">
                  {quickAmounts.map(amount => (
                    <Button
                      key={amount}
                      variant="outline"
                      onClick={() => handleAddBalance(amount)}
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
                  Valor Personalizado
                </Button>

                <div className="bg-gradient-to-r from-secondary/50 to-secondary/30 p-4 rounded-xl border border-primary/20">
                  <p className="text-sm text-center font-medium">
                    🔒 Pagamento 100% Seguro
                  </p>
                  <p className="text-xs text-muted-foreground text-center mt-1">
                    PIX instantâneo • Cartão • Boleto via Mercado Pago
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Prizes Tab */}
            <TabsContent value="prizes" className="space-y-4">
              <div className="max-h-96 overflow-y-auto space-y-3">
                {prizes.length === 0 ? (
                  <div className="text-center py-12">
                    <Gift className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum prêmio ainda</h3>
                    <p className="text-muted-foreground">
                      Abra baús para conquistar prêmios incríveis!
                    </p>
                  </div>
                ) : (
                  prizes.map((prize, index) => (
                    <Card key={index} className="p-4 bg-secondary/30 border-primary/10">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={prize.image} 
                          alt={prize.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold">{prize.name}</h4>
                            <Badge 
                              variant="secondary" 
                              className={`bg-gradient-to-r ${rarityColors[prize.rarity]} text-white text-xs`}
                            >
                              {prize.rarity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {prize.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-primary font-medium">
                              {prize.value}
                            </span>
                            <span className={`text-xs ${chestColors[prize.chestType]}`}>
                              Baú {prize.chestType}
                            </span>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          className="gold-gradient text-black font-bold hover:opacity-90"
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
            <TabsContent value="history" className="space-y-4">
              <div className="max-h-96 overflow-y-auto space-y-3">
                {transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Sem histórico</h3>
                    <p className="text-muted-foreground">
                      Suas transações aparecerão aqui
                    </p>
                  </div>
                ) : (
                  transactions.map((transaction) => (
                    <Card key={transaction.id} className="p-4 bg-secondary/20 border-primary/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                            transaction.type === 'deposit' ? 'bg-green-500/20' :
                            transaction.type === 'purchase' ? 'bg-orange-500/20' :
                            'bg-gray-500/20'
                          }`}>
                            <span className={getTransactionTypeColor(transaction.type)}>
                              {getTransactionIcon(transaction.type)}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium">{transaction.description}</h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(transaction.created_at).toLocaleDateString()} às {new Date(transaction.created_at).toLocaleTimeString()}
                            </p>
                            <Badge 
                              variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                              className="text-xs mt-1"
                            >
                              {transaction.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`font-bold ${getTransactionTypeColor(transaction.type)}`}>
                            {transaction.type === 'deposit' ? '+' : '-'}R$ {transaction.amount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
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
