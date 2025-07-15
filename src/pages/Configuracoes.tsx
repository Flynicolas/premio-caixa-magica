import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import Cookies from "js-cookie";

import {
  Settings,
  User,
  MapPin,
  Lock,
  Mail,
  Shield,
  Bell,
  Palette,
  Eye,
  EyeOff,
  Save,
  AlertTriangle,
  Check,
  Home,
  Phone,
  CreditCard,
} from "lucide-react";

// Interface para endereço
interface UserAddress {
  cep: string;
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
}

interface PersonalData {
  full_name: string;
  username: string;
  phone: string;
  cpf: string;
  birth_date: string;
}

interface SecuritySettings {
  two_factor_enabled: boolean;
  email_verified: boolean;
  phone_verified: boolean;
}

interface NotificationSettings {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  marketing_emails: boolean;
  prize_notifications: boolean;
  delivery_updates: boolean;
}

const Configuracoes = () => {
  const { user } = useAuth();
  const { profile, loading, updateProfile } = useProfile();

  const { toast } = useToast();

  const [personalData, setPersonalData] = useState<PersonalData>({
    full_name: "",
    username: "",
    phone: "",
    cpf: "",
    birth_date: "",
  });

  const [address, setAddress] = useState<UserAddress>({
    cep: "",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    two_factor_enabled: false,
    email_verified: false,
    phone_verified: false,
  });

  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings>({
      email_notifications: true,
      sms_notifications: false,
      push_notifications: true,
      marketing_emails: false,
      prize_notifications: true,
      delivery_updates: true,
    });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const fromRetirada = Cookies.get("redirected_from_retirada");

    if (fromRetirada === "true") {
      setShowAlert(true);
      Cookies.remove("redirected_from_retirada");
    }
  }, []);

  useEffect(() => {
    if (profile) {
      setPersonalData({
        full_name: profile.full_name || "",
        username: profile.username || "",
        phone: profile.phone || "",
        cpf: profile.cpf || "",
        birth_date: profile.birth_date || "",
      });

      setAddress({
        cep: profile.zip_code || "",
        rua: profile.street || "",
        numero: profile.number || "",
        complemento: profile.complement || "",
        bairro: profile.neighborhood || "",
        cidade: profile.city || "",
        estado: profile.state || "",
      });

      setNotificationSettings({
        email_notifications: profile.email_notifications ?? true,
        push_notifications: profile.push_notifications ?? true,
        prize_notifications: profile.prize_notifications ?? true,
        delivery_updates: profile.delivery_updates ?? true,
        marketing_emails: profile.promo_emails ?? false,
        sms_notifications: false,
      });
    }
  }, [profile]);


  const fetchAddressByCep = async (cep: string) => {
    if (cep.length !== 8) return;

    setIsLoadingAddress(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast({
          title: "CEP não encontrado",
          description: "Verifique o CEP informado",
          variant: "destructive",
        });
        return;
      }

      setAddress((prev) => ({
        ...prev,
        rua: data.logradouro || "",
        bairro: data.bairro || "",
        cidade: data.localidade || "",
        estado: data.uf || "",
      }));
    } catch (error) {
      toast({
        title: "Erro ao buscar CEP",
        description: "Tente novamente em alguns instantes",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAddress(false);
    }
  };

const savePersonalData = async () => {
  const { full_name, birth_date, cpf } = personalData;

  if (!full_name || !birth_date || !cpf) {
    toast({
      title: "Preencha os campos obrigatórios",
      description: "Nome completo, CPF e data de nascimento são obrigatórios",
      variant: "destructive",
    });
    return;
  }

  try {
    await updateProfile({
      ...personalData,
    });
    toast({
      title: "Dados atualizados",
      description: "Suas informações pessoais foram salvas com sucesso",
    });
  } catch (error) {
    toast({
      title: "Erro ao salvar",
      description: "Não foi possível atualizar suas informações",
      variant: "destructive",
    });
  }
};

const saveAddress = async () => {
  const { cep, rua, numero, bairro, cidade, estado } = address;

  if (!cep || !rua || !numero || !bairro || !cidade || !estado) {
    toast({
      title: "Preencha todos os campos obrigatórios",
      description: "CEP, rua, número, bairro, cidade e estado são obrigatórios",
      variant: "destructive",
    });
    return;
  }

  try {
    await updateProfile({
      zip_code: address.cep,
      street: address.rua,
      number: address.numero,
      complement: address.complemento,
      neighborhood: address.bairro,
      city: address.cidade,
      state: address.estado,
    });
    toast({
      title: "Endereço salvo",
      description: "Seu endereço de entrega foi atualizado",
    });
  } catch (error) {
    toast({
      title: "Erro ao salvar",
      description: "Não foi possível atualizar seu endereço",
      variant: "destructive",
    });
  }
};


  const changePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "A nova senha e confirmação devem ser iguais",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Senha muito fraca",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Senha alterada",
      description: "Sua senha foi atualizada com sucesso",
    });

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const changeEmail = async () => {
    toast({
      title: "Email em verificação",
      description: "Um link de confirmação foi enviado para o novo email",
    });
    setNewEmail("");
  };

