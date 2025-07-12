
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import LevelProgressCard from '@/components/LevelProgressCard';
import AchievementsGrid from '@/components/AchievementsGrid';
import UserStatsCards from '@/components/UserStatsCards';
import ActivityTimeline from '@/components/ActivityTimeline';
import { 
  User, 
  Trophy, 
  History, 
  Settings,
  Camera,
  Save,
  LogOut,
  Palette,
  Bell,
  Shield,
  Globe,
  Info
} from 'lucide-react';

const Perfil = () => {
  const { user, signOut } = useAuth();
  const { 
    profile, 
    userLevel, 
    achievements, 
    userAchievements, 
    activities,
    allLevels,
    loading,
    updateProfile,
    logActivity
  } = useProfile();
  
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    bio: '',
    avatar_url: ''
  });
  const [preferences, setPreferences] = useState({
    theme: 'dark',
    notifications_email: true,
    notifications_push: true,
    profile_public: true,
    show_stats: true
  });

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        username: profile.username || '',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || ''
      });
      setPreferences({
        ...preferences,
        ...profile.preferences
      });
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!profile) return;
    
    const result = await updateProfile({
      ...formData,
      preferences: preferences
    });
    
    if (!result.error) {
      setEditMode(false);
      await logActivity(
        'profile_updated',
        'Perfil atualizado com sucesso',
        { updated_fields: Object.keys(formData) }
      );
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getNextLevel = () => {
    if (!userLevel) return null;
    return allLevels.find(level => level.level === userLevel.level + 1);
  };

  if (loading || !profile || !userLevel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="container mx-auto px-4 py-8 text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-lg">Carregando seu perfil...</p>
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
              {editMode && (
                <Button
                  size="sm"
                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                  variant="secondary"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">{profile.full_name || 'Usuário'}</h1>
              <p className="text-muted-foreground">{profile.email}</p>
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="flex items-center space-x-1">
                  <span className="text-lg">{userLevel.icon}</span>
                  <span>Nível {userLevel.level}</span>
                </Badge>
                <Badge variant="secondary">{userLevel.name}</Badge>
                {profile.username && (
                  <Badge variant="outline">@{profile.username}</Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => setEditMode(!editMode)}
              className="flex items-center space-x-2"
            >
              {editMode ? <Save className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
              <span>{editMode ? 'Salvar' : 'Editar'}</span>
            </Button>
            {editMode && (
              <Button
                variant="ghost"
                onClick={() => setEditMode(false)}
              >
                Cancelar
              </Button>
            )}
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
          total_spent: profile.total_spent,
          total_prizes_won: profile.total_prizes_won,
          chests_opened: profile.chests_opened,
          experience_points: profile.experience_points,
          level: profile.level,
          join_date: profile.join_date
        }}
        className="mb-8"
      />

      {/* Conteúdo principal em abas */}
      <div className="space-y-6">
        {/* Dashboard Tab - Always visible */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Level Progress */}
            <LevelProgressCard 
              currentLevel={{
                ...userLevel,
                min_experience: allLevels.find(l => l.level === userLevel.level)?.min_experience || 0,
                max_experience: allLevels.find(l => l.level === userLevel.level)?.max_experience
              }}
              nextLevel={getNextLevel() ? {
                ...getNextLevel()!,
                benefits: getNextLevel()!.benefits
              } : undefined}
              experience={profile.experience_points}
            />
            
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
                  achievements={achievements.slice(0, 6)}
                  userAchievements={userAchievements}
                  userStats={{
                    chests_opened: profile.chests_opened,
                    total_spent: profile.total_spent
                  }}
                />
              </CardContent>
            </Card>
          </div>
          
          <div>
            <ActivityTimeline activities={activities.slice(0, 10)} />
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Perfil;
