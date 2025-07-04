
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { UserLevel } from '@/hooks/useProfile';
import { TrendingUp, Star, Trophy } from 'lucide-react';

interface LevelProgressCardProps {
  currentLevel: UserLevel;
  nextLevel?: UserLevel;
  experience: number;
  className?: string;
}

const LevelProgressCard = ({ 
  currentLevel, 
  nextLevel, 
  experience, 
  className = "" 
}: LevelProgressCardProps) => {
  const calculateProgress = () => {
    if (!nextLevel) return 100;
    
    const currentLevelExp = currentLevel.min_experience;
    const nextLevelExp = nextLevel.min_experience;
    const progressExp = experience - currentLevelExp;
    const requiredExp = nextLevelExp - currentLevelExp;
    
    return Math.min((progressExp / requiredExp) * 100, 100);
  };

  const getExperienceToNext = () => {
    if (!nextLevel) return 0;
    return nextLevel.min_experience - experience;
  };

  const getRarityGradient = (level: number) => {
    if (level >= 6) return 'from-yellow-400 via-yellow-500 to-orange-500';
    if (level >= 5) return 'from-purple-400 via-purple-500 to-pink-500';
    if (level >= 4) return 'from-blue-400 via-blue-500 to-cyan-500';
    if (level >= 3) return 'from-orange-400 via-orange-500 to-red-500';
    if (level >= 2) return 'from-cyan-400 via-cyan-500 to-blue-500';
    return 'from-green-400 via-green-500 to-emerald-500';
  };

  const progress = calculateProgress();
  const expToNext = getExperienceToNext();

  return (
    <Card className={`relative overflow-hidden ${className}`}>
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getRarityGradient(currentLevel.level)} opacity-5`} />
      
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">{currentLevel.icon}</div>
            <div>
              <CardTitle className="flex items-center space-x-2">
                <span style={{ color: currentLevel.color }}>
                  Nível {currentLevel.level}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {currentLevel.name}
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {experience.toLocaleString()} XP total
              </p>
            </div>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Trophy className="w-6 h-6 text-yellow-500" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Seu nível atual</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        {nextLevel && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Progresso para {nextLevel.name}
              </span>
              <span className="font-medium">
                {progress.toFixed(1)}%
              </span>
            </div>
            
            <Progress 
              value={progress} 
              className="h-3"
              style={{
                background: `linear-gradient(to right, ${currentLevel.color}20, ${currentLevel.color}40)`
              }}
            />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{experience - currentLevel.min_experience} XP</span>
              <span>
                {expToNext > 0 ? `${expToNext} XP restantes` : 'Nível máximo!'}
              </span>
            </div>
          </div>
        )}

        {/* Level Benefits */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm font-medium">
            <Star className="w-4 h-4 text-yellow-500" />
            <span>Benefícios Ativos:</span>
          </div>
          
          <div className="grid gap-1">
            {currentLevel.benefits?.map((benefit, index) => (
              <div 
                key={index}
                className="flex items-center space-x-2 text-xs text-muted-foreground"
              >
                <div 
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: currentLevel.color }}
                />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Next Level Preview */}
        {nextLevel && (
          <div className="pt-3 border-t border-border/50">
            <div className="flex items-center space-x-2 text-sm">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span className="font-medium">Próximo: {nextLevel.name}</span>
              <div className="text-lg">{nextLevel.icon}</div>
            </div>
            
            <div className="mt-2 text-xs text-muted-foreground">
              Novos benefícios quando alcançar nível {nextLevel.level}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LevelProgressCard;
