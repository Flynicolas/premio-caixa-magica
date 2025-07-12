
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { User, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import UserProfile from './UserProfile';

interface HeaderProps {
  onOpenAuth: () => void;
  onOpenWallet: () => void;
}

const Header = ({ onOpenAuth, onOpenWallet }: HeaderProps) => {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3" onClick={closeMobileMenu}>
            <img 
              src="/lovable-uploads/1b23f313-78a7-4d82-9c0a-1c992d7be9c0.png" 
              alt="Baú Premiado Logo"
              className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
            />
            <span className="text-lg sm:text-xl lg:text-2xl font-bold text-primary">
              Baú Premiado
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <Link 
              to="/" 
              className="text-sm lg:text-base font-medium text-foreground hover:text-primary transition-colors"
            >
              Início
            </Link>
            <Link 
              to="/baus" 
              className="text-sm lg:text-base font-medium text-foreground hover:text-primary transition-colors"
            >
              Baús
            </Link>
            <Link 
              to="/ranking" 
              className="text-sm lg:text-base font-medium text-foreground hover:text-primary transition-colors"
            >
              Ranking
            </Link>
            <Link 
              to="/perfil" 
              className="text-sm lg:text-base font-medium text-foreground hover:text-primary transition-colors"
            >
              Perfil
            </Link>
            <Link 
              to="/sobre" 
              className="text-sm lg:text-base font-medium text-foreground hover:text-primary transition-colors"
            >
              Sobre
            </Link>
          </nav>

          {/* Desktop User Section */}
          <div className="hidden md:flex items-center">
            {user ? (
              <UserProfile onOpenWallet={onOpenWallet} />
            ) : (
              <Button 
                onClick={onOpenAuth}
                className="gold-gradient text-black font-bold hover:opacity-90 h-10 px-4 text-sm lg:text-base"
              >
                <User className="w-4 h-4 mr-2" />
                Entrar
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden h-10 w-10 p-0"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border">
            <nav className="py-4 space-y-2">
              <Link 
                to="/" 
                className="block py-3 px-4 text-base font-medium text-foreground hover:text-primary hover:bg-secondary/50 rounded-md transition-colors"
                onClick={closeMobileMenu}
              >
                Início
              </Link>
              <Link 
                to="/baus" 
                className="block py-3 px-4 text-base font-medium text-foreground hover:text-primary hover:bg-secondary/50 rounded-md transition-colors"
                onClick={closeMobileMenu}
              >
                Baús
              </Link>
              <Link 
                to="/ranking" 
                className="block py-3 px-4 text-base font-medium text-foreground hover:text-primary hover:bg-secondary/50 rounded-md transition-colors"
                onClick={closeMobileMenu}
              >
                Ranking
              </Link>
              <Link 
                to="/perfil" 
                className="block py-3 px-4 text-base font-medium text-foreground hover:text-primary hover:bg-secondary/50 rounded-md transition-colors"
                onClick={closeMobileMenu}
              >
                Perfil
              </Link>
              <Link 
                to="/sobre" 
                className="block py-3 px-4 text-base font-medium text-foreground hover:text-primary hover:bg-secondary/50 rounded-md transition-colors"
                onClick={closeMobileMenu}
              >
                Sobre
              </Link>
              
              {/* Mobile User Section */}
              <div className="pt-4 border-t border-border mt-4">
                {user ? (
                  <div className="px-4 space-y-3">
                    <Button 
                      onClick={() => {
                        onOpenWallet();
                        closeMobileMenu();
                      }}
                      className="w-full gold-gradient text-black font-bold hover:opacity-90 h-12"
                    >
                      Carteira
                    </Button>
                  </div>
                ) : (
                  <div className="px-4">
                    <Button 
                      onClick={() => {
                        onOpenAuth();
                        closeMobileMenu();
                      }}
                      className="w-full gold-gradient text-black font-bold hover:opacity-90 h-12"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Entrar
                    </Button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
