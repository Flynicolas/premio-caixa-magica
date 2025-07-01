import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Crown, Star, Medal, Award, Zap } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { calculateUserLevel } from '@/utils/levelSystem';

interface RankingUser {
  id: number;
  name: string;
  totalSpent: number;
  prizesWon: number;
  level: ReturnType<typeof calculateUserLevel>;
  position: number;
}

const getRankIcon = (position: number) => {
  switch (position) {
    case 1:
      return <Crown className="w-6 h-6 text-yellow-400" />;
    case 2:
      return <Trophy className="w-6 h-6 text-gray-400" />;
    case 3:
      return <Medal className="w-6 h-6 text-amber-600" />;
    default:
      return <Award className="w-5 h-5 text-muted-foreground" />;
  }
};

const getRankBadge = (position: number) => {
  if (position <= 3) {
    return `${position}º`;
  }
  return `${position}º`;
};

const Ranking = () => {
  // Mock user data
  const currentUserSpent = 750;
  const currentUserPrizes = 35;
  const currentUserLevel = calculateUserLevel(currentUserSpent, currentUserPrizes);
  const mockBalance = 150.75;

  // Mock ranking data
  const [rankingData] = useState<RankingUser[]>([
    {
      id: 1,
      name: "Carlos Silva",
      totalSpent: 5000,
      prizesWon: 125,
      level: calculateUserLevel(5000, 125),
      position: 1
    },
    {
      id: 2,
      name: "Maria Santos",
      totalSpent: 4200,
      prizesWon: 98,
      level: calculateUserLevel(4200, 98),
      position: 2
    },
    {
      id: 3,
      name: "João Oliveira",
      totalSpent: 3800,
      prizesWon: 87,
      level: calculateUserLevel(3800, 87),
      position: 3
    },
    {
      id: 4,
      name: "Ana Costa",
      totalSpent: 3200,
      prizesWon: 72,
      level: calculateUserLevel(3200, 72),
      position: 4
    },
    {
      id: 5,
      name: "Pedro Lima",
      totalSpent: 2900,
      prizesWon: 65,
      level: calculateUserLevel(2900, 65),
      position: 5
    },
    {
      id: 6,
      name: "Lucia Ferreira",
      totalSpent: 2500,
      prizesWon: 58,
      level: calculateUserLevel(2500, 58),
      position: 6
    },
    {
      id: 7,
      name: "Roberto Souza",
      totalSpent: 2100,
      prizesWon: 49,
      level: calculateUserLevel(2100, 49),
      position: 7
    },
    {
      id: 8,
      name: "Fernanda Alves",
      totalSpent: 1800,
      prizesWon: 42,
      level: calculateUserLevel(1800, 42),
      position: 8
    },
    {
      id: 9,
      name: "Ricardo Pereira",
      totalSpent: 1500,
      prizesWon: 35,
      level: calculateUserLevel(1500, 35),
      position: 9
    },
    {
      id: 10,
      name: "Você",
      totalSpent: currentUserSpent,
      prizesWon: currentUserPrizes,
      level: currentUserLevel,
      position: 10
    }
  ]);

  const handleAddBalance = () => {
    console.log('Add balance clicked');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        balance={mockBalance}
        onAddBalance={handleAddBalance}
      />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-primary">
            🏆 Ranking Global 🏆
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Compete com milhares de jogadores e suba no ranking baseado em seus gastos e prêmios conquistados!
          </p>
        </div>

        {/* User Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 bg-gradient-to-r from-primary/20 to-primary/10 border-primary/30">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary/20 rounded-full">
                <Star className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sua Posição</p>
                <p className="text-2xl font-bold text-primary">10º Lugar</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-r from-green-500/20 to-green-500/10 border-green-500/30">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-500/20 rounded-full">
                <Zap className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Investido</p>
                <p className="text-2xl font-bold text-green-400">R$ {currentUserSpent.toFixed(2)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-r from-purple-500/20 to-purple-500/10 border-purple-500/30">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-500/20 rounded-full">
                <Trophy className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Prêmios Ganhos</p>
                <p className="text-2xl font-bold text-purple-400">{currentUserPrizes}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Ranking Table */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-center text-primary">
            Top 10 Jogadores
          </h2>
          
          <div className="space-y-4">
            {rankingData.map((user, index) => (
              <div
                key={user.id}
                className={`flex items-center justify-between p-4 rounded-lg border transition-all hover:scale-[1.02] ${
                  user.name === 'Você' 
                    ? 'bg-primary/10 border-primary/50 ring-2 ring-primary/30' 
                    : 'bg-card/50 border-primary/20 hover:border-primary/40'
                } ${
                  index < 3 ? 'shadow-lg' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20">
                    {getRankIcon(user.position)}
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-lg text-white">
                        {user.name}
                      </span>
                      {user.name === 'Você' && (
                        <Badge variant="secondary" className="text-xs">
                          VOCÊ
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>Nível {user.level.level}</span>
                      <span>•</span>
                      <span>{user.level.title}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge 
                      variant={user.position <= 3 ? "default" : "secondary"}
                      className={user.position <= 3 ? "bg-primary text-black" : ""}
                    >
                      {getRankBadge(user.position)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    R$ {user.totalSpent.toFixed(2)} • {user.prizesWon} prêmios
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Motivational Message */}
          <div className="mt-8 p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20 text-center">
            <h3 className="text-xl font-bold mb-2 text-primary">
              Continue Jogando para Subir no Ranking! 
            </h3>
            <p className="text-muted-foreground">
              Abra mais baús e ganhe prêmios para escalar posições e desbloquear novos níveis!
            </p>
          </div>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default Ranking;
