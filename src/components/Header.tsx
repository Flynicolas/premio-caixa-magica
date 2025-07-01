
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Wallet, User, Menu, X } from 'lucide-react';
import LoginModal from './LoginModal';

interface HeaderProps {
  balance: number;
  user: { name: string; email: string } | null;
  onAddBalance: () => void;
}

const Header = ({ balance, user, onAddBalance }: HeaderProps) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'PÁGINA INICIAL', href: '/' },
    { name: 'BAÚS', href: '/baus' },
    { name: 'SOBRE', href: '/sobre' },
    { name: 'RANKING', href: '/ranking' },
    { name: 'SUPORTE', href: '/suporte' },
  ];

  const isActive = (href: string) => location.pathname === href;

  const handleUserAction = () => {
    if (!user) {
      setIsLoginModalOpen(true);
    }
  };

  return (
    <>
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
              <h1 className="text-2xl font-bold gold-gradient bg-clip-text text-transparent">
                Baú Premiado
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive(item.href) ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-2 bg-secondary px-4 py-2 rounded-lg">
                  <Wallet className="w-4 h-4 text-primary" />
                  <span className="font-bold text-primary">R$ {balance.toFixed(2)}</span>
                </div>
              )}
              
              {user && (
                <Button 
                  onClick={onAddBalance}
                  className="gold-gradient text-black font-bold hover:opacity-90"
                >
                  Carteira
                </Button>
              )}

              <Link
                to={user ? "/perfil" : "#"}
                onClick={!user ? handleUserAction : undefined}
                className="flex items-center space-x-2 text-sm hover:text-primary transition-colors"
              >
                <User className="w-5 h-5" />
                {user && <span className="hidden sm:block">{user.name}</span>}
              </Link>

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
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      isActive(item.href) ? 'text-primary' : 'text-muted-foreground'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
};

export default Header;
