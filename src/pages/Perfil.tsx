
import { useState } from 'react';
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
  useState(() => {
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
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-lg">Carregando seu perfil...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-lg text-muted-foreground">Você precisa estar logado para ver seu perfil.</p>
      </div>
    );
  }

  return (
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
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard" className="flex items-center space-x-2">
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center space-x-2">
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">Conquistas</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center space-x-2">
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">Atividade</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Config</span>
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
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
                  benefits: JSON.parse(getNextLevel()!.benefits as any || '[]')
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
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Gerencie suas informações básicas e como você aparece no site
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nome Completo</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    disabled={!editMode}
                    placeholder="Seu nome completo"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="username">Nome de Usuário</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    disabled={!editMode}
                    placeholder="@seuusername"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Biografia</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  disabled={!editMode}
                  placeholder="Conte um pouco sobre você..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  value={profile.email} 
                  disabled 
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  O email não pode ser alterado por questões de segurança
                </p>
              </div>
              
              {editMode && (
                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => setEditMode(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveProfile}>
                    Salvar Alterações
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span>Todas as Conquistas</span>
                </div>
                <Badge variant="secondary">
                  {userAchievements.length}/{achievements.length}
                </Badge>
              </CardTitle>
              <CardDescription>
                Complete desafios para ganhar XP e desbloquear recompensas especiais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AchievementsGrid 
                achievements={achievements}
                userAchievements={userAchievements}
                userStats={{
                  chests_opened: profile.chests_opened,
                  total_spent: profile.total_spent
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <ActivityTimeline activities={activities} />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid gap-6">
            {/* Appearance Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="w-5 h-5" />
                  <span>Aparência</span>
                </CardTitle>
                <CardDescription>
                  Personalize a aparência da sua interface
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Tema</Label>
                    <p className="text-sm text-muted-foreground">
                      Escolha entre tema claro ou escuro
                    </p>
                  </div>
                  <Select 
                    value={preferences.theme} 
                    onValueChange={(value) => setPreferences({...preferences, theme: value})}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Escuro</SelectItem>
                      <SelectItem value="system">Sistema</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Notificações</span>
                </CardTitle>
                <CardDescription>
                  Configure como você quer receber notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificações por Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba notificações importantes por email
                    </p>
                  </div>
                  <Switch 
                    checked={preferences.notifications_email}
                    onCheckedChange={(checked) => 
                      setPreferences({...preferences, notifications_email: checked})
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificações Push</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba notificações instantâneas no navegador
                    </p>
                  </div>
                  <Switch 
                    checked={preferences.notifications_push}
                    onCheckedChange={(checked) => 
                      setPreferences({...preferences, notifications_push: checked})
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Privacidade</span>
                </CardTitle>
                <CardDescription>
                  Controle a visibilidade do seu perfil e dados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Perfil Público</Label>
                    <p className="text-sm text-muted-foreground">
                      Permitir que outros usuários vejam seu perfil
                    </p>
                  </div>
                  <Switch 
                    checked={preferences.profile_public}
                    onCheckedChange={(checked) => 
                      setPreferences({...preferences, profile_public: checked})
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mostrar Estatísticas</Label>
                    <p className="text-sm text-muted-foreground">
                      Exibir suas estatísticas no ranking público
                    </p>
                  </div>
                  <Switch 
                    checked={preferences.show_stats}
                    onCheckedChange={(checked) => 
                      setPreferences({...preferences, show_stats: checked})
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-destructive flex items-center space-x-2">
                  <Info className="w-5 h-5" />
                  <span>Zona de Perigo</span>
                </CardTitle>
                <CardDescription>
                  Ações irreversíveis da conta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/5">
                  <h3 className="font-semibold text-destructive mb-2">Sair da Conta</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Esta ação irá desconectar você da sua conta. Você precisará fazer login novamente.
                  </p>
                  <Button variant="destructive" onClick={signOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair da Conta
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Perfil;
