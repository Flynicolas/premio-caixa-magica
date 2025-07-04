
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Achievement } from '@/hooks/useProfile';
import { Lock, Unlock, Trophy, Star } from 'lucide-react';

interface AchievementsGridProps {
  achievements: Achievement[];
  userAchievements: any[];
  userStats: {
    chests_opened: number;
    total_spent: number;
  };
  className?: string;
}

const AchievementsGrid = ({ 
  achievements, 
  userAchievements, 
  userStats, 
  className = "" 
}: AchievementsGridProps) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-400 to-orange-500';
      case 'epic': return 'from-purple-500 to-pink-500';
      case 'rare': return 'from-blue-500 to-cyan-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getRarityBadgeVariant = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'default';
      case 'epic': return 'secondary';
      case 'rare': return 'outline';
      default: return 'secondary';
    }
  };

  const calculateProgress = (achievement: Achievement) => {
    let current = 0;
    
    switch (achievement.condition_type) {
      case 'chests_opened':
        current = userStats.chests_opened;
        break;
      case 'total_spent':
        current = userStats.total_spent;
        break;
      default:
        current = 0;
    }
    
    return Math.min((current / achievement.condition_value) * 100, 100);
  };

  const isUnlocked = (achievementId: string) => {
    return userAchievements.some(ua => ua.achievement_id === achievementId);
  };

  const getUnlockDate = (achievementId: string) => {
    const userAchievement = userAchievements.find(ua => ua.achievement_id === achievementId);
    return userAchievement?.unlocked_at;
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {achievements.map((achievement) => {
        const unlocked = isUnlocked(achievement.id);
        const progress = calculateProgress(achievement);
        const unlockDate = getUnlockDate(achievement.id);
        
        return (
          <Card 
            key={achievement.id}
            className={`relative overflow-hidden transition-all duration-200 hover:scale-105 ${
              unlocked ? 'border-yellow-500/50 shadow-lg' : 'opacity-75'
            }`}
          >
            {/* Background gradient for unlocked achievements */}
            {unlocked && (
              <div className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(achievement.rarity)} opacity-10`} />
            )}
            
            <CardHeader className="relative pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`text-2xl ${unlocked ? '' : 'grayscale'}`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-sm font-semibold flex items-center space-x-2">
                      <span className={unlocked ? '' : 'text-muted-foreground'}>
                        {achievement.name}
                      </span>
                      {unlocked ? (
                        <Unlock className="w-3 h-3 text-green-500" />
                      ) : (
                        <Lock className="w-3 h-3 text-muted-foreground" />
                      )}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      {achievement.description}
                    </p>
                  </div>
                </div>
                
                <Badge 
                  variant={getRarityBadgeVariant(achievement.rarity)}
                  className="text-xs capitalize"
                >
                  {achievement.rarity}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Progress for locked achievements */}
              {!unlocked && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Progresso</span>
                    <span className="font-medium">{progress.toFixed(0)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    {achievement.condition_type === 'chests_opened' && 
                      `${userStats.chests_opened}/${achievement.condition_value} baús abertos`
                    }
                    {achievement.condition_type === 'total_spent' && 
                      `R$ ${userStats.total_spent.toFixed(2)}/R$ ${achievement.condition_value} gastos`
                    }
                  </div>
                </div>
              )}

              {/* Unlock info for completed achievements */}
              {unlocked && unlockDate && (
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-green-600">
                    <Trophy className="w-3 h-3" />
                    <span>Desbloqueada</span>
                  </div>
                  <span className="text-muted-foreground">
                    {new Date(unlockDate).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}

              {/* Reward info */}
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <div className="flex items-center space-x-2 text-xs">
                  <Star className="w-3 h-3 text-yellow-500" />
                  <span className="text-muted-foreground">Recompensa:</span>
                </div>
                <span className="text-xs font-medium text-yellow-600">
                  +{achievement.reward_experience} XP
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AchievementsGrid;
