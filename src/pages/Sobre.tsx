
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowDown, Plus, MousePointer, Sparkles, Plane, Bike, Smartphone, DollarSign } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoginModal from '@/components/LoginModal';

const Sobre = () => {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [balance, setBalance] = useState(0);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [faqForm, setFaqForm] = useState({ name: '', email: '', question: '' });

  const handleLogin = (userData: { name: string; email: string }) => {
    setUser(userData);
    setBalance(150);
  };

  const handleWalletOpen = () => {
    if (!user) {
      setIsLoginModalOpen(true);
    }
  };

  const handleFaqSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Pergunta enviada! Entraremos em contato em breve.');
    setFaqForm({ name: '', email: '', question: '' });
  };

  const chestTypes = [
    { name: 'Baú Prata', price: 29.90, color: 'from-gray-400 to-gray-600', border: 'border-gray-400' },
    { name: 'Baú Ouro', price: 59.90, color: 'from-yellow-400 to-yellow-600', border: 'border-yellow-400' },
    { name: 'Baú Diamante', price: 89.90, color: 'from-blue-400 to-blue-600', border: 'border-blue-400' },
    { name: 'Baú Rubi', price: 149.90, color: 'from-red-400 to-red-600', border: 'border-red-400' },
    { name: 'Baú Premium', price: 299.90, color: 'from-purple-400 to-purple-600', border: 'border-purple-400' }
  ];

  const premiumPrizes = [
    { icon: Plane, title: 'Viagem para Dubai', description: 'Pacote completo com hospedagem' },
    { icon: Bike, title: 'Moto 0km', description: 'Motocicleta Honda CB 650F' },
    { icon: Smartphone, title: 'iPhone 16 Pro Max', description: '256GB na cor desejada' },
    { icon: DollarSign, title: 'Prêmios em dinheiro', description: 'De R$ 100 até R$ 50.000' }
  ];

  return (
    <div className="min-h-screen">
      <Header 
        balance={balance}
        user={user}
        onAddBalance={handleWalletOpen}
      />

      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 gold-gradient bg-clip-text text-transparent">
            Cada Baú pode ser um presente em casa ou uma experiência que você nunca imaginou!
          </h1>
          
          {/* Chest Icons */}
          <div className="flex justify-center space-x-4 mb-12">
            {chestTypes.map((chest, index) => (
              <div key={index} className={`w-16 h-16 rounded-lg bg-gradient-to-br ${chest.color} ${chest.border} border-2 flex items-center justify-center shadow-lg`}>
                <span className="text-xs font-bold text-white">{chest.name.split(' ')[1]}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <Card className="text-center p-6 bg-card/90">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-primary">Adicione Créditos</h3>
                <p className="text-muted-foreground">
                  Faça login e adicione créditos para participar dos sorteios.
                </p>
                <p className="text-primary font-bold">
                  "Adicione seu saldo e prepare-se para a sorte!"
                </p>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="text-center p-6 bg-card/90">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-primary">Escolha um Baú</h3>
                <div className="space-y-2">
                  {chestTypes.map((chest, index) => (
                    <div key={index} className={`p-2 rounded border ${chest.border} bg-gradient-to-r ${chest.color} bg-opacity-20`}>
                      <span className="text-sm font-bold">{chest.name} - R$ {chest.price}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="text-center p-6 bg-card/90">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto">
                  <MousePointer className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-primary">Clique em Abrir o Baú</h3>
                <p className="text-muted-foreground">
                  Ao clicar, um carrossel de prêmios vai girar até parar em um item sorteado.
                </p>
                <div className="flex justify-center">
                  <ArrowDown className="w-8 h-8 text-yellow-400 animate-bounce" />
                </div>
              </CardContent>
            </Card>

            {/* Step 4 */}
            <Card className="text-center p-6 bg-card/90">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-primary">Divirta-se e boa sorte!</h3>
                <p className="text-muted-foreground">
                  Descubra prêmios incríveis: celular, whisky, fone, PIX e muito mais!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Premium Prizes Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 gold-gradient bg-clip-text text-transparent">
            Itens Incríveis e Experiências Únicas
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {premiumPrizes.map((prize, index) => (
              <Card key={index} className="p-6 text-center bg-gradient-to-br from-card to-card/90 border-primary/20 hover:border-primary/40 transition-colors">
                <CardContent className="space-y-4">
                  <div className="w-20 h-20 gold-gradient rounded-full flex items-center justify-center mx-auto">
                    <prize.icon className="w-10 h-10 text-black" />
                  </div>
                  <h3 className="text-xl font-bold text-primary">{prize.title}</h3>
                  <p className="text-muted-foreground">{prize.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-3xl font-bold text-center mb-12 gold-gradient bg-clip-text text-transparent">
            Ficou alguma dúvida?
          </h2>
          
          <Card className="p-8">
            <form onSubmit={handleFaqSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Seu nome"
                  value={faqForm.name}
                  onChange={(e) => setFaqForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
                <Input
                  type="email"
                  placeholder="Seu email"
                  value={faqForm.email}
                  onChange={(e) => setFaqForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <Textarea
                placeholder="Sua pergunta..."
                value={faqForm.question}
                onChange={(e) => setFaqForm(prev => ({ ...prev, question: e.target.value }))}
                rows={4}
                required
              />
              <Button type="submit" className="w-full gold-gradient text-black font-bold hover:opacity-90">
                Enviar Pergunta
              </Button>
            </form>
          </Card>
        </div>
      </section>

      {/* WhatsApp Support */}
      <section className="py-12 text-center">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold mb-4 text-primary">
            Ainda não entendeu alguma coisa? Fale com nosso suporte!
          </h3>
          <Button 
            onClick={() => window.open('https://wa.me/5511999999999', '_blank')}
            className="bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 text-lg"
          >
            💬 Suporte WhatsApp
          </Button>
        </div>
      </section>

      <Footer />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
      />
    </div>
  );
};

export default Sobre;
