
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowDown, Plus, MousePointer, Sparkles } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoginModal from '@/components/LoginModal';

const Sobre = () => {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [balance, setBalance] = useState(150);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [faqForm, setFaqForm] = useState({ name: '', email: '', question: '' });

  const handleLogin = (userData: { name: string; email: string }) => {
    setUser(userData);
    setBalance(150);
  };

  const handleWalletOpen = () => {
    console.log('Wallet opened');
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
    { 
      title: 'Viagem para Dubai', 
      description: 'Pacote completo com hospedagem',
      image: '/lovable-uploads/262848fe-da75-4887-bb6d-b88247901100.png'
    },
    { 
      title: 'Moto 0km', 
      description: 'Motocicleta Honda CB 650F',
      image: '/lovable-uploads/3c51402c-67ee-4d20-8b11-9a334ca0e2db.png'
    },
    { 
      title: 'iPhone 16 Pro Max', 
      description: '256GB na cor desejada',
      image: '/lovable-uploads/afe8c6a0-043b-45e3-a2d2-f0016ed54fac.png'
    },
    { 
      title: 'Prêmios em dinheiro', 
      description: 'De R$ 100 até R$ 50.000',
      image: '/lovable-uploads/68d2bf66-08db-4fad-8f22-0bbfbbd2f16d.png'
    }
  ];

  return (
    <div className="min-h-screen">
      <Header 
        balance={balance}
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {premiumPrizes.map((prize, index) => (
              <Card key={index} className="overflow-hidden bg-gradient-to-br from-card to-card/90 border-primary/20 hover:border-primary/40 transition-colors">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row h-48">
                    {/* Image Section */}
                    <div className="flex-1 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center p-6">
                      <img 
                        src={prize.image} 
                        alt={prize.title}
                        className="max-w-full max-h-full object-contain drop-shadow-lg"
                      />
                    </div>
                    
                    {/* Text Section */}
                    <div className="flex-1 p-6 flex flex-col justify-center">
                      <h3 className="text-xl font-bold text-primary mb-2">{prize.title}</h3>
                      <p className="text-muted-foreground">{prize.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 gold-gradient bg-clip-text text-transparent">
            🎉 Sua sorte está a um clique de distância! 🎉
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Milhares de pessoas já ganharam prêmios incríveis. Será que a próxima vitória é sua?
          </p>
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
