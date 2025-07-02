
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { calculateUserLevel } from '@/utils/levelSystem';
import { 
  User, 
  Trophy, 
  Star, 
  Gift, 
  History, 
  Settings,
  Medal,
  Crown,
  Zap,
  Target
} from 'lucide-react';

const Perfil = () => {
  const { user, updateProfile, signOut } = useAuth();
  const { walletData, transactions } = useWallet();
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [isUpdating, setIsUpdating] = useState(false);

  // Mock data for demonstration
  const totalSpent = walletData?.total_spent || 750;
  const prizesWon = 35;
  
  const userLevel = calculateUserLevel(totalSpent, prizesWon);

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      await updateProfile({ full_name: fullName });
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Mock recent prizes for demonstration
  const recentPrizes = [
    { name: 'Smartwatch Premium', value: 'R$ 300', date: '2024-01-15', rarity: 'rare' },
    { name: 'Fone Bluetooth', value: 'R$ 150', date: '2024-01-10', rarity: 'common' },
    { name: 'Vale-Compras R$ 100', value: 'R$ 100', date: '2024-01-05', rarity: 'common' },
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'epic': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'rare': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-600';
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-lg text-muted-foreground">Você precisa estar logado para ver seu perfil.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-primary">Meu Perfil</h1>
        <p className="text-muted-foreground">Gerencie suas informações e acompanhe seu progresso</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Overview - Left Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* User Card */}
          <Card>
            <CardHeader className="text-center">
              <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-primary text-black text-2xl font-bold">
                  {getInitials(user.user_metadata?.full_name || user.email?.charAt(0) || 'U')}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-xl">{user.user_metadata?.full_name || 'Usuário'}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
              <div className="flex items-center justify-center space-x-2 mt-2">
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <Star className="w-3 h-3" />
                  <span>Nível {userLevel.level}</span>
                </Badge>
                <Badge variant="outline">{userLevel.title}</Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Level Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span>Progresso do Nível</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{userLevel.xp} XP</div>
                <div className="text-sm text-muted-foreground">
                  {userLevel.nextLevelXp - userLevel.xp} XP para o próximo nível
                </div>
              </div>
              <Progress value={userLevel.progress} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Nível {userLevel.level}</span>
                <span>Nível {userLevel.level + 1}</span>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <Zap className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-500">R$ {totalSpent.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">Total Investido</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Gift className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-500">{prizesWon}</div>
                <div className="text-xs text-muted-foreground">Prêmios Ganhos</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content - Right Column */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile" className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Perfil</span>
              </TabsTrigger>
              <TabsTrigger value="prizes" className="flex items-center space-x-2">
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">Prêmios</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center space-x-2">
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">Histórico</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Config</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Pessoais</CardTitle>
                  <CardDescription>Atualize suas informações básicas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nome Completo</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Seu nome completo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" value={user.email || ''} disabled />
                    </div>
                  </div>
                  <Button 
                    onClick={handleUpdateProfile}
                    disabled={isUpdating}
                    className="w-full md:w-auto"
                  >
                    {isUpdating ? 'Atualizando...' : 'Atualizar Perfil'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Prizes Tab */}
            <TabsContent value="prizes" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <span>Prêmios Conquistados</span>
                  </CardTitle>
                  <CardDescription>Seus prêmios mais recentes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentPrizes.map((prize, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`w-3 h-3 rounded-full ${getRarityColor(prize.rarity)}`} />
                          <div>
                            <div className="font-medium">{prize.name}</div>
                            <div className="text-sm text-muted-foreground">{prize.date}</div>
                          </div>
                        </div>
                        <div className="text-lg font-bold text-green-500">{prize.value}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <History className="w-5 h-5" />
                    <span>Histórico de Transações</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {transactions.slice(0, 10).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">{transaction.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                        <div className={`text-lg font-bold ${
                          transaction.type === 'deposit' || transaction.type === 'prize_win' 
                            ? 'text-green-500' 
                            : 'text-red-500'
                        }`}>
                          {transaction.type === 'deposit' || transaction.type === 'prize_win' ? '+' : '-'}
                          R$ {transaction.amount.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>Configurações da Conta</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border border-destructive/50 rounded-lg">
                    <h3 className="font-semibold text-destructive mb-2">Zona de Perigo</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Esta ação irá desconectar você da sua conta.
                    </p>
                    <Button variant="destructive" onClick={signOut}>
                      Sair da Conta
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Perfil;
