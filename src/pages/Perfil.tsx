import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  MapPin,
  Settings,
  CalendarIcon,
  Save,
  Loader2,
  Mail,
  Phone,
  CreditCard,
  Home
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const Perfil = () => {
  const { user } = useAuth();
  const { profile, loading, saving, updateProfile } = useProfile();
  const { toast } = useToast();

  // Estados do formulário
  const [formData, setFormData] = useState({
    // Dados pessoais
    full_name: '',
    username: '',
    bio: '',
    phone: '',
    cpf: '',
    birth_date: undefined as Date | undefined,
    
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

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Inicializar dados do formulário quando o perfil carregar
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        username: profile.username || '',
        bio: profile.bio || '',
        phone: profile.phone || '',
        cpf: profile.cpf || '',
        birth_date: profile.birth_date ? new Date(profile.birth_date) : undefined,
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

  // Preenchimento automático do CEP
  const handleCepChange = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, zip_code: cep }));

    if (cleanCep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            street: data.logradouro || prev.street,
            neighborhood: data.bairro || prev.neighborhood,
            city: data.localidade || prev.city,
            state: data.uf || prev.state
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  // Validações inteligentes
  const validateForWithdraw = () => {
    const errors = [];
    
    if (!formData.cpf || formData.cpf.length < 11) {
      errors.push('CPF é obrigatório para resgates');
    }
    
    if (!formData.full_name) {
      errors.push('Nome completo é obrigatório para resgates');
    }

    return errors;
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const updates = {
        ...formData,
        birth_date: formData.birth_date ? format(formData.birth_date, 'yyyy-MM-dd') : undefined
      };

      await updateProfile(updates);
      setIsEditing(false);
      
      toast({
        title: "✅ Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast({
        title: "❌ Erro ao salvar",
        description: "Ocorreu um erro ao salvar suas informações.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header do perfil */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center space-x-6">
              <Avatar className="w-24 h-24 border-4 border-primary shadow-lg">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="bg-primary text-black text-2xl font-bold">
                  {getInitials(profile.full_name || profile.email.charAt(0) || 'U')}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">{profile.full_name || 'Usuário'}</h1>
                <p className="text-muted-foreground">{profile.email}</p>
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <span className="text-lg">🎯</span>
                    <span>Nível {profile.level || 1}</span>
                  </Badge>
                  {profile.username && (
                    <Badge variant="outline">@{profile.username}</Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)}>
                  <User className="w-4 h-4 mr-2" />
                  Editar Perfil
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {isSaving ? 'Salvando...' : 'Salvar Tudo'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Formulário completo */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Perfil</CardTitle>
            <CardDescription>
              Mantenha suas informações atualizadas. CPF e dados de endereço são obrigatórios apenas para resgates.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Seção: Dados Pessoais */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Dados Pessoais</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nome Completo</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    placeholder="Digite seu nome completo"
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Nome de usuário</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="Digite seu nome de usuário"
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Telefone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(00) 00000-0000"
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">
                    <CreditCard className="w-4 h-4 inline mr-1" />
                    CPF <span className="text-xs text-yellow-500">(obrigatório para resgates)</span>
                  </Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => handleInputChange('cpf', e.target.value)}
                    placeholder="000.000.000-00"
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Data de Nascimento</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.birth_date && "text-muted-foreground"
                        )}
                        disabled={!isEditing}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.birth_date ? format(formData.birth_date, "PPP") : <span>Selecione uma data</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.birth_date}
                        onSelect={(date) => handleInputChange('birth_date', date)}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="bio">Biografia</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Conte um pouco sobre você..."
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Seção: Endereço */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Home className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Endereço</h3>
                <span className="text-xs text-yellow-500">(obrigatório para resgates)</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zip_code">CEP</Label>
                  <Input
                    id="zip_code"
                    value={formData.zip_code}
                    onChange={(e) => handleCepChange(e.target.value)}
                    placeholder="00000-000"
                    disabled={!isEditing}
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="street">Rua</Label>
                  <Input
                    id="street"
                    value={formData.street}
                    onChange={(e) => handleInputChange('street', e.target.value)}
                    placeholder="Nome da rua"
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    value={formData.number}
                    onChange={(e) => handleInputChange('number', e.target.value)}
                    placeholder="123"
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    value={formData.complement}
                    onChange={(e) => handleInputChange('complement', e.target.value)}
                    placeholder="Apto, Bloco, etc."
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    value={formData.neighborhood}
                    onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                    placeholder="Nome do bairro"
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Nome da cidade"
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="UF"
                    disabled={!isEditing}
                    maxLength={2}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Seção: Notificações */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Preferências de Notificação</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label>Notificações por Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba updates por email
                    </p>
                  </div>
                  <Switch
                    checked={formData.email_notifications}
                    onCheckedChange={(checked) => handleInputChange('email_notifications', checked)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label>Notificações Push</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba notificações no navegador
                    </p>
                  </div>
                  <Switch
                    checked={formData.push_notifications}
                    onCheckedChange={(checked) => handleInputChange('push_notifications', checked)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label>Notificações de Prêmios</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba avisos sobre prêmios ganhos
                    </p>
                  </div>
                  <Switch
                    checked={formData.prize_notifications}
                    onCheckedChange={(checked) => handleInputChange('prize_notifications', checked)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label>Updates de Entrega</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba avisos sobre suas entregas
                    </p>
                  </div>
                  <Switch
                    checked={formData.delivery_updates}
                    onCheckedChange={(checked) => handleInputChange('delivery_updates', checked)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label>Emails Promocionais</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba ofertas e promoções
                    </p>
                  </div>
                  <Switch
                    checked={formData.promo_emails}
                    onCheckedChange={(checked) => handleInputChange('promo_emails', checked)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>

            {/* Botão de salvar fixo */}
            {isEditing && (
              <div className="sticky bottom-0 bg-background p-4 border-t">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {isSaving ? 'Salvando...' : 'Salvar Todas as Alterações'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Perfil;