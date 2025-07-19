import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useWallet } from '@/hooks/useWallet';
import { useRescueStats } from '@/hooks/useRescueStats';
import { useIsMobile } from '@/hooks/use-mobile';
import AddressAutoFill from '@/components/AddressAutoFill';
import MaskedInput from '@/components/MaskedInput';
import IOSDatePicker from '@/components/iOSDatePicker';
import DatePicker from '@/components/DatePicker';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  User, 
  MapPin, 
  Bell, 
  Shield, 
  Save,
  Loader2,
  AlertTriangle
} from 'lucide-react';

const Configuracoes = () => {
  const { user, signOut } = useAuth();
  const { profile, updateProfile, loading, saving, validateCPF } = useProfile();
  const { totalRescue } = useRescueStats();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Estado único para todos os dados do formulário
  const [formData, setFormData] = useState({
    // Dados pessoais
    full_name: '',
    username: '',
    email: '',
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

  // Carregar dados do perfil
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        username: profile.username || '',
        email: profile.email || '',
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

  const handleSaveAll = async () => {
    // Validações
    const hasWithdrawals = totalRescue > 0;
    
    if (hasWithdrawals) {
      if (!formData.cpf || !validateCPF(formData.cpf)) {
        toast({
          title: "❌ CPF obrigatório",
          description: "CPF é obrigatório e deve ser válido para quem já fez resgates.",
          variant: "destructive"
        });
        return;
      }
    }

    const result = await updateProfile(formData);
    if (!result.error) {
      toast({
        title: "✅ Perfil atualizado!",
        description: "Todas as suas informações foram salvas com sucesso.",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-lg text-muted-foreground">Você precisa estar logado para acessar as configurações.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie suas informações pessoais e preferências da conta
          </p>
        </div>

        <div className="space-y-8">
          {/* Informações Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informações Pessoais
              </CardTitle>
              <CardDescription>
                Atualize suas informações básicas de perfil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nome Completo</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    placeholder="Digite seu nome completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Nome de usuário</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="Digite seu nome de usuário"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  readOnly
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">
                  O email não pode ser alterado. Entre em contato com o suporte se necessário.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              {totalRescue > 0 && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    CPF é obrigatório para usuários que já fizeram resgates de prêmios.
                  </p>
                </div>
              )}

              {isMobile ? (
                <IOSDatePicker
                  id="birth_date"
                  label="Data de Nascimento"
                  value={formData.birth_date}
                  onChange={(value) => handleInputChange('birth_date', value)}
                />
              ) : (
                <DatePicker
                  id="birth_date"
                  label="Data de Nascimento"
                  value={formData.birth_date}
                  onChange={(value) => handleInputChange('birth_date', value)}
                  placeholder="Selecione sua data de nascimento"
                />
              )}
            </CardContent>
          </Card>

          {/* Endereço */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Endereço
              </CardTitle>
              <CardDescription>
                Mantenha seu endereço atualizado para entregas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AddressAutoFill
                cep={formData.zip_code}
                street={formData.street}
                neighborhood={formData.neighborhood}
                city={formData.city}
                state={formData.state}
                onCepChange={(cep) => handleInputChange('zip_code', cep)}
                onAddressChange={handleAddressChange}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    value={formData.number}
                    onChange={(e) => handleInputChange('number', e.target.value)}
                    placeholder="123"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    value={formData.complement}
                    onChange={(e) => handleInputChange('complement', e.target.value)}
                    placeholder="Apto, Bloco, etc."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notificações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Preferências de Notificação
              </CardTitle>
              <CardDescription>
                Configure como você gostaria de receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações por Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba emails sobre atividades importantes
                  </p>
                </div>
                <Switch
                  checked={formData.email_notifications}
                  onCheckedChange={(checked) => 
                    handleInputChange('email_notifications', checked)
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações Push</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações push no navegador
                  </p>
                </div>
                <Switch
                  checked={formData.push_notifications}
                  onCheckedChange={(checked) => 
                    handleInputChange('push_notifications', checked)
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações de Prêmios</Label>
                  <p className="text-sm text-muted-foreground">
                    Seja notificado quando ganhar prêmios
                  </p>
                </div>
                <Switch
                  checked={formData.prize_notifications}
                  onCheckedChange={(checked) => 
                    handleInputChange('prize_notifications', checked)
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Atualizações de Entrega</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba atualizações sobre suas entregas
                  </p>
                </div>
                <Switch
                  checked={formData.delivery_updates}
                  onCheckedChange={(checked) => 
                    handleInputChange('delivery_updates', checked)
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Emails Promocionais</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba ofertas especiais e promoções
                  </p>
                </div>
                <Switch
                  checked={formData.promo_emails}
                  onCheckedChange={(checked) => 
                    handleInputChange('promo_emails', checked)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Botão de Salvar Centralizado */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-center">
                <Button 
                  onClick={handleSaveAll} 
                  disabled={saving}
                  size="lg"
                  className="w-full md:w-auto min-w-[200px]"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Todas Alterações
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Zona de Perigo */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Shield className="w-5 h-5" />
                Zona de Perigo
              </CardTitle>
              <CardDescription>
                Ações irreversíveis que afetam sua conta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border border-destructive rounded-lg">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    <Label className="text-destructive">Sair da Conta</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Você será desconectado e precisará fazer login novamente
                  </p>
                </div>
                <Button variant="destructive" onClick={signOut}>
                  Sair
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Configuracoes;
