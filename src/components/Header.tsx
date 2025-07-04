
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Menu, X, Shield } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import UserProfile from './UserProfile';

interface HeaderProps {
  balance: number;
  onAddBalance: () => void;
  user: User | null;
  onShowAuth: () => void;
}

const Header = ({ balance, onAddBalance, user, onShowAuth }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isAdmin, loading: adminLoading } = useAdminCheck();

  const navigation = [
    { name: 'PÁGINA INICIAL', href: '/' },
    { name: 'BAÚS', href: '/baus' },
    { name: 'SOBRE', href: '/sobre' },
    { name: 'RANKING', href: '/ranking' },
    { name: 'PERFIL', href: '/perfil' },
  ];

  // Add admin link only for admins
  if (isAdmin) {
    navigation.push({ name: 'ADMIN', href: '/admin' });
  }

  const isActive = (href: string) => location.pathname === href;

  return (
    <header className="bg-card/90 backdrop-blur-sm border-b border-primary/20 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/0f37c024-1f08-4216-82c9-1583e7900501.png" 
              alt="Baú Premiado" 
              className="w-12 h-12 rounded-full"
            />
            <h1 className="text-2xl font-bold text-white">
              Baú Premiado
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary relative ${
                  isActive(item.href) ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.name}
                {item.name === 'ADMIN' && (
                  <Badge 
                    variant="secondary" 
                    className="ml-2 text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                  >
                    <Shield className="w-3 h-3 mr-1" />
                    Admin
                  </Badge>
                )}
              </Link>
            ))}
          </nav>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <UserProfile onOpenWallet={onAddBalance} />
            ) : (
              <Button 
                onClick={onShowAuth}
                className="gold-gradient text-black font-bold hover:opacity-90"
              >
                Entrar / Cadastrar
              </Button>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-primary/20">
            <nav className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-sm font-medium transition-colors hover:text-primary flex items-center ${
                    isActive(item.href) ? 'text-primary' : 'text-muted-foreground'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                  {item.name === 'ADMIN' && (
                    <Badge 
                      variant="secondary" 
                      className="ml-2 text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                    >
                      <Shield className="w-3 h-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
