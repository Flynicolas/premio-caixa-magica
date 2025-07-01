
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin?: (user: { name: string; email: string }) => void;
}

const LoginModal = ({ isOpen, onClose, onLogin }: LoginModalProps) => {
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (onLogin) {
      onLogin({ name: 'Usuário Premium', email: loginForm.email });
    }
    onClose();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (registerForm.password !== registerForm.confirmPassword) {
      alert('Senhas não coincidem!');
      return;
    }
    if (onLogin) {
      onLogin({ name: registerForm.name, email: registerForm.email });
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold gold-gradient bg-clip-text text-transparent">
            Bem-vindo ao Baú Premiado
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
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
              />
              <Input
                type="password"
                placeholder="Sua senha"
                value={loginForm.password}
                onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                required
              />
              <Button type="submit" className="w-full gold-gradient text-black font-bold">
                Entrar
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <Input
                type="text"
                placeholder="Seu nome"
                value={registerForm.name}
                onChange={(e) => setRegisterForm(prev => ({ ...prev, name: e.target.value }))}
                required
              />
              <Input
                type="email"
                placeholder="Seu email"
                value={registerForm.email}
                onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                required
              />
              <Input
                type="password"
                placeholder="Sua senha"
                value={registerForm.password}
                onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                required
              />
              <Input
                type="password"
                placeholder="Confirme sua senha"
                value={registerForm.confirmPassword}
                onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                required
              />
              <Button type="submit" className="w-full gold-gradient text-black font-bold">
                Cadastrar e Ganhar R$ 50
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
