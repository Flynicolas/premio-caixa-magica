
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, Gift, TrendingUp, Star, Zap } from 'lucide-react';
import HeroSlider from '@/components/HeroSlider';
import LiveWinsCarousel from '@/components/LiveWinsCarousel';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import WalletPanel from '@/components/WalletPanel';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showWalletPanel, setShowWalletPanel] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const stats = [
    { label: 'Usuários Ativos', value: '12.5K+', icon: Users },
    { label: 'Prêmios Entregues', value: '8.2K+', icon: Gift },
    { label: 'Taxa de Vitória', value: '94%', icon: Trophy },
    { label: 'Satisfação', value: '4.9★', icon: Star }
  ];

  const features = [
    {
      icon: Zap,
      title: 'Abertura Instantânea',
      description: 'Abra seus baús e descubra prêmios incríveis na hora',
      color: 'from-yellow-400 to-orange-500'
    },
    {
      icon: Trophy,
      title: 'Prêmios Reais',
      description: 'Ganhe produtos físicos, vouchers e muito mais',
      color: 'from-purple-400 to-pink-500'
    },
    {
      icon: TrendingUp,
      title: 'Sistema de Níveis',
      description: 'Evolua seu perfil e desbloqueie benefícios exclusivos',
      color: 'from-blue-400 to-cyan-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Header 
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenWallet={() => setShowWalletPanel(true)}
      />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Hero Section */}
        <section className="mb-12 sm:mb-16 lg:mb-20">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6">
              Abra Baús e Ganhe{' '}
              <span className="gold-gradient bg-clip-text text-transparent">
                Prêmios Incríveis
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
              A emoção de descobrir prêmios únicos está a um clique de distância. 
              Cadastre-se e ganhe R$ 50 de bônus!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {!user ? (
                <Button
                  onClick={() => setShowAuthModal(true)}
                  className="w-full sm:w-auto gold-gradient text-black font-bold hover:opacity-90 h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg touch-manipulation"
                >
                  Começar Agora - Ganhe R$ 50
                </Button>
              ) : (
                <Button
                  onClick={() => navigate('/baus')}
                  className="w-full sm:w-auto gold-gradient text-black font-bold hover:opacity-90 h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg touch-manipulation"
                >
                  Ver Baús Disponíveis
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={() => navigate('/sobre')}
                className="w-full sm:w-auto border-primary/30 text-primary hover:bg-primary/10 h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg touch-manipulation"
              >
                Saiba Mais
              </Button>
            </div>
          </div>

          <HeroSlider />
        </section>

        {/* Stats Section */}
        <section className="mb-12 sm:mb-16 lg:mb-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="p-4 sm:p-6 text-center bg-card/80 border-primary/20 hover:border-primary/40 transition-all duration-300">
                <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 sm:mb-3 text-primary" />
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-12 sm:mb-16 lg:mb-20">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
              Por que escolher o Baú Premiado?
            </h2>
            <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto px-4">
              Oferecemos a melhor experiência em jogos de sorte com transparência total
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 sm:p-8 text-center bg-card/80 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105">
                <div className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center`}>
                  <feature.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-300">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* Live Wins Section */}
        <section className="mb-12 sm:mb-16 lg:mb-20">
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <Badge variant="outline" className="text-green-400 border-green-400">
                AO VIVO
              </Badge>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
              Vitórias em Tempo Real
            </h2>
            <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto px-4">
              Veja os prêmios que outros usuários estão ganhando agora mesmo
            </p>
          </div>
          
          <LiveWinsCarousel />
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <Card className="p-8 sm:p-12 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
              Pronto para Ganhar?
            </h2>
            <p className="text-base sm:text-lg text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto">
              Junte-se a milhares de usuários que já descobriram seus prêmios favoritos
            </p>
            
            {!user ? (
              <Button
                onClick={() => setShowAuthModal(true)}
                className="w-full sm:w-auto gold-gradient text-black font-bold hover:opacity-90 h-12 sm:h-14 px-8 sm:px-12 text-base sm:text-lg touch-manipulation"
              >
                Cadastrar e Ganhar R$ 50
              </Button>
            ) : (
              <Button
                onClick={() => navigate('/baus')}
                className="w-full sm:w-auto gold-gradient text-black font-bold hover:opacity-90 h-12 sm:h-14 px-8 sm:px-12 text-base sm:text-lg touch-manipulation"
              >
                Explorar Baús
              </Button>
            )}
          </Card>
        </section>
      </main>

      <Footer />

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      <WalletPanel
        isOpen={showWalletPanel}
        onClose={() => setShowWalletPanel(false)}
      />
    </div>
  );
};

export default Index;
