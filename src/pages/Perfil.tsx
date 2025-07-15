
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import LevelProgressCard from '@/components/LevelProgressCard';
import AchievementsGrid from '@/components/AchievementsGrid';
import UserStatsCards from '@/components/UserStatsCards';
import ActivityTimeline from '@/components/ActivityTimeline';
import { useActivities } from '@/hooks/useActivities';

import { 
  User, 
  Trophy, 
  History
} from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { useWithdrawItem } from '@/hooks/useWithdrawItem';
import { useRescueStats } from '@/hooks/useRescueStats';

const Perfil = () => {
  const { user } = useAuth();
  const { 
    profile, 
    userLevel, 
    achievements, 
    userAchievements, 
    recentAchievements,
    allLevels,
    loading,
  } = useProfile();
  
  const [currentTab, setCurrentTab] = useState('overview');
  const { activities } = useActivities();
  const { walletData } = useWallet();
  const { totalRescue } = useRescueStats();

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getNextLevel = () => {
    if (!userLevel) return null;
    return allLevels.find(level => level.level === userLevel.level + 1);
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-lg text-muted-foreground">Você precisa estar logado para ver seu perfil.</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Carregando dados do perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header com informações básicas */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-primary shadow-lg">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="bg-primary text-black text-2xl font-bold">
                  {getInitials(profile.full_name || profile.email.charAt(0) || 'U')}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">{profile.full_name || 'Usuário'}</h1>
              <p className="text-muted-foreground">{profile.email}</p>
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="flex items-center space-x-1">
                  <span className="text-lg">{userLevel?.icon || '🎯'}</span>
                  <span>Nível {userLevel?.level || 1}</span>
                </Badge>
                <Badge variant="secondary">{userLevel?.name || 'Iniciante'}</Badge>
                {profile.username && (
                  <Badge variant="outline">@{profile.username}</Badge>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {profile.bio && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">{profile.bio}</p>
          </div>
        )}
      </div>

      {/* Cards de estatísticas */}
      <UserStatsCards 
        stats={{
          total_rescue: totalRescue,
          total_spent: walletData?.total_deposited || 0,
          total_prizes_won: profile.total_prizes_won,
          chests_opened: profile.chests_opened,
          experience_points: profile.experience,
          level: profile.level,
          join_date: profile.join_date
        }}
        className="mb-8"
      />

      {/* Conteúdo principal em abas */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800/50">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center space-x-2">
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">Conquistas</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center space-x-2">
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">Atividades</span>
          </TabsTrigger>
        </TabsList>

        {/* Aba Visão Geral */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Level Progress */}
             {userLevel && (
  <LevelProgressCard 
    currentLevel={allLevels.find(l => l.level === userLevel.level)!}
    nextLevel={allLevels.find(l => l.level === userLevel.level + 1)}
    experience={profile.experience}
  />
)}

              {/* Recent Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <span>Conquistas Recentes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AchievementsGrid 
                   achievements={recentAchievements.map(a => a.achievement)} 
                    userAchievements={userAchievements}
                    userStats={{
                      chests_opened: profile.chests_opened,
                      total_spent: profile.total_spent
                    }}
                  />
                  {achievements.length > 6 && (
                    <div className="mt-4 text-center">
                      <Button variant="outline" onClick={() => setCurrentTab('achievements')}>
                        Ver Todas as Conquistas
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div>
              <ActivityTimeline activities={activities.slice(0, 10)} />
            </div>
          </div>
        </TabsContent>

        {/* Aba Conquistas */}
        <TabsContent value="achievements">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span>Todas as Conquistas</span>
              </CardTitle>
              <CardDescription>
                Acompanhe seu progresso e desbloqueie novas conquistas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AchievementsGrid 
                achievements={userAchievements.map(a => a.achievement)} 
                userAchievements={userAchievements}
                userStats={{
                  chests_opened: profile.chests_opened,
                  total_spent: profile.total_spent
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Atividades */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <History className="w-5 h-5" />
                <span>Histórico de Atividades</span>
              </CardTitle>
              <CardDescription>
                Veja todas as suas atividades recentes na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityTimeline activities={activities} />
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
      </div>
    </div>
  );
};

export default Perfil;
