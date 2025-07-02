
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const { signIn, signUp } = useAuth();
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signIn(loginForm.email, loginForm.password);
    
    if (!error) {
      onClose();
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerForm.password !== registerForm.confirmPassword) {
      alert('Senhas não coincidem!');
      return;
    }
    
    setLoading(true);
    const { error } = await signUp(registerForm.email, registerForm.password, registerForm.name);
    
    if (!error) {
      onClose();
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-card to-card/90 border-primary/30">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold gold-gradient bg-clip-text text-transparent">
            Bem-vindo ao Baú Premiado
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-secondary">
            <TabsTrigger value="login">Entrar</TabsTrigger>
            <TabsTrigger value="register">Cadastrar</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="email"
                placeholder="Seu email"
                value={loginForm.email}
                onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                required
                className="bg-secondary border-primary/20 focus:border-primary"
              />
              <Input
                type="password"
                placeholder="Sua senha"
                value={loginForm.password}
                onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                required
                className="bg-secondary border-primary/20 focus:border-primary"
              />
              <Button 
                type="submit" 
                className="w-full gold-gradient text-black font-bold"
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <Input
                type="text"
                placeholder="Seu nome completo"
                value={registerForm.name}
                onChange={(e) => setRegisterForm(prev => ({ ...prev, name: e.target.value }))}
                required
                className="bg-secondary border-primary/20 focus:border-primary"
              />
              <Input
                type="email"
                placeholder="Seu email"
                value={registerForm.email}
                onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                required
                className="bg-secondary border-primary/20 focus:border-primary"
              />
              <Input
                type="password"
                placeholder="Sua senha"
                value={registerForm.password}
                onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                required
                className="bg-secondary border-primary/20 focus:border-primary"
              />
              <Input
                type="password"
                placeholder="Confirme sua senha"
                value={registerForm.confirmPassword}
                onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                required
                className="bg-secondary border-primary/20 focus:border-primary"
              />
              <Button 
                type="submit" 
                className="w-full gold-gradient text-black font-bold"
                disabled={loading}
              >
                {loading ? 'Cadastrando...' : 'Cadastrar e Ganhar R$ 50'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
