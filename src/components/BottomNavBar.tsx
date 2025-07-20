import { useState } from 'react';
import { Eye, EyeOff, Wallet, User, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { useIsMobile } from '@/hooks/use-mobile';

interface BottomNavBarProps {
  onAddBalance: () => void;
}

const BottomNavBar = ({ onAddBalance }: BottomNavBarProps) => {
  const [showBalance, setShowBalance] = useState(true);
  const { user } = useAuth();
  const { walletData } = useWallet();
  const isAuthenticated = !!user;
  const balance = walletData?.balance || 0;
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Só mostrar no mobile e quando usuário estiver logado
  if (!isMobile || !isAuthenticated) {
    return null;
  }

  const formatBalance = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-background/95 via-background/98 to-background/95 backdrop-blur-xl border-t border-white/10 px-4 py-3 shadow-2xl">
      <div className="flex items-center justify-between max-w-sm mx-auto">
        {/* Saldo com botão de esconder */}
        <div className="flex items-center space-x-2">
          <div className="text-sm">
            <span className="text-muted-foreground block text-xs">Saldo</span>
            <span className="font-bold text-primary">
              {showBalance ? formatBalance(balance) : '••••••'}
            </span>
          </div>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="p-1.5 rounded-full bg-primary/20 hover:bg-primary/30 transition-colors"
          >
            {showBalance ? 
              <Eye className="w-4 h-4 text-primary" /> : 
              <EyeOff className="w-4 h-4 text-primary" />
            }
          </button>
        </div>

        {/* Botão Adicionar Saldo */}
        <button
          onClick={onAddBalance}
          className="flex items-center space-x-2 bg-gradient-to-r from-primary to-primary/80 text-black px-4 py-2 rounded-full font-medium hover:scale-105 transition-all duration-200 shadow-lg"
        >
          <Wallet className="w-4 h-4" />
          <span className="text-sm">Adicionar</span>
        </button>

        {/* Atalhos Perfil/Configurações */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => navigate('/perfil')}
            className="p-2 rounded-full bg-primary/20 hover:bg-primary/30 transition-colors"
          >
            <User className="w-4 h-4 text-primary" />
          </button>
          <button
            onClick={() => navigate('/configuracoes')}
            className="p-2 rounded-full bg-primary/20 hover:bg-primary/30 transition-colors"
          >
            <Settings className="w-4 h-4 text-primary" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BottomNavBar;