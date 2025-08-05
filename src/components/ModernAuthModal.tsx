import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Phone, User, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import MaskedInput from './MaskedInput';
import bannerImage from '@/assets/scratch-banner.jpg';

interface ModernAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ModernAuthModal = ({ isOpen, onClose }: ModernAuthModalProps) => {
  const { signUp, signInWithEmailOrPhone } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loginForm, setLoginForm] = useState({ 
    emailOrPhone: '', 
    password: '' 
  });
  
  const [registerForm, setRegisterForm] = useState({ 
    name: '', 
    email: '', 
    phone: '',
    password: '', 
    confirmPassword: '' 
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string) => {
    return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);
  };

  const validatePhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 11;
  };

  const validateLoginForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!loginForm.emailOrPhone) {
      newErrors.emailOrPhone = 'Email ou telefone é obrigatório';
    } else if (!loginForm.emailOrPhone.includes('@') && !validatePhone(loginForm.emailOrPhone)) {
      newErrors.emailOrPhone = 'Email ou telefone inválido';
    } else if (loginForm.emailOrPhone.includes('@') && !validateEmail(loginForm.emailOrPhone)) {
      newErrors.emailOrPhone = 'Email inválido';
    }
    
    if (!loginForm.password) {
      newErrors.password = 'Senha é obrigatória';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegisterForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!registerForm.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
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
    } else if (registerForm.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    if (!registerForm.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (registerForm.password !== registerForm.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLoginForm()) return;
    
    setLoading(true);
    const { error } = await signInWithEmailOrPhone(loginForm.emailOrPhone, loginForm.password);
    setLoading(false);
    
    if (!error) {
      onClose();
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRegisterForm()) return;
    
    setLoading(true);
    const { error } = await signUp(
      registerForm.email, 
      registerForm.password, 
      registerForm.name,
      registerForm.phone
    );
    setLoading(false);
    
    if (!error) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl lg:max-w-6xl max-w-md p-0 overflow-hidden bg-background border-primary/20">
        <div className="grid lg:grid-cols-2 lg:min-h-[600px]">
          {/* Banner Section */}
          <div className="relative lg:order-1 order-1 bg-gradient-to-br from-primary/90 to-primary lg:block">
            <div className="absolute inset-0 bg-black/20" />
            <img 
              src={bannerImage} 
              alt="Baú Premiado" 
              className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
            />
            <div className="relative z-10 p-4 lg:p-8 flex flex-col justify-center h-full text-white lg:min-h-[600px] min-h-[120px]">
              <div className="space-y-3 lg:space-y-6">
                <h1 className="text-xl lg:text-4xl xl:text-5xl font-bold text-center lg:text-left">
                  <span className="lg:block">Bem-vindo ao</span>
                  <span className="block gold-gradient bg-clip-text text-transparent">
                    Baú Premiado
                  </span>
                </h1>
                <p className="text-sm lg:text-xl opacity-90 text-center lg:text-left hidden lg:block">
                  Abra baús, ganhe prêmios incríveis e viva a emoção de descobrir tesouros únicos!
                </p>
                <div className="space-y-2 lg:space-y-3 hidden lg:block">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                    <span className="text-sm lg:text-base">Prêmios em dinheiro instantâneos</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                    <span className="text-sm lg:text-base">Produtos físicos entregues em casa</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                    <span className="text-sm lg:text-base">Sistema de níveis e conquistas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="lg:order-2 order-2 p-4 lg:p-8 flex flex-col justify-center">
            <div className="max-w-sm mx-auto w-full space-y-4 lg:space-y-6">
              <div className="text-center space-y-1 lg:space-y-2">
                <h2 className="text-2xl lg:text-3xl font-bold">Entrar</h2>
                <p className="text-muted-foreground text-sm lg:text-base">
                  Acesse sua conta ou crie uma nova
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
                      <Label htmlFor="emailOrPhone" className="flex items-center gap-2 text-sm">
                        <Mail className="w-3 h-3 lg:w-4 lg:h-4" />
                        Email ou Telefone
                      </Label>
                      <Input
                        id="emailOrPhone"
                        type="text"
                        placeholder="email@exemplo.com ou (11) 99999-9999"
                        value={loginForm.emailOrPhone}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, emailOrPhone: e.target.value }))}
                        className={`h-10 lg:h-11 ${errors.emailOrPhone ? 'border-destructive' : ''}`}
                      />
                      {errors.emailOrPhone && (
                        <p className="text-sm text-destructive">{errors.emailOrPhone}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="flex items-center gap-2 text-sm">
                        <Lock className="w-3 h-3 lg:w-4 lg:h-4" />
                        Senha
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
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
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center gap-2 text-sm">
                        <User className="w-3 h-3 lg:w-4 lg:h-4" />
                        Nome Completo
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Seu nome completo"
                        value={registerForm.name}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, name: e.target.value }))}
                        className={`h-10 lg:h-11 ${errors.name ? 'border-destructive' : ''}`}
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive">{errors.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2 text-sm">
                        <Mail className="w-3 h-3 lg:w-4 lg:h-4" />
                        Email
                      </Label>
                      <Input
                        id="email"
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

                    <div className="space-y-2">
                      <MaskedInput
                        id="phone"
                        label="Telefone"
                        type="phone"
                        placeholder="(11) 99999-9999"
                        value={registerForm.phone}
                        onChange={(value) => setRegisterForm(prev => ({ ...prev, phone: value }))}
                      />
                      {errors.phone && (
                        <p className="text-sm text-destructive">{errors.phone}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="registerPassword" className="flex items-center gap-2 text-sm">
                        <Lock className="w-3 h-3 lg:w-4 lg:h-4" />
                        Senha
                      </Label>
                      <div className="relative">
                        <Input
                          id="registerPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="Mínimo 6 caracteres"
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

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="flex items-center gap-2 text-sm">
                        <Lock className="w-3 h-3 lg:w-4 lg:h-4" />
                        Confirmar Senha
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

              <div className="text-center text-xs lg:text-sm text-muted-foreground px-2">
                <p>
                  Ao se cadastrar, você concorda com nossos{' '}
                  <a href="/termos-uso" className="text-primary hover:underline">
                    Termos de Uso
                  </a>{' '}
                  e{' '}
                  <a href="/politica-privacidade" className="text-primary hover:underline">
                    Política de Privacidade
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModernAuthModal;