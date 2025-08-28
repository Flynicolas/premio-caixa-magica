
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWalletProvider';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Settings, 
  LogOut, 
  Wallet, 
  Package, 
  Trophy,
  Gift,
  Shield,
  Menu,
  Plus
} from 'lucide-react';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { useInventory } from '@/hooks/useInventory';
import AdvancedAuthModal from './AdvancedAuthModal';
import WalletPanel from './WalletPanel';

const Header = () => {
  const { user, signOut } = useAuth();
  const { walletData } = useWallet();
  const { userItems } = useInventory();
  const { isAdmin } = useAdminCheck();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showWalletPanel, setShowWalletPanel] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getUserInitials = (email: string) => {
    return email.slice(0, 2).toUpperCase();
  };

  const balance = walletData?.balance || 0;

  // Mapear userItems para o formato esperado pelo WalletPanel
  const mappedPrizes = userItems.map(item => ({
    ...item.item,
    id: item.item?.id || '',
    name: item.item?.name || '',
    image: item.item?.image_url || '/placeholder.svg',
    value: `R$ ${item.item?.base_value?.toFixed(2) || '0,00'}`,
    rarity: item.rarity as 'common' | 'rare' | 'epic' | 'legendary',
    chestType: 'silver' as const,
    timestamp: new Date(item.won_at),
    itemId: item.item?.id || '',
    inventoryId: item.id
  }));

  return (
    <header className="bg-card border-b border-primary/20 sticky top-0 z-50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/0f37c024-1f08-4216-82c9-1583e7900501.png" 
              alt="Baú Premiado" 
              className="w-8 h-8 rounded-full"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Baú Premiado
            </span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-muted-foreground gold-hover font-medium">
              Início
            </Link>
            <Link to="/premios" className="text-muted-foreground gold-hover font-medium">
              Prêmios
            </Link>
            <Link to="/raspadinha" className="text-muted-foreground gold-hover font-medium">
              Raspadinha
            </Link>
            <Link to="/sobre" className="text-muted-foreground gold-hover font-medium">
              Sobre
            </Link>
            <Link to="/convidar" className="text-muted-foreground gold-hover font-medium">
              Convidar
            </Link>
          </nav>

          {/* Mobile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" align="end">
              <DropdownMenuItem asChild>
                <Link to="/" className="cursor-pointer">
                  Início
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/premios" className="cursor-pointer">
                  Prêmios
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/raspadinha" className="cursor-pointer">
                  Raspadinha
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/sobre" className="cursor-pointer">
                  Sobre
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/ranking" className="cursor-pointer">
                  Ranking
                </Link>
              </DropdownMenuItem>
              {user && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/perfil" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/carteira" className="cursor-pointer">
                      <Wallet className="mr-2 h-4 w-4" />
                      Carteira
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/meus-premios" className="cursor-pointer">
                      <Gift className="mr-2 h-4 w-4" />
                      Meus Prêmios
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Balance Display - Clickable */}
                <Button 
                  variant="ghost" 
                  className="hidden sm:flex items-center space-x-2 gold-gradient-subtle hover:gold-gradient-subtle border gold-border px-3 py-1 rounded-full h-auto"
                  onClick={() => navigate('/carteira')}
                >
                  <Wallet className="w-4 h-4 gold-text" />
                  <span className="text-sm font-bold gold-text">
                    R$ {balance.toFixed(2).replace('.', ',')}
                  </span>
                  <Plus className="w-3 h-3 gold-text ml-1" />
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.user_metadata?.avatar_url} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getUserInitials(user.email || '')}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-bold gold-text">{user.user_metadata?.full_name || user.email}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator className="gold-border" />
                    <DropdownMenuItem asChild>
                      <Link to="/perfil" className="cursor-pointer gold-hover">
                        <User className="mr-2 h-4 w-4 gold-text" />
                        <span className="font-medium">Perfil</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/carteira" className="cursor-pointer gold-hover">
                        <Wallet className="mr-2 h-4 w-4 gold-text" />
                        <span className="font-medium">Carteira</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/meus-premios" className="cursor-pointer gold-hover">
                        <Gift className="mr-2 h-4 w-4 gold-text" />
                        <span className="font-medium">Meus Prêmios</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/entregas" className="cursor-pointer gold-hover">
                        <Package className="mr-2 h-4 w-4 gold-text" />
                        <span className="font-medium">Minhas Entregas</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/configuracoes" className="cursor-pointer gold-hover">
                        <Settings className="mr-2 h-4 w-4 gold-text" />
                        <span className="font-medium">Configurações</span>
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator className="gold-border" />
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className="cursor-pointer gold-hover">
                            <Shield className="mr-2 h-4 w-4 gold-text" />
                            <span className="font-medium">Admin</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sair</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button 
                onClick={() => setShowAuthModal(true)}
                className="bg-primary hover:bg-primary/90"
              >
                Entrar
              </Button>
            )}
          </div>
        </div>
      </div>

      <AdvancedAuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />

      <WalletPanel 
        isOpen={showWalletPanel} 
        onClose={() => setShowWalletPanel(false)}
        balance={balance}
        prizes={mappedPrizes}
      />
    </header>
  );
};

export default Header;
