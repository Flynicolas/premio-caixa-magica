// src/components/Ranking.tsx
import { useRanking } from '@/hooks/useRanking';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Crown, Star, Medal, Award, Zap } from 'lucide-react';
import { calculateUserLevel } from '@/utils/levelSystem';

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

const getRankBadge = (position: number) => `${position}º`;

const capitalizeName = (name: string | null) =>
  (name ?? '')
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');


const Ranking = () => {
  const { ranking, currentUserRank, loading } = useRanking();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-primary">🏆 Ranking Global 🏆</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Compete com milhares de jogadores e suba no ranking baseado em seus gastos e prêmios conquistados!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 bg-gradient-to-r from-primary/20 to-primary/10 border-primary/30">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary/20 rounded-full">
                <Star className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sua Posição</p>
                <p className="text-2xl font-bold text-primary">
                  {currentUserRank ? `${currentUserRank.position}º Lugar` : '—'}
                </p>
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
                <p className="text-2xl font-bold text-green-400">
                  R$ {currentUserRank?.total_spent.toFixed(2) ?? '—'}
                </p>
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
                <p className="text-2xl font-bold text-purple-400">
                  {currentUserRank?.total_prizes_won ?? '—'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-center text-primary">Top 10 Jogadores</h2>
          <div className="space-y-4">
            {ranking.map((user, index) => (
           <div
  key={user.id}
  className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-lg border transition-all hover:scale-[1.02] ${
    currentUserRank?.id === user.id
      ? 'bg-primary/10 border-primary/50 ring-2 ring-primary/30'
      : 'bg-card/50 border-primary/20 hover:border-primary/40'
  } ${index < 3 ? 'shadow-lg' : ''}`}
>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20">
                    {getRankIcon(user.position)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-lg text-white">{capitalizeName(user.full_name)}</span>
                      {currentUserRank?.id === user.id && (
                        <Badge variant="secondary" className="text-xs">VOCÊ</Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>Nível {user.level.level}</span>
                      <span>•</span>
                      <span>{user.level.title}</span>
                    </div>
                  </div>
                </div>

                <div className="sm:text-right text-left">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge 
                      variant={user.position <= 3 ? "default" : "secondary"}
                      className={user.position <= 3 ? "bg-primary text-black" : ""}
                    >
                      {getRankBadge(user.position)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    R$ {user.total_spent.toFixed(2)} • {user.total_prizes_won} prêmios
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
    </div>
  );
};

export default Ranking;
