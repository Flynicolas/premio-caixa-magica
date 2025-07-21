
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Trophy, User, Wallet, Eye, EyeOff } from "lucide-react";
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
  const [showBalance, setShowBalance] = useState(true);

  // Load balance visibility preference from localStorage
  useEffect(() => {
    const savedPreference = localStorage.getItem("showBalance");
    if (savedPreference !== null) {
      setShowBalance(savedPreference === "true");
    }
  }, []);

  // Save balance visibility preference to localStorage
  const toggleBalanceVisibility = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newShowBalance = !showBalance;
    setShowBalance(newShowBalance);
    localStorage.setItem("showBalance", newShowBalance.toString());
  };

  const handleBalanceClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onAddBalance();
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: "/", icon: Home, label: "Início" },
    { path: "/meus-premios", icon: Trophy, label: "Prêmios" },
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

        {/* Center - Clickable Balance Display */}
        {user && (
          <div
            onClick={handleBalanceClick}
            className={cn(
              "flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all cursor-pointer bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 hover:from-primary/30 hover:to-secondary/30 hover:border-primary/50 hover:scale-105 active:scale-95 relative",
              isActive("/carteira")
                ? "from-primary/30 to-secondary/30 border-primary/50"
                : ""
            )}
          >
            <Wallet className="w-4 h-4 mb-1 text-primary" />
            <span className="text-xs font-bold text-primary">
              {showBalance ? `R$ ${(walletData?.balance || 0).toFixed(2)}` : "R$ ●●●●"}
            </span>
            <span className="text-xs text-muted-foreground">Saldo</span>
            
            {/* Eye toggle button */}
            <Button
              onClick={toggleBalanceVisibility}
              size="sm"
              variant="ghost"
              className="absolute -top-1 -right-1 w-6 h-6 p-0 bg-primary/20 hover:bg-primary/30 rounded-full"
            >
              {showBalance ? (
                <Eye className="w-3 h-3 text-primary" />
              ) : (
                <EyeOff className="w-3 h-3 text-primary" />
              )}
            </Button>
          </div>
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
        </div>
      </div>
    </nav>
  );
};

export default BottomNavBar;
