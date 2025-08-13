
import { useWallet } from '@/hooks/useWalletProvider';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WalletTabs } from '@/components/wallet/WalletTabs';
import { 
  Wallet, 
  ArrowLeft
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Carteira = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { walletData, loading } = useWallet();
  
  // Get initial tab from URL params
  const initialTab = searchParams.get('tab') || 'deposit';
  
  const balance = walletData?.balance || 0;

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
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 md:mb-8">
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
            <div className="hidden md:flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <Wallet className="w-6 h-6 text-black" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Minha Carteira
              </h1>
            </div>
            <h1 className="md:hidden text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Carteira
            </h1>
          </div>
        </div>

        {/* Mobile: Wallet Tabs First */}
        <div className="md:hidden mb-6">
          <WalletTabs initialTab={initialTab} />
        </div>

        {/* Mobile: Compact Balance Card */}
        <Card className="md:hidden p-4 mb-6 bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Wallet className="w-4 h-4 text-black" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Saldo</p>
                <h2 className="text-lg font-bold text-yellow-400">
                  {balance.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </h2>
              </div>
            </div>
            <div className="px-3 py-1 bg-primary/10 rounded-full">
              <span className="text-xs text-primary font-medium">Ativa</span>
            </div>
          </div>
        </Card>

        {/* Desktop: Balance Card */}
        <Card className="hidden md:block p-6 mb-8 bg-gradient-to-br from-primary/10 via-secondary/50 to-primary/5 border-2 border-primary/30 shadow-xl">
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

        {/* Desktop: Wallet Tabs */}
        <div className="hidden md:block">
          <WalletTabs initialTab={initialTab} />
        </div>
      </div>
    </div>
  );
};

export default Carteira;
