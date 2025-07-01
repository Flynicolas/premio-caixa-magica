
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Trophy, 
  Crown, 
  Medal, 
  Star, 
  TrendingUp,
  Users,
  Award,
  Target
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UserLevelDisplay from '@/components/UserLevelDisplay';
import { calculateUserLevel } from '@/utils/levelSystem';

interface RankingUser {
  id: number;
  name: string;
  totalSpent: number;
  totalPrizes: number;
  level: number;
  levelName: string;
  position: number;
  avatar: string;
  isCurrentUser?: boolean;
}

const Ranking = () => {
  // Mock current user data
  const currentUserSpent = 750;
  const currentUserPrizes = 35;
  const currentUserLevel = calculateUserLevel(currentUserSpent, currentUserPrizes);

  // Mock ranking data
  const [rankingData] = useState<RankingUser[]>([
    {
      id: 1,
      name: 'Carlos',
      totalSpent: 5000,
      totalPrizes: 200,
      level: 6,
      levelName: 'Mestre',
      position: 1,
      avatar: '👑'
    },
    {
      id: 2,
      name: 'Ana',
      totalSpent: 3500,
      totalPrizes: 180,
      level: 6,
      levelName: 'Mestre',
      position: 2,
      avatar: '💎'
    },
    {
      id: 3,
      name: 'Pedro',
      totalSpent: 2800,
      totalPrizes: 150,
      level: 5,
      levelName: 'Lenda',
      position: 3,
      avatar: '🏆'
    },
    {
      id: 4,
      name: 'Maria',
      totalSpent: 2200,
      totalPrizes: 120,
      level: 5,
      levelName: 'Lenda',
      position: 4,
      avatar: '⭐'
    },
    {
      id: 5,
      name: 'João',
      totalSpent: 1800,
      totalPrizes: 95,
      level: 5,
      levelName: 'Lenda',
      position: 5,
      avatar: '🌟'
    },
    {
      id: 6,
      name: 'Você',
      totalSpent: currentUserSpent,
      totalPrizes: currentUserPrizes,
      level: currentUserLevel.level,
      levelName: currentUserLevel.name,
      position: 12,
      avatar: '👤',
      isCurrentUser: true
    }
  ]);

  const [activeTab, setActiveTab] = useState<'global' | 'weekly' | 'monthly'>('global');

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{position}</span>;
    }
  };

  const getLevelColor = (level: number) => {
    const colors = {
      1: 'text-gray-400',
      2: 'text-green-400',
      3: 'text-blue-400',
      4: 'text-purple-400',
      5: 'text-yellow-400',
      6: 'text-red-400'
    };
    return colors[level as keyof typeof colors] || 'text-gray-400';
  };

  const getLevelBadgeColor = (level: number) => {
    const colors = {
      1: 'bg-gray-500',
      2: 'bg-green-500',
      3: 'bg-blue-500',
      4: 'bg-purple-500',
      5: 'bg-yellow-500',
      6: 'bg-red-500'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gold-gradient bg-clip-text text-transparent mb-4">
            🏆 Ranking Global
          </h1>
          <p className="text-muted-foreground text-lg">
            Dispute o topo com outros jogadores e conquiste emblemas exclusivos
          </p>
        </div>

        {/* Current User Level Display */}
        <div className="mb-8">
          <UserLevelDisplay 
            userLevel={currentUserLevel}
            totalSpent={currentUserSpent}
            totalPrizes={currentUserPrizes}
          />
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 bg-gradient-to-br from-card to-card/80 border-primary/20">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sua Posição</p>
                <p className="text-2xl font-bold text-primary">#12</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-card to-card/80 border-primary/20">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Jogadores Ativos</p>
                <p className="text-2xl font-bold text-green-500">2,547</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-card to-card/80 border-primary/20">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foregroup">Progresso Semanal</p>
                <p className="text-2xl font-bold text-blue-500">+3</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-card to-card/80 border-primary/20">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Crown className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Seu Nível</p>
                <p className="text-2xl font-bold text-purple-500">{currentUserLevel.level}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Ranking Tabs */}
        <Card className="p-6 bg-gradient-to-br from-card to-card/80 border-primary/20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h2 className="text-2xl font-bold mb-4 md:mb-0">Classificação</h2>
            <div className="flex space-x-2">
              <Button
                variant={activeTab === 'global' ? 'default' : 'outline'}
                onClick={() => setActiveTab('global')}
                className={activeTab === 'global' ? 'gold-gradient text-black' : ''}
              >
                Global
              </Button>
              <Button
                variant={activeTab === 'weekly' ? 'default' : 'outline'}
                onClick={() => setActiveTab('weekly')}
                className={activeTab === 'weekly' ? 'gold-gradient text-black' : ''}
              >
                Semanal
              </Button>
              <Button
                variant={activeTab === 'monthly' ? 'default' : 'outline'}
                onClick={() => setActiveTab('monthly')}
                className={activeTab === 'monthly' ? 'gold-gradient text-black' : ''}
              >
                Mensal
              </Button>
            </div>
          </div>

          {/* Ranking Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Pos.</TableHead>
                  <TableHead>Jogador</TableHead>
                  <TableHead>Nível</TableHead>
                  <TableHead className="text-right">Total Investido</TableHead>
                  <TableHead className="text-right">Prêmios</TableHead>
                  <TableHead className="text-right">Pontos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rankingData.map((user) => (
                  <TableRow 
                    key={user.id}
                    className={user.isCurrentUser ? 'bg-primary/10 border-primary/30' : ''}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center justify-center">
                        {getPositionIcon(user.position)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{user.avatar}</div>
                        <div>
                          <p className={`font-semibold ${user.isCurrentUser ? 'text-primary' : ''}`}>
                            {user.name}
                            {user.isCurrentUser && (
                              <Badge variant="secondary" className="ml-2 text-xs">
                                Você
                              </Badge>
                            )}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          className={`${getLevelBadgeColor(user.level)} text-white`}
                        >
                          {user.level}
                        </Badge>
                        <span className={`text-sm font-medium ${getLevelColor(user.level)}`}>
                          {user.levelName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      R$ {user.totalSpent.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      {user.totalPrizes}
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary">
                      {(user.totalSpent + user.totalPrizes * 10).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Progress to Next Position */}
          {activeTab === 'global' && (
            <div className="mt-6 p-4 bg-secondary/30 rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center">
                <Star className="w-4 h-4 mr-2 text-primary" />
                Progresso para Próxima Posição
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Faltam R$ 1.050,00 para alcançar a 11ª posição</span>
                  <span>75%</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
            </div>
          )}
        </Card>

        {/* Emblems and Achievements Section */}
        <Card className="mt-8 p-6 bg-gradient-to-br from-card to-card/80 border-primary/20">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <Award className="w-6 h-6 mr-2 text-primary" />
            Emblemas e Conquistas
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* Current Level Emblem */}
            <div className="text-center p-4 bg-secondary/30 rounded-lg border-2 border-purple-500/50">
              <div className="text-4xl mb-2">{currentUserLevel.icon}</div>
              <p className="text-sm font-semibold text-purple-400">{currentUserLevel.name}</p>
              <p className="text-xs text-muted-foreground">Atual</p>
            </div>

            {/* Locked Emblems */}
            <div className="text-center p-4 bg-secondary/20 rounded-lg border-2 border-gray-600/50 opacity-50">
              <div className="text-4xl mb-2 filter grayscale">💎</div>
              <p className="text-sm font-semibold text-gray-400">Mestre</p>
              <p className="text-xs text-muted-foreground">Bloqueado</p>
            </div>

            <div className="text-center p-4 bg-secondary/20 rounded-lg border-2 border-gray-600/50 opacity-50">
              <div className="text-4xl mb-2 filter grayscale">👑</div>
              <p className="text-sm font-semibold text-gray-400">Rei</p>
              <p className="text-xs text-muted-foreground">Top 3</p>
            </div>

            <div className="text-center p-4 bg-secondary/20 rounded-lg border-2 border-gray-600/50 opacity-50">
              <div className="text-4xl mb-2 filter grayscale">🌟</div>
              <p className="text-sm font-semibold text-gray-400">Estrela</p>
              <p className="text-xs text-muted-foreground">100 Prêmios</p>
            </div>

            <div className="text-center p-4 bg-secondary/20 rounded-lg border-2 border-gray-600/50 opacity-50">
              <div className="text-4xl mb-2 filter grayscale">🔥</div>
              <p className="text-sm font-semibold text-gray-400">Em Chamas</p>
              <p className="text-xs text-muted-foreground">Streak 7 dias</p>
            </div>

            <div className="text-center p-4 bg-secondary/20 rounded-lg border-2 border-gray-600/50 opacity-50">
              <div className="text-4xl mb-2 filter grayscale">💰</div>
              <p className="text-sm font-semibold text-gray-400">Milionário</p>
              <p className="text-xs text-muted-foreground">R$ 10.000</p>
            </div>
          </div>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default Ranking;
