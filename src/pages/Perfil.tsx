
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Wallet, Trophy, History, Star, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { calculateUserLevel } from '@/utils/levelSystem';

const Perfil = () => {
  const { user, updateProfile } = useAuth();
  const { walletData, transactions } = useWallet();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: user?.user_metadata?.full_name || '',
    avatar_url: user?.user_metadata?.avatar_url || ''
  });

  const userLevel = calculateUserLevel(walletData?.total_spent || 0, 12); // Mock prizes count

  const handleSaveProfile = async () => {
    const { error } = await updateProfile(profileData);
    if (!error) {
      setIsEditing(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const mockStats = {
    totalPrizes: 12,
    biggestWin: 150.00,
    chestsOpened: 25,
    winRate: 48
  };

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Profile Header */}
      <Card className="p-8 mb-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30">
        <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
          <Avatar className="w-32 h-32 border-4 border-primary">
            <AvatarImage src={profileData.avatar_url} />
            <AvatarFallback className="bg-primary text-black text-4xl font-bold">
              {getInitials(profileData.full_name || user.email?.charAt(0) || 'U')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold mb-2 text-white">
              {profileData.full_name || 'Usuário Premium'}
            </h1>
            <p className="text-muted-foreground mb-4">{user.email}</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4">
              <Badge variant="secondary" className="flex items-center space-x-2">
                <Star className="w-4 h-4" />
                <span>Nível {userLevel.level}</span>
              </Badge>
              <Badge variant="outline" className="border-primary text-primary">
                {userLevel.title}
              </Badge>
            </div>

            <div className="flex justify-center md:justify-start">
              <Button 
                onClick={() => setIsEditing(!isEditing)}
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-black"
              >
                <User className="w-4 h-4 mr-2" />
                {isEditing ? 'Cancelar' : 'Editar Perfil'}
              </Button>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="mt-8 pt-8 border-t border-primary/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Nome Completo</label>
                <Input
                  value={profileData.full_name}
                  onChange={(e) => setProfileData(prev => ({...prev, full_name: e.target.value}))}
                  className="bg-secondary border-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white">URL do Avatar</label>
                <Input
                  value={profileData.avatar_url}
                  onChange={(e) => setProfileData(prev => ({...prev, avatar_url: e.target.value}))}
                  className="bg-secondary border-primary/20 focus:border-primary"
                />
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button 
                onClick={handleSaveProfile}
                className="gold-gradient text-black font-bold"
              >
                Salvar Alterações
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 text-center bg-gradient-to-br from-green-500/20 to-green-500/10 border-green-500/30">
          <Wallet className="w-8 h-8 text-green-400 mx-auto mb-3" />
          <div className="text-2xl font-bold text-green-400 mb-1">
            R$ {walletData?.balance?.toFixed(2) || '0,00'}
          </div>
          <div className="text-sm text-muted-foreground">Saldo Atual</div>
        </Card>

        <Card className="p-6 text-center bg-gradient-to-br from-purple-500/20 to-purple-500/10 border-purple-500/30">
          <Trophy className="w-8 h-8 text-purple-400 mx-auto mb-3" />
          <div className="text-2xl font-bold text-purple-400 mb-1">{mockStats.totalPrizes}</div>
          <div className="text-sm text-muted-foreground">Prêmios Ganhos</div>
        </Card>

        <Card className="p-6 text-center bg-gradient-to-br from-blue-500/20 to-blue-500/10 border-blue-500/30">
          <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-3" />
          <div className="text-2xl font-bold text-blue-400 mb-1">
            R$ {mockStats.biggestWin.toFixed(2)}
          </div>
          <div className="text-sm text-muted-foreground">Maior Prêmio</div>
        </Card>

        <Card className="p-6 text-center bg-gradient-to-br from-yellow-500/20 to-yellow-500/10 border-yellow-500/30">
          <Star className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
          <div className="text-2xl font-bold text-yellow-400 mb-1">{mockStats.winRate}%</div>
          <div className="text-sm text-muted-foreground">Taxa de Vitória</div>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="wallet" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-secondary">
          <TabsTrigger value="wallet">Carteira</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="achievements">Conquistas</TabsTrigger>
        </TabsList>

        <TabsContent value="wallet">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-6 flex items-center text-primary">
              <Wallet className="w-5 h-5 mr-2" />
              Informações da Carteira
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-secondary/50 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Total Depositado</div>
                <div className="text-2xl font-bold text-green-400">
                  R$ {walletData?.total_deposited?.toFixed(2) || '0,00'}
                </div>
              </div>
              <div className="p-4 bg-secondary/50 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Total Gasto</div>
                <div className="text-2xl font-bold text-red-400">
                  R$ {walletData?.total_spent?.toFixed(2) || '0,00'}
                </div>
              </div>
              <div className="p-4 bg-secondary/50 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Total Sacado</div>
                <div className="text-2xl font-bold text-blue-400">
                  R$ {walletData?.total_withdrawn?.toFixed(2) || '0,00'}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-6 flex items-center text-primary">
              <History className="w-5 h-5 mr-2" />
              Histórico de Transações
            </h3>
            <div className="space-y-4">
              {transactions.slice(0, 10).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                  <div>
                    <div className="font-medium text-white">{transaction.description}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(transaction.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${transaction.type === 'deposit' || transaction.type === 'prize_win' ? 'text-green-400' : 'text-red-400'}`}>
                      {transaction.type === 'deposit' || transaction.type === 'prize_win' ? '+' : '-'}
                      R$ {transaction.amount.toFixed(2)}
                    </div>
                    <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                      {transaction.status === 'completed' ? 'Concluído' : 'Pendente'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="achievements">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-6 flex items-center text-primary">
              <Trophy className="w-5 h-5 mr-2" />
              Conquistas e Nível
            </h3>
            <div className="space-y-6">
              <div className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-primary">Nível {userLevel.level}</h4>
                    <p className="text-muted-foreground">{userLevel.title}</p>
                  </div>
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    {userLevel.xp} XP
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso para o próximo nível</span>
                    <span>{userLevel.progress}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${userLevel.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Perfil;
