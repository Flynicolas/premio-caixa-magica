
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Wallet, 
  Gift, 
  Trophy, 
  TrendingUp, 
  Calendar,
  Star,
  Target,
  Zap
} from 'lucide-react';

interface UserStatsCardsProps {
  stats?: {
    total_spent: number;
    total_prizes_won: number;
    chests_opened: number;
    experience_points: number;
    level: number;
    join_date: string;
  };
  className?: string;
}

const UserStatsCards = ({ stats, className = "" }: UserStatsCardsProps) => {
  // Default stats if none provided
  const defaultStats = {
    total_spent: 0,
    total_prizes_won: 0,
    chests_opened: 0,
    experience_points: 0,
    level: 1,
    join_date: new Date().toISOString()
  };

  const userStats = stats || defaultStats;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getDaysJoined = () => {
    const joinDate = new Date(userStats.join_date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - joinDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getAverageSpentPerChest = () => {
    if (userStats.chests_opened === 0) return 0;
    return userStats.total_spent / userStats.chests_opened;
  };

  const statsCards = [
    {
      title: 'Total Investido',
      value: formatCurrency(userStats.total_spent),
      icon: Wallet,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      tooltip: 'Valor total gasto em baús e itens'
    },
    {
      title: 'Prêmios Ganhos',
      value: userStats.total_prizes_won.toString(),
      icon: Gift,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      tooltip: 'Quantidade total de prêmios conquistados'
    },
    {
      title: 'Baús Abertos',
      value: userStats.chests_opened.toString(),
      icon: Trophy,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      tooltip: 'Número total de baús abertos'
    },
    {
      title: 'Experiência',
      value: userStats.experience_points.toLocaleString(),
      subtitle: 'XP',
      icon: Zap,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      tooltip: 'Pontos de experiência acumulados'
    },
    {
      title: 'Nível Atual',
      value: userStats.level.toString(),
      icon: Star,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
      tooltip: 'Seu nível atual no sistema'
    },
    {
      title: 'Dias Conosco',
      value: getDaysJoined().toString(),
      subtitle: 'dias',
      icon: Calendar,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      tooltip: `Membro desde ${formatDate(userStats.join_date)}`
    },
    {
      title: 'Média por Baú',
      value: formatCurrency(getAverageSpentPerChest()),
      icon: Target,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
      tooltip: 'Valor médio gasto por baú aberto'
    },
    {
      title: 'Taxa de Sucesso',
      value: userStats.chests_opened > 0 ? 
        `${((userStats.total_prizes_won / userStats.chests_opened) * 100).toFixed(1)}%` : 
        '0%',
      icon: TrendingUp,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      tooltip: 'Porcentagem de baús que resultaram em prêmios'
    }
  ];

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {statsCards.map((stat, index) => (
        <TooltipProvider key={index}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="hover:shadow-lg transition-all duration-200 cursor-help">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-lg font-bold ${stat.color} truncate`}>
                        {stat.value}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {stat.title}
                      </div>
                      {stat.subtitle && (
                        <div className="text-xs text-muted-foreground/70">
                          {stat.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>{stat.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
};

export default UserStatsCards;
