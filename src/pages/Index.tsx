
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Wallet, Trophy, Gift, Sparkles, Crown, Diamond, Star } from 'lucide-react';
import ChestCard from '@/components/ChestCard';
import WinModal from '@/components/WinModal';
import WalletPanel from '@/components/WalletPanel';
import { chestData, type ChestType, type Prize } from '@/data/chestData';

const Index = () => {
  const [balance, setBalance] = useState(0);
  const [prizes, setPrizes] = useState<(Prize & { chestType: ChestType, timestamp: Date })[]>([]);
  const [isWinModalOpen, setIsWinModalOpen] = useState(false);
  const [currentPrize, setCurrentPrize] = useState<Prize | null>(null);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulação de login
    setUser({ name: 'Usuário Premium', email: loginForm.email });
    setBalance(150); // Saldo inicial
    setIsLoginOpen(false);
  };

  const openChest = (chestType: ChestType) => {
    const chest = chestData[chestType];
    
    if (balance < chest.price) {
      alert('Saldo insuficiente! Adicione créditos à sua carteira.');
      return;
    }

    // Deduzir o valor do baú
    setBalance(prev => prev - chest.price);

    // Sortear prêmio aleatório
    const randomIndex = Math.floor(Math.random() * chest.prizes.length);
    const wonPrize = chest.prizes[randomIndex];

    // Adicionar à lista de prêmios
    setPrizes(prev => [...prev, {
      ...wonPrize,
      chestType,
      timestamp: new Date()
    }]);

    // Mostrar modal de vitória
    setCurrentPrize(wonPrize);
    setIsWinModalOpen(true);
  };

  const addBalance = (amount: number) => {
    setBalance(prev => prev + amount);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-card/90 backdrop-blur-sm border-primary/20">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full gold-gradient flex items-center justify-center">
                <Trophy className="w-10 h-10 text-black" />
              </div>
            </div>
            <h1 className="text-3xl font-bold gold-gradient bg-clip-text text-transparent mb-2">
              Baú Premiado
            </h1>
            <p className="text-muted-foreground">
              Entre e descubra tesouros incríveis
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Seu email"
                value={loginForm.email}
                onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                className="bg-secondary border-primary/20 focus:border-primary"
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Sua senha"
                value={loginForm.password}
                onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                className="bg-secondary border-primary/20 focus:border-primary"
                required
              />
            </div>
            <Button type="submit" className="w-full gold-gradient text-black font-bold hover:opacity-90 transition-opacity">
              Entrar na Aventura
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Novo por aqui? Crie sua conta e ganhe <span className="text-primary font-bold">R$ 50</span> de bônus!</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-primary/20 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center">
              <Trophy className="w-6 h-6 text-black" />
            </div>
            <h1 className="text-2xl font-bold gold-gradient bg-clip-text text-transparent">
              Baú Premiado
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-secondary px-4 py-2 rounded-lg">
              <Wallet className="w-4 h-4 text-primary" />
              <span className="font-bold text-primary">R$ {balance.toFixed(2)}</span>
            </div>
            <Button 
              onClick={() => setIsWalletOpen(true)}
              className="gold-gradient text-black font-bold hover:opacity-90"
            >
              Carteira
            </Button>
            <div className="text-right">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="gold-gradient bg-clip-text text-transparent">
              Tesouros Aguardam
            </span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Abra baús mágicos e descubra prêmios incríveis! De smartwatches a iPhones, 
            motocicletas e viagens dos sonhos.
          </p>
          <div className="flex justify-center space-x-4">
            <Badge variant="secondary" className="px-4 py-2 text-lg">
              <Gift className="w-4 h-4 mr-2" />
              +1000 Prêmios
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-lg">
              <Sparkles className="w-4 h-4 mr-2" />
              Sorteios Diários
            </Badge>
          </div>
        </div>
      </section>

      {/* Chests Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12 gold-gradient bg-clip-text text-transparent">
            Escolha Seu Baú
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {Object.entries(chestData).map(([key, chest]) => (
              <ChestCard
                key={key}
                chest={chest}
                chestType={key as ChestType}
                onOpen={() => openChest(key as ChestType)}
                balance={balance}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-12 gold-gradient bg-clip-text text-transparent">
            Seus Números
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-lg border border-primary/20">
              <div className="w-16 h-16 gold-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-black" />
              </div>
              <h4 className="text-2xl font-bold text-primary mb-2">{prizes.length}</h4>
              <p className="text-muted-foreground">Prêmios Conquistados</p>
            </div>
            <div className="bg-card p-8 rounded-lg border border-primary/20">
              <div className="w-16 h-16 gold-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-8 h-8 text-black" />
              </div>
              <h4 className="text-2xl font-bold text-primary mb-2">R$ {balance.toFixed(2)}</h4>
              <p className="text-muted-foreground">Saldo Disponível</p>
            </div>
            <div className="bg-card p-8 rounded-lg border border-primary/20">
              <div className="w-16 h-16 gold-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-black" />
              </div>
              <h4 className="text-2xl font-bold text-primary mb-2">Premium</h4>
              <p className="text-muted-foreground">Nível Atual</p>
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      <WinModal
        isOpen={isWinModalOpen}
        onClose={() => setIsWinModalOpen(false)}
        prize={currentPrize}
      />

      <WalletPanel
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        balance={balance}
        prizes={prizes}
        onAddBalance={addBalance}
      />
    </div>
  );
};

export default Index;
