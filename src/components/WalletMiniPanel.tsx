import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wallet, ArrowRight, Plus, RefreshCw } from "lucide-react";
import { useWallet } from "@/hooks/useWalletProvider";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface WalletMiniPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletMiniPanel = ({ isOpen, onClose }: WalletMiniPanelProps) => {
  const { walletData, transactions, refreshData } = useWallet();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const balance = walletData?.balance || 0;
  const recentTransactions = transactions.slice(0, 3);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
      toast({
        title: "Carteira atualizada!",
        description: "Dados atualizados com sucesso.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleOpenFullWallet = () => {
    onClose();
    navigate('/carteira');
  };

  const handleQuickDeposit = () => {
    onClose();
    navigate('/carteira?tab=deposit');
  };

  const handleQuickWithdraw = () => {
    onClose();
    navigate('/carteira?tab=withdraw');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gradient-to-br from-card via-card/95 to-card/90 border-2 border-primary/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Wallet className="w-4 h-4 text-black" />
            </div>
            Carteira Rápida
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Balance Display */}
          <Card className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <h3 className="text-2xl font-bold text-yellow-400">
                  {balance.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="h-6 w-6 p-0 hover:bg-primary/10"
                >
                  <RefreshCw className={`h-3 w-3 text-yellow-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">Saldo Disponível</p>
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleQuickDeposit}
              variant="outline"
              className="h-12 border-primary/30 hover:border-primary hover:bg-primary/10"
            >
              <Plus className="w-4 h-4 mr-2" />
              Depositar
            </Button>
            <Button
              onClick={handleQuickWithdraw}
              variant="outline"
              className="h-12 border-primary/30 hover:border-primary hover:bg-primary/10"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Sacar
            </Button>
          </div>

          {/* Recent Transactions */}
          {recentTransactions.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Últimas Transações</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {recentTransactions.map((transaction) => (
                  <Card key={transaction.id} className="p-2 bg-secondary/20 border-primary/10">
                    <div className="flex items-center justify-between text-xs">
                      <span className="truncate flex-1 mr-2">{transaction.description}</span>
                      <span className={`font-medium ${
                        transaction.type === 'deposit' ? 'text-green-500' : 
                        transaction.type === 'withdrawal' ? 'text-red-500' : 'text-orange-500'
                      }`}>
                        {transaction.type === 'deposit' ? '+' : '-'}R$ {Math.abs(transaction.amount).toFixed(2)}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Open Full Wallet Button */}
          <Button
            onClick={handleOpenFullWallet}
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-medium h-12"
          >
            <Wallet className="w-4 h-4 mr-2" />
            Abrir Carteira Completa
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};