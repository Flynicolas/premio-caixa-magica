
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Wallet, Plus, Trophy, Gift, Clock, CreditCard } from 'lucide-react';
import { Prize, ChestType } from '@/data/chestData';
import { useState } from 'react';

interface WalletPanelProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  prizes: (Prize & { chestType: ChestType, timestamp: Date })[];
  onAddBalance: (amount: number) => void;
}

const WalletPanel = ({ isOpen, onClose, balance, prizes, onAddBalance }: WalletPanelProps) => {
  const [addAmount, setAddAmount] = useState('');

  const handleAddBalance = () => {
    const amount = parseFloat(addAmount);
    if (amount > 0) {
      onAddBalance(amount);
      setAddAmount('');
    }
  };

  const quickAmounts = [10, 25, 50, 100, 200];

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden bg-card border-primary/20">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl gold-gradient bg-clip-text text-transparent">
            <Wallet className="w-6 h-6 mr-2 text-primary" />
            Minha Carteira
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="balance" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-secondary">
            <TabsTrigger value="balance" className="flex items-center">
              <CreditCard className="w-4 h-4 mr-2" />
              Saldo
            </TabsTrigger>
            <TabsTrigger value="prizes" className="flex items-center">
              <Trophy className="w-4 h-4 mr-2" />
              Prêmios ({prizes.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Histórico
            </TabsTrigger>
          </TabsList>

          {/* Balance Tab */}
          <TabsContent value="balance" className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-secondary to-secondary/50 border-primary/20">
              <div className="text-center">
                <div className="w-16 h-16 gold-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wallet className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-3xl font-bold text-primary mb-2">
                  R$ {balance.toFixed(2)}
                </h3>
                <p className="text-muted-foreground">Saldo Disponível</p>
              </div>
            </Card>

            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Adicionar Créditos</h4>
              
              <div className="grid grid-cols-5 gap-2">
                {quickAmounts.map(amount => (
                  <Button
                    key={amount}
                    variant="outline"
                    onClick={() => onAddBalance(amount)}
                    className="border-primary/20 hover:border-primary hover:bg-primary/10"
                  >
                    R$ {amount}
                  </Button>
                ))}
              </div>

              <div className="flex space-x-2">
                <Input
                  type="number"
                  placeholder="Valor personalizado"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  className="bg-secondary border-primary/20 focus:border-primary"
                />
                <Button 
                  onClick={handleAddBalance}
                  className="gold-gradient text-black font-bold hover:opacity-90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                💳 Pagamento via PIX, cartão ou transferência
              </p>
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
              {prizes.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Sem histórico</h3>
                  <p className="text-muted-foreground">
                    Suas atividades aparecerão aqui
                  </p>
                </div>
              ) : (
                prizes.map((prize, index) => (
                  <Card key={index} className="p-4 bg-secondary/20 border-primary/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 gold-gradient rounded-full flex items-center justify-center">
                          <Trophy className="w-5 h-5 text-black" />
                        </div>
                        <div>
                          <h4 className="font-medium">{prize.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {prize.timestamp.toLocaleDateString()} às {prize.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-primary border-primary">
                        {prize.value}
                      </Badge>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default WalletPanel;
