import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Mail, Phone, User, Lock, Eye, EyeOff, CreditCard, Calendar } from 'lucide-react';
import { useAdvancedAuth } from '@/hooks/useAdvancedAuth';
import MaskedInput from './MaskedInput';
import bannerImage from '@/assets/scratch-banner.jpg';

interface AdvancedAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdvancedAuthModal = ({ isOpen, onClose }: AdvancedAuthModalProps) => {
  const { signUp, signIn, loading, validateCPF } = useAdvancedAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loginForm, setLoginForm] = useState({ 
    identifier: '', 
    password: '',
    rememberMe: false
  });
  
  const [registerForm, setRegisterForm] = useState({ 
    fullName: '',
    cpf: '',
    birthDate: '',
    email: '', 
    phone: '',
    password: '', 
    confirmPassword: '',
    referralCode: '',
    rememberMe: false,
    acceptTerms: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string) => {
    return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);
  };

  const validatePhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 11;
  };

  const validateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1 >= 18;
    }
    
    return age >= 18;
  };

  const validateLoginForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!loginForm.identifier.trim()) {
      newErrors.identifier = 'Email, CPF ou telefone é obrigatório';
    } else if (loginForm.identifier.includes('@') && !validateEmail(loginForm.identifier)) {
      newErrors.identifier = 'Email inválido';
    } else if (!loginForm.identifier.includes('@') && loginForm.identifier.replace(/\D/g, '').length < 10) {
      newErrors.identifier = 'CPF ou telefone inválido';
    }
    
    if (!loginForm.password) {
      newErrors.password = 'Senha é obrigatória';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegisterForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!registerForm.fullName.trim()) {
      newErrors.fullName = 'Nome completo é obrigatório';
    } else if (registerForm.fullName.trim().split(' ').length < 2) {
      newErrors.fullName = 'Digite nome e sobrenome';
    }

    if (!registerForm.cpf) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!validateCPF(registerForm.cpf)) {
      newErrors.cpf = 'CPF inválido';
    }

    if (!registerForm.birthDate) {
      newErrors.birthDate = 'Data de nascimento é obrigatória';
    } else if (!validateAge(registerForm.birthDate)) {
      newErrors.birthDate = 'Você deve ter pelo menos 18 anos';
    }
    
    if (!registerForm.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!validateEmail(registerForm.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!registerForm.phone) {
      newErrors.phone = 'Telefone é obrigatório';
    } else if (!validatePhone(registerForm.phone)) {
      newErrors.phone = 'Telefone inválido';
    }
    
    if (!registerForm.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (registerForm.password.length < 8) {
      newErrors.password = 'Senha deve ter pelo menos 8 caracteres';
    }
    
    if (!registerForm.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (registerForm.password !== registerForm.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    if (!registerForm.acceptTerms) {
      newErrors.acceptTerms = 'Você deve aceitar os termos e políticas';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLoginForm()) return;
    
    const result = await signIn({
      identifier: loginForm.identifier,
      password: loginForm.password,
      rememberMe: loginForm.rememberMe
    });
    
    if (result.success) {
      onClose();
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRegisterForm()) return;
    
    const result = await signUp({
      fullName: registerForm.fullName,
      cpf: registerForm.cpf,
      birthDate: registerForm.birthDate,
      email: registerForm.email,
      phone: registerForm.phone,
      password: registerForm.password,
      referralCode: registerForm.referralCode || undefined,
      rememberMe: registerForm.rememberMe
    });
    
    if (result.success) {
      onClose();
    }
  };

  // Real-time CPF validation
  const handleCPFChange = (value: string) => {
    setRegisterForm(prev => ({ ...prev, cpf: value }));
    
    if (value && !validateCPF(value)) {
      setErrors(prev => ({ ...prev, cpf: 'CPF inválido' }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.cpf;
        return newErrors;
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl lg:max-w-6xl max-w-md p-0 overflow-hidden bg-background border-primary/20">
        <div className="grid lg:grid-cols-2 lg:min-h-[700px]">
          {/* Banner Section */}
          <div className="relative lg:order-1 order-1 bg-gradient-to-br from-primary/90 to-primary lg:block">
            <div className="absolute inset-0 bg-black/20" />
            <img 
              src={bannerImage} 
              alt="Baú Premiado" 
              className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
            />
            <div className="relative z-10 p-4 lg:p-8 flex flex-col justify-center h-full text-white lg:min-h-[700px] min-h-[120px]">
              <div className="space-y-3 lg:space-y-6">
                <h1 className="text-xl lg:text-4xl xl:text-5xl font-bold text-center lg:text-left">
                  <span className="lg:block">Bem-vindo ao</span>
                  <span className="block gold-gradient bg-clip-text text-transparent">
                    Baú Premiado
                  </span>
                </h1>
                <p className="text-sm lg:text-xl opacity-90 text-center lg:text-left hidden lg:block">
                  Cadastre-se agora e ganhe prêmios incríveis! Sistema 100% seguro e confiável.
                </p>
                <div className="space-y-2 lg:space-y-3 hidden lg:block">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                    <span className="text-sm lg:text-base">Cadastro rápido e seguro</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                    <span className="text-sm lg:text-base">Login com CPF, email ou telefone</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                    <span className="text-sm lg:text-base">Prêmios instantâneos garantidos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="lg:order-2 order-2 p-4 lg:p-8 flex flex-col justify-center max-h-[700px] overflow-y-auto">
            <div className="max-w-sm mx-auto w-full space-y-4 lg:space-y-6">
              <div className="text-center space-y-1 lg:space-y-2">
                <h2 className="text-2xl lg:text-3xl font-bold">Acesso</h2>
                <p className="text-muted-foreground text-sm lg:text-base">
                  Entre na sua conta ou cadastre-se
                </p>
              </div>

              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4 lg:mb-6">
                  <TabsTrigger value="login" className="text-sm">Entrar</TabsTrigger>
                  <TabsTrigger value="register" className="text-sm">Cadastrar</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-3 lg:space-y-4">
                  <form onSubmit={handleLogin} className="space-y-3 lg:space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="identifier" className="flex items-center gap-2 text-sm">
                        <Mail className="w-3 h-3 lg:w-4 lg:h-4" />
                        Email, CPF ou Telefone
                      </Label>
                      <Input
                        id="identifier"
                        type="text"
                        placeholder="Digite seu email, CPF ou telefone"
                        value={loginForm.identifier}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, identifier: e.target.value }))}
                        className={`h-10 lg:h-11 ${errors.identifier ? 'border-destructive' : ''}`}
                      />
                      {errors.identifier && (
                        <p className="text-sm text-destructive">{errors.identifier}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="loginPassword" className="flex items-center gap-2 text-sm">
                        <Lock className="w-3 h-3 lg:w-4 lg:h-4" />
                        Senha
                      </Label>
                      <div className="relative">
                        <Input
                          id="loginPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="Sua senha"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                          className={`h-10 lg:h-11 pr-10 ${errors.password ? 'border-destructive' : ''}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-3 h-3 lg:w-4 lg:h-4" /> : <Eye className="w-3 h-3 lg:w-4 lg:h-4" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-sm text-destructive">{errors.password}</p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="rememberLogin"
                        checked={loginForm.rememberMe}
                        onCheckedChange={(checked) => setLoginForm(prev => ({ ...prev, rememberMe: !!checked }))}
                      />
                      <Label htmlFor="rememberLogin" className="text-sm">
                        Manter conectado
                      </Label>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full gold-gradient text-black font-bold h-10 lg:h-11"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-3 h-3 lg:w-4 lg:h-4 mr-2 animate-spin" />
                          Entrando...
                        </>
                      ) : (
                        'Entrar'
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register" className="space-y-3 lg:space-y-4">
                  <form onSubmit={handleRegister} className="space-y-3 lg:space-y-4">
                    {/* Nome Completo */}
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="flex items-center gap-2 text-sm">
                        <User className="w-3 h-3 lg:w-4 lg:h-4" />
                        Nome Completo *
                      </Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Digite seu nome completo"
                        value={registerForm.fullName}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, fullName: e.target.value }))}
                        className={`h-10 lg:h-11 ${errors.fullName ? 'border-destructive' : ''}`}
                      />
                      {errors.fullName && (
                        <p className="text-sm text-destructive">{errors.fullName}</p>
                      )}
                    </div>

                    {/* CPF */}
                    <div className="space-y-2">
                      <MaskedInput
                        id="cpf"
                        label="CPF *"
                        type="cpf"
                        placeholder="000.000.000-00"
                        value={registerForm.cpf}
                        onChange={handleCPFChange}
                        icon={<CreditCard className="w-3 h-3 lg:w-4 lg:h-4" />}
                      />
                      {errors.cpf && (
                        <p className="text-sm text-destructive">{errors.cpf}</p>
                      )}
                    </div>

                    {/* Data de Nascimento */}
                    <div className="space-y-2">
                      <Label htmlFor="birthDate" className="flex items-center gap-2 text-sm">
                        <Calendar className="w-3 h-3 lg:w-4 lg:h-4" />
                        Data de Nascimento *
                      </Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={registerForm.birthDate}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, birthDate: e.target.value }))}
                        className={`h-10 lg:h-11 ${errors.birthDate ? 'border-destructive' : ''}`}
                      />
                      {errors.birthDate && (
                        <p className="text-sm text-destructive">{errors.birthDate}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="registerEmail" className="flex items-center gap-2 text-sm">
                        <Mail className="w-3 h-3 lg:w-4 lg:h-4" />
                        Email *
                      </Label>
                      <Input
                        id="registerEmail"
                        type="email"
                        placeholder="seu@email.com"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                        className={`h-10 lg:h-11 ${errors.email ? 'border-destructive' : ''}`}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email}</p>
                      )}
                    </div>

                    {/* Telefone */}
                    <div className="space-y-2">
                      <MaskedInput
                        id="registerPhone"
                        label="Telefone *"
                        type="phone"
                        placeholder="(11) 99999-9999"
                        value={registerForm.phone}
                        onChange={(value) => setRegisterForm(prev => ({ ...prev, phone: value }))}
                        icon={<Phone className="w-3 h-3 lg:w-4 lg:h-4" />}
                      />
                      {errors.phone && (
                        <p className="text-sm text-destructive">{errors.phone}</p>
                      )}
                    </div>

                    {/* Código de Indicação (Opcional) */}
                    <div className="space-y-2">
                      <Label htmlFor="referralCode" className="text-sm text-muted-foreground">
                        Código de Indicação (opcional)
                      </Label>
                      <Input
                        id="referralCode"
                        type="text"
                        placeholder="Digite se tiver um código"
                        value={registerForm.referralCode}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, referralCode: e.target.value }))}
                        className="h-10 lg:h-11"
                      />
                    </div>

                    {/* Senha */}
                    <div className="space-y-2">
                      <Label htmlFor="registerPassword" className="flex items-center gap-2 text-sm">
                        <Lock className="w-3 h-3 lg:w-4 lg:h-4" />
                        Senha *
                      </Label>
                      <div className="relative">
                        <Input
                          id="registerPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="Mínimo 8 caracteres"
                          value={registerForm.password}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                          className={`h-10 lg:h-11 pr-10 ${errors.password ? 'border-destructive' : ''}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-3 h-3 lg:w-4 lg:h-4" /> : <Eye className="w-3 h-3 lg:w-4 lg:h-4" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-sm text-destructive">{errors.password}</p>
                      )}
                    </div>

                    {/* Confirmar Senha */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="flex items-center gap-2 text-sm">
                        <Lock className="w-3 h-3 lg:w-4 lg:h-4" />
                        Confirmar Senha *
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirme sua senha"
                          value={registerForm.confirmPassword}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className={`h-10 lg:h-11 pr-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmPassword ? <EyeOff className="w-3 h-3 lg:w-4 lg:h-4" /> : <Eye className="w-3 h-3 lg:w-4 lg:h-4" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                      )}
                    </div>

                    {/* Manter Conectado */}
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="rememberRegister"
                        checked={registerForm.rememberMe}
                        onCheckedChange={(checked) => setRegisterForm(prev => ({ ...prev, rememberMe: !!checked }))}
                      />
                      <Label htmlFor="rememberRegister" className="text-sm">
                        Manter conectado
                      </Label>
                    </div>

                    {/* Aceitar Termos */}
                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="acceptTerms"
                        checked={registerForm.acceptTerms}
                        onCheckedChange={(checked) => setRegisterForm(prev => ({ ...prev, acceptTerms: !!checked }))}
                      />
                      <Label htmlFor="acceptTerms" className="text-xs leading-relaxed">
                        Aceito os{' '}
                        <a href="/termos-uso" className="text-primary hover:underline">
                          Termos de Uso
                        </a>{' '}
                        e a{' '}
                        <a href="/politica-privacidade" className="text-primary hover:underline">
                          Política de Privacidade
                        </a>
                      </Label>
                    </div>
                    {errors.acceptTerms && (
                      <p className="text-sm text-destructive">{errors.acceptTerms}</p>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full gold-gradient text-black font-bold h-10 lg:h-11"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-3 h-3 lg:w-4 lg:h-4 mr-2 animate-spin" />
                          Criando conta...
                        </>
                      ) : (
                        'Criar Conta'
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedAuthModal;