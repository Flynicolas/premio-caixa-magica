import { Badge } from '@/components/ui/badge';
import { Crown, Star, Award, Trophy } from 'lucide-react';

interface ReferralLevelBadgeProps {
  totalReferrals: number;
  className?: string;
}

const ReferralLevelBadge = ({ totalReferrals, className = "" }: ReferralLevelBadgeProps) => {
  const getLevelInfo = (referrals: number) => {
    if (referrals >= 100) return { 
      level: "Embaixador", 
      icon: Crown, 
      color: "bg-gradient-to-r from-purple-500 to-purple-600 text-white", 
      nextTarget: null 
    };
    if (referrals >= 50) return { 
      level: "Especialista", 
      icon: Trophy, 
      color: "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white", 
      nextTarget: 100 
    };
    if (referrals >= 20) return { 
      level: "Avançado", 
      icon: Award, 
      color: "bg-gradient-to-r from-blue-500 to-blue-600 text-white", 
      nextTarget: 50 
    };
    if (referrals >= 5) return { 
      level: "Intermediário", 
      icon: Star, 
      color: "bg-gradient-to-r from-green-500 to-green-600 text-white", 
      nextTarget: 20 
    };
    return { 
      level: "Iniciante", 
      icon: Star, 
      color: "bg-gradient-to-r from-gray-500 to-gray-600 text-white", 
      nextTarget: 5 
    };
  };

  const levelInfo = getLevelInfo(totalReferrals);
  const IconComponent = levelInfo.icon;

  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      <Badge className={`${levelInfo.color} border-0 px-3 py-1`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {levelInfo.level}
      </Badge>
      {levelInfo.nextTarget && (
        <span className="text-xs text-muted-foreground">
          {levelInfo.nextTarget - totalReferrals} para próximo nível
        </span>
      )}
    </div>
  );
};

export default ReferralLevelBadge;