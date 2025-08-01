
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import LevelProgressCard from '@/components/LevelProgressCard';
import UserStatsCards from '@/components/UserStatsCards';
import { useWallet } from '@/hooks/useWalletProvider';
import { useRescueStats } from '@/hooks/useRescueStats';
import { useNavigate } from 'react-router-dom';
import { Settings, Edit } from 'lucide-react';

const Perfil = () => {
  const { user } = useAuth();
  const { 
    profile, 
    userLevel, 
    allLevels,
    loading
  } = useProfile();
  
  const { walletData } = useWallet();
  const { totalRescue } = useRescueStats();
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
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

  if (!user || !profile) {
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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
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

            {/* Botão para editar perfil */}
            <Button 
              onClick={() => navigate('/configuracoes')}
              className="flex items-center gap-2"
              size="lg"
            >
              <Edit className="w-4 h-4" />
              Editar Perfil
            </Button>
          </div>
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

        {/* Level Progress */}
        {userLevel && (
          <div className="mb-8">
            <LevelProgressCard 
              currentLevel={allLevels.find(l => l.level === userLevel.level)!}
              nextLevel={allLevels.find(l => l.level === userLevel.level + 1)}
              experience={profile.experience}
            />
          </div>
        )}

        {/* Informações Pessoais - Visualização */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Nome Completo</h4>
              <p className="text-base">{profile.full_name || 'Não informado'}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Username</h4>
              <p className="text-base">{profile.username || 'Não informado'}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Email</h4>
              <p className="text-base">{profile.email}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Telefone</h4>
              <p className="text-base">{profile.phone || 'Não informado'}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">CPF</h4>
              <p className="text-base">{profile.cpf || 'Não informado'}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Data de Nascimento</h4>
              <p className="text-base">
                {profile.birth_date ? new Date(profile.birth_date).toLocaleDateString('pt-BR') : 'Não informado'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Endereço - Visualização */}
        {(profile.zip_code || profile.street || profile.city) && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Endereço</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">CEP</h4>
                <p className="text-base">{profile.zip_code || 'Não informado'}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Rua</h4>
                <p className="text-base">{profile.street || 'Não informado'}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Número</h4>
                <p className="text-base">{profile.number || 'Não informado'}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Complemento</h4>
                <p className="text-base">{profile.complement || 'Não informado'}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Bairro</h4>
                <p className="text-base">{profile.neighborhood || 'Não informado'}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Cidade</h4>
                <p className="text-base">{profile.city || 'Não informado'}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Estado</h4>
                <p className="text-base">{profile.state || 'Não informado'}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Perfil;