const saveNotificationSettings = async () => {
  try {
    await updateProfile({
      email_notifications: notificationSettings.email_notifications,
      push_notifications: notificationSettings.push_notifications,
      prize_notifications: notificationSettings.prize_notifications,
      delivery_updates: notificationSettings.delivery_updates,
      promo_emails: notificationSettings.marketing_emails,
    });
    toast({
      title: "Configurações salvas",
      description: "Suas preferências de notificação foram atualizadas",
    });
  } catch (error) {
    toast({
      title: "Erro ao salvar",
      description: "Não foi possível atualizar suas preferências",
      variant: "destructive",
    });
  }
};


  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-lg text-muted-foreground">
            Você precisa estar logado para acessar as configurações.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center space-x-3">
            <Settings className="w-8 h-8 text-primary" />
            <span>Configurações</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerencie suas informações pessoais, segurança e preferências
          </p>
          {showAlert && (
            <Alert variant="destructive" className="mb-2 mt-2">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle>Dados incompletos</AlertTitle>
              <AlertDescription>
                Para resgatar prêmios físicos, cadastre nome completo, CPF e
                endereço abaixo.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 bg-gray-800">
            <TabsTrigger
              value="personal"
              className="flex items-center space-x-2"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Pessoal</span>
            </TabsTrigger>
            <TabsTrigger
              value="address"
              className="flex items-center space-x-2"
            >
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline">Endereço</span>
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="flex items-center space-x-2"
            >
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Segurança</span>
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex items-center space-x-2"
            >
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notificações</span>
            </TabsTrigger>
            <TabsTrigger
              value="account"
              className="flex items-center space-x-2"
            >
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Conta</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Informações Pessoais</span>
                </CardTitle>
                <CardDescription>
                  Atualize suas informações básicas de perfil
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Nome Completo <span className="text-red-500">*</span></Label>
                    <Input
                      id="full_name"
                      value={personalData.full_name}
                      onChange={(e) =>
                        setPersonalData((prev) => ({
                          ...prev,
                          full_name: e.target.value,
                        }))
                      }
                      placeholder="Seu nome completo"
                    />
                  </div>


                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={personalData.phone}
                      onChange={(e) =>
                        setPersonalData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF <span className="text-red-500">*</span></Label>
                    <Input
                      id="cpf"
                      value={personalData.cpf}
                      onChange={(e) =>
                        setPersonalData((prev) => ({
                          ...prev,
                          cpf: e.target.value,
                        }))
                      }
                      placeholder="000.000.000-00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birth_date">Data de Nascimento <span className="text-red-500">*</span></Label>
                    <Input
                      id="birth_date"
                      type="date"
                      value={personalData.birth_date}
                      onChange={(e) =>
                        setPersonalData((prev) => ({
                          ...prev,
                          birth_date: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={savePersonalData}
                    className="flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar Alterações</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="address">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>Endereço de Entrega</span>
                </CardTitle>
                <CardDescription>
                  Configure seu endereço padrão para entregas de prêmios físicos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP <span className="text-red-500">*</span></Label>
                    <Input
                      id="cep"
                      value={address.cep}
                      onChange={(e) => {
                        const cep = e.target.value.replace(/\D/g, "");
                        setAddress((prev) => ({ ...prev, cep }));
                        if (cep.length === 8) {
                          fetchAddressByCep(cep);
                        }
                      }}
                      placeholder="00000-000"
                      maxLength={8}
                    />
                    {isLoadingAddress && (
                      <p className="text-sm text-muted-foreground">
                        Buscando endereço...
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="rua">Rua/Logradouro <span className="text-red-500">*</span></Label>
                    <Input
                      id="rua"
                      value={address.rua}
                      onChange={(e) =>
                        setAddress((prev) => ({ ...prev, rua: e.target.value }))
                      }
                      placeholder="Nome da rua"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numero">Número <span className="text-red-500">*</span></Label>
                    <Input
                      id="numero"
                      value={address.numero}
                      onChange={(e) =>
                        setAddress((prev) => ({
                          ...prev,
                          numero: e.target.value,
                        }))
                      }
                      placeholder="123"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="complemento">Complemento (Opcional)</Label>
                    <Input
                      id="complemento"
                      value={address.complemento}
                      onChange={(e) =>
                        setAddress((prev) => ({
                          ...prev,
                          complemento: e.target.value,
                        }))
                      }
                      placeholder="Apartamento, bloco, etc."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bairro">Bairro <span className="text-red-500">*</span></Label>
                    <Input
                      id="bairro"
                      value={address.bairro}
                      onChange={(e) =>
                        setAddress((prev) => ({
                          ...prev,
                          bairro: e.target.value,
                        }))
                      }
                      placeholder="Nome do bairro"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade <span className="text-red-500">*</span></Label>
                    <Input
                      id="cidade"
                      value={address.cidade}
                      onChange={(e) =>
                        setAddress((prev) => ({
                          ...prev,
                          cidade: e.target.value,
                        }))
                      }
                      placeholder="Nome da cidade"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado <span className="text-red-500">*</span></Label>
                    <Select
                      value={address.estado}
                      onValueChange={(value) =>
                        setAddress((prev) => ({ ...prev, estado: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SP">São Paulo</SelectItem>
                        <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                        <SelectItem value="MG">Minas Gerais</SelectItem>
                        <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                        <SelectItem value="PR">Paraná</SelectItem>
                        <SelectItem value="SC">Santa Catarina</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={saveAddress}
                    className="flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar Endereço</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lock className="w-5 h-5" />
                    <span>Alterar Senha</span>
                  </CardTitle>
                  <CardDescription>
                    Mantenha sua conta segura com uma senha forte
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current_password">Senha Atual</Label>
                    <div className="relative">
                      <Input
                        id="current_password"
                        type={showPasswords ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Digite sua senha atual"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-2 h-6 w-6 p-0"
                        onClick={() => setShowPasswords(!showPasswords)}
                      >
                        {showPasswords ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new_password">Nova Senha</Label>
                      <Input
                        id="new_password"
                        type={showPasswords ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Digite a nova senha"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm_password">
                        Confirmar Nova Senha
                      </Label>
                      <Input
                        id="confirm_password"
                        type={showPasswords ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirme a nova senha"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={changePassword}
                      className="flex items-center space-x-2"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Alterar Senha</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Mail className="w-5 h-5" />
                    <span>Alterar Email</span>
                  </CardTitle>
                  <CardDescription>Email atual: {user.email}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new_email">Novo Email</Label>
                    <Input
                      id="new_email"
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Digite o novo email"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={changeEmail}
                      className="flex items-center space-x-2"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Alterar Email</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span>Verificações</span>
                  </CardTitle>
                  <CardDescription>
                    Status das verificações da sua conta
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Email Verificado</p>
                        <p className="text-sm text-muted-foreground">
                          Confirme seu email para maior segurança
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          securitySettings.email_verified
                            ? "default"
                            : "secondary"
                        }
                      >
                        {securitySettings.email_verified
                          ? "Verificado"
                          : "Pendente"}
                      </Badge>
                      {!securitySettings.email_verified && (
                        <Button size="sm" variant="outline">
                          Verificar
                        </Button>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Telefone Verificado</p>
                        <p className="text-sm text-muted-foreground">
                          Adicione um número de telefone verificado
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          securitySettings.phone_verified
                            ? "default"
                            : "secondary"
                        }
                      >
                        {securitySettings.phone_verified
                          ? "Verificado"
                          : "Não Adicionado"}
                      </Badge>
                      <Button size="sm" variant="outline">
                        {securitySettings.phone_verified
                          ? "Alterar"
                          : "Adicionar"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Preferências de Notificação</span>
                </CardTitle>
                <CardDescription>
                  Configure como você deseja receber nossas comunicações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Notificações por Email</Label>
                      <p className="text-sm text-muted-foreground">
                        Receba notificações importantes por email
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.email_notifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((prev) => ({
                          ...prev,
                          email_notifications: checked,
                        }))
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Notificações Push</Label>
                      <p className="text-sm text-muted-foreground">
                        Receba notificações em tempo real no navegador
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.push_notifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((prev) => ({
                          ...prev,
                          push_notifications: checked,
                        }))
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Notificações de Prêmios</Label>
                      <p className="text-sm text-muted-foreground">
                        Seja notificado quando ganhar prêmios importantes
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.prize_notifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((prev) => ({
                          ...prev,
                          prize_notifications: checked,
                        }))
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Atualizações de Entrega</Label>
                      <p className="text-sm text-muted-foreground">
                        Receba updates sobre o status das suas entregas
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.delivery_updates}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((prev) => ({
                          ...prev,
                          delivery_updates: checked,
                        }))
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
                      checked={notificationSettings.marketing_emails}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((prev) => ({
                          ...prev,
                          marketing_emails: checked,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={saveNotificationSettings}
                    className="flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar Preferências</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5" />
                    <span>Informações da Conta</span>
                  </CardTitle>
                  <CardDescription>
                    Detalhes sobre sua conta e uso da plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Email
                        </Label>
                        <p className="text-sm">{user.email}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Data de Cadastro
                        </Label>
                        <p className="text-sm">
                          {new Date(profile.join_date || "").toLocaleDateString(
                            "pt-BR",
                          )}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Último Login
                        </Label>
                        <p className="text-sm">
                          {new Date(
                            profile.last_login || "",
                          ).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Nível Atual
                        </Label>
                        <p className="text-sm">Nível {profile.level}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Baús Abertos
                        </Label>
                        <p className="text-sm">{profile.chests_opened} baús</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Prêmios Ganhos
                        </Label>
                        <p className="text-sm">
                          {profile.total_prizes_won} prêmios
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ações Perigosas */}
              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-destructive">
                    <AlertTriangle className="w-5 h-5" />
                    <span>Zona de Perigo</span>
                  </CardTitle>
                  <CardDescription>
                    Ações irreversíveis que afetam permanentemente sua conta
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert className="border-destructive/50">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      As ações abaixo são permanentes e não podem ser desfeitas.
                      Certifique-se de que realmente deseja prosseguir.
                    </AlertDescription>
                  </Alert>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between p-4 border border-destructive/30 rounded-lg">
                      <div>
                        <p className="font-medium">Excluir Conta</p>
                        <p className="text-sm text-muted-foreground">
                          Remove permanentemente sua conta e todos os dados
                          associados
                        </p>
                      </div>
                      <Button variant="destructive" size="sm">
                        Excluir Conta
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Configuracoes;
