
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
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
  const { profile, updateProfile, loading, saving } = useProfile();
  const { toast } = useToast();

  // Estados para formulários
  const [personalInfo, setPersonalInfo] = useState({
    full_name: '',
    username: '',
    phone: '',
    cpf: '',
    birth_date: ''
  });

  const [addressInfo, setAddressInfo] = useState({
    zip_code: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: ''
  });

  const [notifications, setNotifications] = useState({
    email_notifications: true,
    push_notifications: true,
    prize_notifications: true,
    delivery_updates: true,
    promo_emails: false
  });

  // Carregar dados do perfil
  useEffect(() => {
    if (profile) {
      setPersonalInfo({
        full_name: profile.full_name || '',
        username: profile.username || '',
        phone: profile.phone || '',
        cpf: profile.cpf || '',
        birth_date: profile.birth_date || ''
      });

      setAddressInfo({
        zip_code: profile.zip_code || '',
        street: profile.street || '',
        number: profile.number || '',
        complement: profile.complement || '',
        neighborhood: profile.neighborhood || '',
        city: profile.city || '',
        state: profile.state || ''
      });

      setNotifications({
        email_notifications: profile.email_notifications ?? true,
        push_notifications: profile.push_notifications ?? true,
        prize_notifications: profile.prize_notifications ?? true,
        delivery_updates: profile.delivery_updates ?? true,
        promo_emails: profile.promo_emails ?? false
      });
    }
  }, [profile]);

  const handlePersonalInfoSave = async () => {
    const result = await updateProfile(personalInfo);
    if (!result?.error) {
      toast({
        title: "✅ Informações pessoais atualizadas!",
        description: "Seus dados foram salvos com sucesso.",
      });
    }
  };

  const handleAddressSave = async () => {
    const result = await updateProfile(addressInfo);
    if (!result?.error) {
      toast({
        title: "✅ Endereço atualizado!",
        description: "Seu endereço foi salvo com sucesso.",
      });
    }
  };

  const handleNotificationsSave = async () => {
    const result = await updateProfile(notifications);
    if (!result?.error) {
      toast({
        title: "✅ Preferências de notificação atualizadas!",
        description: "Suas configurações foram salvas com sucesso.",
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
                    value={personalInfo.full_name}
                    onChange={(e) => setPersonalInfo({...personalInfo, full_name: e.target.value})}
                    placeholder="Digite seu nome completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Nome de usuário</Label>
                  <Input
                    id="username"
                    value={personalInfo.username}
                    onChange={(e) => setPersonalInfo({...personalInfo, username: e.target.value})}
                    placeholder="Digite seu nome de usuário"
                  />
                </div>
              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={personalInfo.phone}
                    onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={personalInfo.cpf}
                    onChange={(e) => setPersonalInfo({...personalInfo, cpf: e.target.value})}
                    placeholder="000.000.000-00"
                  />
                  <p className="text-xs text-muted-foreground">
                    CPF é obrigatório apenas para resgates de prêmios
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="birth_date">Data de Nascimento</Label>
                <Input
                  id="birth_date"
                  value={personalInfo.birth_date}
                  onChange={(e) => setPersonalInfo({...personalInfo, birth_date: e.target.value})}
                  placeholder="DD/MM/AAAA"
                />
              </div>

              <Button onClick={handlePersonalInfoSave} disabled={saving} className="w-full md:w-auto">
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {saving ? 'Salvando...' : 'Salvar Informações Pessoais'}
              </Button>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zip_code">CEP</Label>
                  <Input
                    id="zip_code"
                    value={addressInfo.zip_code}
                    onChange={(e) => setAddressInfo({...addressInfo, zip_code: e.target.value})}
                    placeholder="00000-000"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="street">Rua</Label>
                  <Input
                    id="street"
                    value={addressInfo.street}
                    onChange={(e) => setAddressInfo({...addressInfo, street: e.target.value})}
                    placeholder="Nome da rua"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    value={addressInfo.number}
                    onChange={(e) => setAddressInfo({...addressInfo, number: e.target.value})}
                    placeholder="123"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    value={addressInfo.complement}
                    onChange={(e) => setAddressInfo({...addressInfo, complement: e.target.value})}
                    placeholder="Apto, Bloco, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    value={addressInfo.neighborhood}
                    onChange={(e) => setAddressInfo({...addressInfo, neighborhood: e.target.value})}
                    placeholder="Nome do bairro"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={addressInfo.city}
                    onChange={(e) => setAddressInfo({...addressInfo, city: e.target.value})}
                    placeholder="Nome da cidade"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={addressInfo.state}
                    onChange={(e) => setAddressInfo({...addressInfo, state: e.target.value})}
                    placeholder="UF"
                  />
                </div>
              </div>

              <Button onClick={handleAddressSave} disabled={saving} className="w-full md:w-auto">
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {saving ? 'Salvando...' : 'Salvar Endereço'}
              </Button>
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
                  checked={notifications.email_notifications}
                  onCheckedChange={(checked) => 
                    setNotifications({...notifications, email_notifications: checked})
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
                  checked={notifications.push_notifications}
                  onCheckedChange={(checked) => 
                    setNotifications({...notifications, push_notifications: checked})
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
                  checked={notifications.prize_notifications}
                  onCheckedChange={(checked) => 
                    setNotifications({...notifications, prize_notifications: checked})
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
                  checked={notifications.delivery_updates}
                  onCheckedChange={(checked) => 
                    setNotifications({...notifications, delivery_updates: checked})
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
                  checked={notifications.promo_emails}
                  onCheckedChange={(checked) => 
                    setNotifications({...notifications, promo_emails: checked})
                  }
                />
              </div>

              <Button onClick={handleNotificationsSave} disabled={saving} className="w-full md:w-auto">
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {saving ? 'Salvando...' : 'Salvar Preferências'}
              </Button>
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
