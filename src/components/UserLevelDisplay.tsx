
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, TrendingUp } from 'lucide-react';
import { UserLevel, getProgressToNextLevel } from '@/utils/levelSystem';

interface UserLevelDisplayProps {
  userLevel: UserLevel;
  totalSpent: number;
  totalPrizes: number;
}

const UserLevelDisplay = ({ userLevel, totalSpent, totalPrizes }: UserLevelDisplayProps) => {
  const { spentProgress, prizesProgress, nextLevel } = getProgressToNextLevel(totalSpent, totalPrizes, userLevel);

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-card/80 border-primary/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">{userLevel.icon}</div>
          <div>
            <h3 className={`text-xl font-bold ${userLevel.color}`}>
              Nível {userLevel.level} - {userLevel.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              Seus benefícios especiais
            </p>
          </div>
        </div>
        <Badge variant="secondary" className={userLevel.color}>
          <Trophy className="w-3 h-3 mr-1" />
          Nível {userLevel.level}
        </Badge>
      </div>

      {/* Benefits */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold mb-2 text-primary">Benefícios Ativos:</h4>
        <ul className="space-y-1">
          {userLevel.benefits.map((benefit, index) => (
            <li key={index} className="text-xs text-muted-foreground flex items-center">
              <div className="w-1 h-1 bg-primary rounded-full mr-2" />
              {benefit}
            </li>
          ))}
        </ul>
      </div>

      {/* Progress to next level */}
      {nextLevel && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-primary flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" />
            Progresso para {nextLevel.name}
          </h4>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Gasto Total (R$ {totalSpent.toFixed(2)} / R$ {nextLevel.minSpent.toFixed(2)})</span>
                <span>{spentProgress.toFixed(0)}%</span>
              </div>
              <Progress value={spentProgress} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Prêmios ({totalPrizes} / {nextLevel.minPrizes})</span>
                <span>{prizesProgress.toFixed(0)}%</span>
              </div>
              <Progress value={prizesProgress} className="h-2" />
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-primary/20">
        <div className="text-center">
          <div className="text-lg font-bold text-primary">R$ {totalSpent.toFixed(2)}</div>
          <div className="text-xs text-muted-foreground">Total Investido</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-primary">{totalPrizes}</div>
          <div className="text-xs text-muted-foreground">Prêmios Conquistados</div>
        </div>
      </div>
    </Card>
  );
};

export default UserLevelDisplay;
