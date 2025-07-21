
import { Link, useLocation } from "react-router-dom";
import { Home, Trophy, User, Wallet, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface BottomNavBarProps {
  onAddBalance: () => void;
}

const BottomNavBar = ({ onAddBalance }: BottomNavBarProps) => {
  const location = useLocation();

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
      <div className="flex items-center justify-around py-2 px-4">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors min-w-[60px]",
              isActive(item.path)
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            <item.icon className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}
        
        {/* Add Balance Button */}
        <Button
          onClick={onAddBalance}
          size="sm"
          className="flex flex-col items-center justify-center py-2 px-3 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary min-w-[60px] h-auto"
        >
          <Plus className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">Adicionar</span>
        </Button>
      </div>
    </nav>
  );
};

export default BottomNavBar;
