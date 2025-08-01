
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User, Wallet } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWalletProvider';

interface UserProfileProps {
  onOpenWallet: () => void;
}

const UserProfile = ({ onOpenWallet }: UserProfileProps) => {
  const { user, signOut } = useAuth();
  const { walletData } = useWallet();

  if (!user) return null;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="flex items-center space-x-4">
      {/* Wallet Balance */}
      <div className="flex items-center space-x-2 bg-secondary px-4 py-2 rounded-lg">
        <Wallet className="w-4 h-4 text-primary" />
        <span className="font-bold text-primary">
          R$ {walletData?.balance?.toFixed(2) || '0,00'}
        </span>
      </div>
      
      <Button 
        onClick={onOpenWallet}
        className="gold-gradient text-black font-bold hover:opacity-90"
      >
        Carteira
      </Button>

      {/* User Avatar and Menu */}
      <div className="flex items-center space-x-2">
        <Avatar className="w-10 h-10 border-2 border-primary">
          <AvatarImage src={user.user_metadata?.avatar_url} />
          <AvatarFallback className="bg-primary text-black font-bold">
            {getInitials(user.user_metadata?.full_name || user.email?.charAt(0) || 'U')}
          </AvatarFallback>
        </Avatar>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className="text-muted-foreground hover:text-destructive"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default UserProfile;
