
import { Link, useLocation } from "react-router-dom";
import { Home, Trophy, User, Wallet, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useWallet } from "@/hooks/useWallet";
import { useAuth } from "@/hooks/useAuth";

interface BottomNavBarProps {
  onAddBalance: () => void;
}

const BottomNavBar = ({ onAddBalance }: BottomNavBarProps) => {
  const location = useLocation();
  const { walletData } = useWallet();
  const { user } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: "/", icon: Home, label: "Início" },
    { path: "/premios", icon: Trophy, label: "Prêmios" },
    { path: "/carteira", icon: Wallet, label: "Carteira" },
    { path: "/perfil", icon: User, label: "Perfil" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-primary/20 md:hidden z-40">
      <div className="flex items-center justify-between py-2 px-2">
        {/* Left side navigation */}
        <div className="flex items-center space-x-1">
          {navItems.slice(0, 2).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-2 rounded-lg transition-colors min-w-[55px]",
                isActive(item.path)
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <item.icon className="w-4 h-4 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Center - Balance Display */}
        {user && (
          <Link
            to="/carteira"
            className={cn(
              "flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-colors bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30",
              isActive("/carteira")
                ? "from-primary/30 to-secondary/30 border-primary/50"
                : "hover:from-primary/25 hover:to-secondary/25"
            )}
          >
            <Wallet className="w-4 h-4 mb-1 text-primary" />
            <span className="text-xs font-bold text-primary">
              R$ {(walletData?.balance || 0).toFixed(2)}
            </span>
            <span className="text-xs text-muted-foreground">Saldo</span>
          </Link>
        )}

        {/* Right side navigation */}
        <div className="flex items-center space-x-1">
          {navItems.slice(2).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-2 rounded-lg transition-colors min-w-[55px]",
                isActive(item.path)
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <item.icon className="w-4 h-4 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
          
          {/* Add Balance Button */}
          <Button
            onClick={onAddBalance}
            size="sm"
            className="flex flex-col items-center justify-center py-2 px-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary min-w-[55px] h-auto"
          >
            <Plus className="w-4 h-4 mb-1" />
            <span className="text-xs font-medium">Adicionar</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default BottomNavBar;
