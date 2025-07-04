
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { useWallet } from '@/hooks/useWallet';
import WalletPanel from './WalletPanel';
import AuthModal from './AuthModal';
import { 
  Menu, 
  X, 
  User, 
  Settings, 
  LogOut, 
  Home, 
  Package, 
  Info, 
  Trophy,
  Shield,
  Grid3X3,
  Wallet
} from 'lucide-react';

const Header = () => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdminCheck();
  const { walletData } = useWallet();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showWallet, setShowWallet] = useState(false);

  const navigation = [
    { name: 'Início', href: '/', icon: Home },
    { name: 'Baús', href: '/baus', icon: Package },
    { name: 'Ranking', href: '/ranking', icon: Trophy },
    { name: 'Sobre', href: '/sobre', icon: Info },
  ];

  const adminNavigation = [
    { name: 'Admin', href: '/admin', icon: Shield },
    { name: 'Gestão de Itens', href: '/gestao-itens', icon: Grid3X3 },
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleAddBalance = (amount: number) => {
    // Esta função será chamada pelo WalletPanel
    console.log('Adicionando saldo:', amount);
  };

  return (
    <>
      <header className="bg-black/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shadow-lg">
                <Package className="w-6 h-6 text-black font-bold" />
              </div>
              <span className="font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                Baú Premiado
              </span>
            </Link>

            {/* Navigation - Desktop */}
            <nav className="hidden md:flex items-center space-x-6">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              {/* Admin Navigation */}
              {isAdmin && (
                <>
                  <div className="h-4 border-l border-gray-600" />
                  {adminNavigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'text-gray-300 hover:text-white hover:bg-gray-800'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                        {item.name === 'Admin' && (
                          <Badge variant="destructive" className="text-xs px-1">
                            Admin
                          </Badge>
                        )}
                      </Link>
                    );
                  })}
                </>
              )}
            </nav>

            {/* User Section */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  {/* Wallet Balance */}
                  <div className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
                    <Wallet className="w-4 h-4 text-yellow-400" />
                    <span className="font-bold text-yellow-400">
                      R$ {walletData?.balance?.toFixed(2) || '0,00'}
                    </span>
                  </div>
                  
                  <Button 
                    onClick={() => setShowWallet(true)}
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold hover:from-yellow-500 hover:to-orange-600 transition-all"
                  >
                    Carteira
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-gray-700 hover:border-yellow-400">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.user_metadata?.avatar_url} />
                          <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 text-black font-bold">
                            {getInitials(user.user_metadata?.full_name || user.email || 'U')}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-gray-900 border-gray-700" align="end" forceMount>
                      <div className="flex items-center justify-start gap-2 p-2">
                        <div className="flex flex-col space-y-1 leading-none">
                          <p className="font-medium text-white">{user.user_metadata?.full_name || 'Usuário'}</p>
                          <p className="w-[200px] truncate text-sm text-gray-400">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <DropdownMenuSeparator className="bg-gray-700" />
                      <DropdownMenuItem asChild>
                        <Link to="/perfil" className="flex items-center text-gray-300 hover:text-white">
                          <User className="mr-2 h-4 w-4" />
                          <span>Perfil</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/configuracoes" className="flex items-center text-gray-300 hover:text-white">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Configurações</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-gray-700" />
                      <DropdownMenuItem onClick={signOut} className="text-gray-300 hover:text-white">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sair</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button 
                  onClick={() => setShowAuth(true)}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold hover:from-yellow-500 hover:to-orange-600"
                >
                  Entrar
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-white hover:bg-gray-800"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-800">
              <div className="flex flex-col space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'text-gray-300 hover:text-white hover:bg-gray-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}

                {/* Admin Navigation Mobile */}
                {isAdmin && (
                  <>
                    <div className="border-t border-gray-800 pt-2 mt-2">
                      <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Administração
                      </div>
                    </div>
                    {adminNavigation.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setIsMenuOpen(false)}
                          className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isActive
                              ? 'bg-red-500/20 text-red-400'
                              : 'text-gray-300 hover:text-white hover:bg-gray-800'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{item.name}</span>
                          {item.name === 'Admin' && (
                            <Badge variant="destructive" className="text-xs px-1">
                              Admin
                            </Badge>
                          )}
                        </Link>
                      );
                    })}
                  </>
                )}

                {/* User Section Mobile */}
                <div className="border-t border-gray-800 pt-4 mt-4">
                  {user ? (
                    <div className="space-y-2">
                      <div className="px-3 flex items-center space-x-4">
                        {/* Wallet Balance */}
                        <div className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
                          <Wallet className="w-4 h-4 text-yellow-400" />
                          <span className="font-bold text-yellow-400">
                            R$ {walletData?.balance?.toFixed(2) || '0,00'}
                          </span>
                        </div>
                        
                        <Button 
                          onClick={() => setShowWallet(true)}
                          className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold hover:from-yellow-500 hover:to-orange-600"
                        >
                          Carteira
                        </Button>
                      </div>
                      <Link
                        to="/perfil"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800"
                      >
                        <User className="w-4 h-4" />
                        <span>Perfil</span>
                      </Link>
                      <button
                        onClick={() => {
                          signOut();
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sair</span>
                      </button>
                    </div>
                  ) : (
                    <div className="px-3">
                      <Button 
                        onClick={() => {
                          setShowAuth(true);
                          setIsMenuOpen(false);
                        }}
                        className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold hover:from-yellow-500 hover:to-orange-600"
                      >
                        Entrar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <AuthModal 
        isOpen={showAuth} 
        onClose={() => setShowAuth(false)} 
      />

      <WalletPanel
        isOpen={showWallet}
        onClose={() => setShowWallet(false)}
        balance={walletData?.balance || 0}
        prizes={[]}
        onAddBalance={handleAddBalance}
      />
    </>
  );
};

export default Header;
