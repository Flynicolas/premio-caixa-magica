
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import LevelProgressCard from '@/components/LevelProgressCard';
import UserStatsCards from '@/components/UserStatsCards';
import AddressAutoFill from '@/components/AddressAutoFill';
import MaskedInput from '@/components/MaskedInput';
import DatePicker from '@/components/DatePicker';
import { useWallet } from '@/hooks/useWallet';
import { useRescueStats } from '@/hooks/useRescueStats';

import { 
  User, 
  MapPin,
  Settings,
  Save,
  Loader2
} from 'lucide-react';

const Perfil = () => {
  const { user } = useAuth();
  const { 
    profile, 
    userLevel, 
    allLevels,
    loading,
    saving,
    updateProfile,
    validateCPF
  } = useProfile();
  
  const { walletData } = useWallet();
  const { totalRescue } = useRescueStats();

  // Estados para os formulários
  const [formData, setFormData] = useState({
    // Dados pessoais
    full_name: '',
    username: '',
    phone: '',
    cpf: '',
    birth_date: '',
    
    // Endereço
    zip_code: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    
    // Notificações
    email_notifications: true,
    push_notifications: true,
    prize_notifications: true,
    delivery_updates: true,
    promo_emails: false
  });

  // Atualizar formulário quando profile carregar
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        username: profile.username || '',
        phone: profile.phone || '',
        cpf: profile.cpf || '',
        birth_date: profile.birth_date || '',
        zip_code: profile.zip_code || '',
        street: profile.street || '',
        number: profile.number || '',
        complement: profile.complement || '',
        neighborhood: profile.neighborhood || '',
        city: profile.city || '',
        state: profile.state || '',
        email_notifications: profile.email_notifications ?? true,
        push_notifications: profile.push_notifications ?? true,
        prize_notifications: profile.prize_notifications ?? true,
        delivery_updates: profile.delivery_updates ?? true,
        promo_emails: profile.promo_emails ?? false
      });
    }
  }, [profile]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressChange = (address: {
    street: string;
    neighborhood: string;
    city: string;
    state: string;
  }) => {
    setFormData(prev => ({
      ...prev,
      ...address
    }));
  };

  const handleSaveProfile = async () => {
    // Validações inteligentes
    const hasWithdrawals = totalRescue > 0;
    
    if (hasWithdrawals) {
      if (!formData.cpf || !validateCPF(formData.cpf)) {
        alert('CPF é obrigatório e deve ser válido para quem já fez resgates.');
        return;
      }
    }

    const result = await updateProfile(formData);
    if (!result.error) {
      // Sucesso já é mostrado no toast pelo hook
    }
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

        {/* Formulário Unificado */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Editar Perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Seção: Dados Pessoais */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Dados Pessoais</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Nome Completo</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    placeholder="Digite seu nome completo"
                  />
                </div>
                
                <div>
                  <Label htmlFor="username">Nome de usuário</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="Digite seu nome de usuário"
                  />
                </div>
                
                <MaskedInput
                  id="phone"
                  label="Telefone"
                  value={formData.phone}
                  onChange={(value) => handleInputChange('phone', value)}
                  type="phone"
                  placeholder="(00) 00000-0000"
                />
                
                <MaskedInput
                  id="cpf"
                  label="CPF"
                  value={formData.cpf}
                  onChange={(value) => handleInputChange('cpf', value)}
                  type="cpf"
                  placeholder="000.000.000-00"
                  required={totalRescue > 0}
                />
                
                <DatePicker
                  id="birth_date"
                  label="Data de Nascimento"
                  value={formData.birth_date}
                  onChange={(value) => handleInputChange('birth_date', value)}
                  placeholder="Selecione sua data de nascimento"
                />
              </div>
            </div>

            {/* Seção: Endereço */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Endereço</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <AddressAutoFill
                    cep={formData.zip_code}
                    street={formData.street}
                    neighborhood={formData.neighborhood}
                    city={formData.city}
                    state={formData.state}
                    onCepChange={(cep) => handleInputChange('zip_code', cep)}
                    onAddressChange={handleAddressChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    value={formData.number}
                    onChange={(e) => handleInputChange('number', e.target.value)}
                    placeholder="123"
                  />
                </div>
                
                <div>
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    value={formData.complement}
                    onChange={(e) => handleInputChange('complement', e.target.value)}
                    placeholder="Apto, Bloco, etc."
                  />
                </div>
              </div>
            </div>

            {/* Seção: Notificações */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Preferências de Notificação</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email_notifications">Notificações por Email</Label>
                  <Switch
                    id="email_notifications"
                    checked={formData.email_notifications}
                    onCheckedChange={(checked) => handleInputChange('email_notifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="push_notifications">Notificações Push</Label>
                  <Switch
                    id="push_notifications"
                    checked={formData.push_notifications}
                    onCheckedChange={(checked) => handleInputChange('push_notifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="prize_notifications">Notificações de Prêmios</Label>
                  <Switch
                    id="prize_notifications"
                    checked={formData.prize_notifications}
                    onCheckedChange={(checked) => handleInputChange('prize_notifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="delivery_updates">Atualizações de Entrega</Label>
                  <Switch
                    id="delivery_updates"
                    checked={formData.delivery_updates}
                    onCheckedChange={(checked) => handleInputChange('delivery_updates', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="promo_emails">Emails Promocionais</Label>
                  <Switch
                    id="promo_emails"
                    checked={formData.promo_emails}
                    onCheckedChange={(checked) => handleInputChange('promo_emails', checked)}
                  />
                </div>
              </div>
            </div>

            {/* Botão de Salvar */}
            <div className="pt-4 border-t">
              <Button 
                onClick={handleSaveProfile} 
                disabled={saving}
                className="w-full md:w-auto"
                size="lg"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Perfil;
