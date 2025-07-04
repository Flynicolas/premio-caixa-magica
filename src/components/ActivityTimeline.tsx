
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserActivity } from '@/hooks/useProfile';
import { 
  Trophy, 
  Wallet, 
  Gift, 
  User, 
  Star,
  Clock,
  Zap
} from 'lucide-react';

interface ActivityTimelineProps {
  activities: UserActivity[];
  className?: string;
}

const ActivityTimeline = ({ activities, className = "" }: ActivityTimelineProps) => {
  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'chest_opened': return Trophy;
      case 'deposit': return Wallet;
      case 'prize_win': return Gift;
      case 'achievement_unlocked': return Star;
      case 'profile_updated': return User;
      case 'level_up': return Zap;
      default: return Clock;
    }
  };

  const getActivityColor = (activityType: string) => {
    switch (activityType) {
      case 'chest_opened': return 'text-blue-500 bg-blue-500/10';
      case 'deposit': return 'text-green-500 bg-green-500/10';
      case 'prize_win': return 'text-purple-500 bg-purple-500/10';
      case 'achievement_unlocked': return 'text-yellow-500 bg-yellow-500/10';
      case 'profile_updated': return 'text-cyan-500 bg-cyan-500/10';
      case 'level_up': return 'text-orange-500 bg-orange-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `${diffMins}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short'
    });
  };

  const getActivityTypeLabel = (activityType: string) => {
    switch (activityType) {
      case 'chest_opened': return 'Baú Aberto';
      case 'deposit': return 'Depósito';
      case 'prize_win': return 'Prêmio';
      case 'achievement_unlocked': return 'Conquista';
      case 'profile_updated': return 'Perfil';
      case 'level_up': return 'Level Up';
      default: return 'Atividade';
    }
  };

  if (activities.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Atividades Recentes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-6">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma atividade ainda</p>
            <p className="text-sm">Suas ações aparecerão aqui</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="w-5 h-5" />
          <span>Atividades Recentes</span>
          <Badge variant="secondary" className="ml-auto">
            {activities.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {activities.map((activity, index) => {
              const IconComponent = getActivityIcon(activity.activity_type);
              const colorClasses = getActivityColor(activity.activity_type);
              
              return (
                <div key={activity.id} className="flex items-start space-x-3">
                  {/* Timeline line */}
                  <div className="relative">
                    <div className={`p-2 rounded-full ${colorClasses}`}>
                      <IconComponent className="w-3 h-3" />
                    </div>
                    {index < activities.length - 1 && (
                      <div className="absolute top-8 left-1/2 w-px h-6 bg-border transform -translate-x-1/2" />
                    )}
                  </div>
                  
                  {/* Activity content */}
                  <div className="flex-1 min-w-0 pb-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">
                        {activity.description}
                      </p>
                      <div className="flex items-center space-x-2">
                        {activity.experience_gained > 0 && (
                          <Badge variant="outline" className="text-xs">
                            +{activity.experience_gained} XP
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          {getActivityTypeLabel(activity.activity_type)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-muted-foreground">
                        {formatDate(activity.created_at)}
                      </p>
                    </div>
                    
                    {/* Additional metadata */}
                    {Object.keys(activity.metadata || {}).length > 0 && (
                      <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                        <pre className="text-muted-foreground overflow-hidden">
                          {JSON.stringify(activity.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ActivityTimeline;
