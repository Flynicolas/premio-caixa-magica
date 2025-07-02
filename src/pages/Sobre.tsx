
import { Card } from '@/components/ui/card';
import { Shield, Award, Users, Zap, Heart, Target } from 'lucide-react';

const Sobre = () => {
  const features = [
    {
      icon: <Shield className="w-8 h-8 text-blue-400" />,
      title: "100% Seguro",
      description: "Todos os jogos são auditados e certificados para garantir total transparência."
    },
    {
      icon: <Award className="w-8 h-8 text-yellow-400" />,
      title: "Prêmios Reais",
      description: "Ganhe prêmios em dinheiro e produtos de alta qualidade entregues em sua casa."
    },
    {
      icon: <Users className="w-8 h-8 text-green-400" />,
      title: "Comunidade Ativa",
      description: "Junte-se a milhares de jogadores e acompanhe os ganhos em tempo real."
    },
    {
      icon: <Zap className="w-8 h-8 text-purple-400" />,
      title: "Pagamentos Rápidos",
      description: "Receba seus prêmios em dinheiro instantaneamente via PIX."
    }
  ];

  const stats = [
    { number: "50,000+", label: "Jogadores Ativos" },
    { number: "R$ 2M+", label: "Prêmios Distribuídos" },
    { number: "15,000+", label: "Prêmios Entregues" },
    { number: "4.9/5", label: "Avaliação dos Usuários" }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-6 text-primary">
          Sobre o Baú Premiado
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          A plataforma de jogos online mais confiável do Brasil, onde diversão e prêmios reais se encontram!
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6 text-center bg-gradient-to-br from-card to-card/50 border-primary/20">
            <div className="text-3xl font-bold text-primary mb-2">{stat.number}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Features Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-primary">
          Por que escolher o Baú Premiado?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="p-8 hover:shadow-lg transition-shadow border-primary/20">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-secondary rounded-full">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Mission Section */}
      <Card className="p-8 mb-16 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30">
        <div className="text-center">
          <Target className="w-16 h-16 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-6 text-primary">Nossa Missão</h2>
          <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Proporcionar uma experiência de jogo única, combinando entretenimento de qualidade com 
            oportunidades reais de ganhar prêmios incríveis. Acreditamos que todos merecem a chance 
            de transformar momentos de diversão em conquistas tangíveis.
          </p>
        </div>
      </Card>

      {/* How it Works */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-primary">
          Como Funciona?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-8 text-center border-primary/20">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl font-bold text-primary">1</span>
            </div>
            <h3 className="text-xl font-bold mb-4 text-white">Cadastre-se</h3>
            <p className="text-muted-foreground">
              Crie sua conta e receba R$ 50 de bônus para começar a jogar imediatamente.
            </p>
          </Card>

          <Card className="p-8 text-center border-primary/20">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl font-bold text-primary">2</span>
            </div>
            <h3 className="text-xl font-bold mb-4 text-white">Escolha seu Baú</h3>
            <p className="text-muted-foreground">
              Selecione entre nossos diferentes tipos de baús, cada um com prêmios únicos.
            </p>
          </Card>

          <Card className="p-8 text-center border-primary/20">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl font-bold text-primary">3</span>
            </div>
            <h3 className="text-xl font-bold mb-4 text-white">Ganhe Prêmios</h3>
            <p className="text-muted-foreground">
              Abra seu baú e descubra que prêmio incrível você ganhou!
            </p>
          </Card>
        </div>
      </div>

      {/* Contact Section */}
      <Card className="p-8 text-center bg-gradient-to-r from-secondary/20 to-card border-primary/20">
        <Heart className="w-12 h-12 text-primary mx-auto mb-6" />
        <h2 className="text-2xl font-bold mb-4 text-primary">Suporte 24/7</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Nossa equipe está sempre disponível para ajudar você. Entre em contato conosco 
          a qualquer momento através dos nossos canais de suporte.
        </p>
        <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
          <span>📧 suporte@baupremiado.com</span>
          <span>📱 WhatsApp: (11) 9999-9999</span>
        </div>
      </Card>
    </div>
  );
};

export default Sobre;
