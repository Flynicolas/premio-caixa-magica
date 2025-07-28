
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Award, Users, Zap, Heart, Target, CheckCircle, Sparkles, Clock, Globe, Phone, Mail } from 'lucide-react';

const Sobre = () => {
  const features = [
    {
      icon: <Shield className="w-8 h-8 text-blue-400" />,
      title: "100% Seguro",
      description: "Todos os jogos são auditados e certificados para garantir total transparência e segurança."
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
      icon: <Sparkles className="w-8 h-8 text-purple-400" />,
      title: "Diversão Garantida",
      description: "Raspadinhas, baús e roletas com prêmios reais para você se divertir."
    },
    {
      icon: <Clock className="w-8 h-8 text-orange-400" />,
      title: "Suporte 24/7",
      description: "Nossa equipe está sempre disponível para ajudar você a qualquer momento."
    },
    {
      icon: <Globe className="w-8 h-8 text-cyan-400" />,
      title: "Plataforma Confiável",
      description: "Sistema robusto com uptime de 99.9% e milhares de transações processadas."
    }
  ];

  const stats = [
    { number: "50,000+", label: "Jogadores Ativos", icon: <Users className="w-5 h-5" /> },
    { number: "R$ 2M+", label: "Prêmios Distribuídos", icon: <Award className="w-5 h-5" /> },
    { number: "15,000+", label: "Prêmios Entregues", icon: <CheckCircle className="w-5 h-5" /> },
    { number: "4.9/5", label: "Avaliação dos Usuários", icon: <Sparkles className="w-5 h-5" /> }
  ];

  const steps = [
    {
      number: "1",
      title: "Cadastre-se",
      description: "Crie sua conta gratuitamente e receba R$ 50 de bônus para começar a jogar imediatamente.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      number: "2",
      title: "Escolha seu Baú",
      description: "Selecione entre nossos diferentes tipos de baús, cada um com prêmios únicos e emocionantes.",
      color: "from-purple-500 to-pink-500"
    },
    {
      number: "3",
      title: "Ganhe Prêmios",
      description: "Abra seu baú e descubra que prêmio incrível você ganhou! Receba instantaneamente.",
      color: "from-yellow-500 to-orange-500"
    }
  ];

  const benefits = [
    "Prêmios reais entregues em casa",
    "Pagamentos instantâneos via PIX",
    "Sistema 100% transparente",
    "Suporte especializado 24/7",
    "Comunidade ativa de jogadores",
    "Promoções exclusivas semanais"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-orange-500/10" />
        <div className="container mx-auto px-4 py-16 relative">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold px-4 py-2">
              ✨ Plataforma #1 do Brasil
            </Badge>
            <h1 className="text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              Sobre o Baú Premiado
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              A plataforma brasileira onde você se diverte com raspadinhas, baús premiados e roletas enquanto ganha prêmios reais! 
              Transformamos seus momentos de lazer em oportunidades incríveis de conquistar prêmios únicos.
            </p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => (
              <Card key={index} className="p-6 text-center bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-yellow-500/20 backdrop-blur-sm hover:border-yellow-400/40 transition-all">
                <div className="flex items-center justify-center mb-3 text-yellow-400">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-yellow-400 mb-2">{stat.number}</div>
                <div className="text-sm text-gray-300">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            Por que escolher o Baú Premiado?
          </h2>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
            Oferecemos a melhor experiência em jogos online com prêmios reais e sistema totalmente transparente.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-8 hover:shadow-2xl transition-all duration-300 border-gray-700/50 bg-gradient-to-br from-gray-800/30 to-gray-900/50 backdrop-blur-sm hover:border-yellow-400/30 group">
                <div className="flex flex-col items-center text-center">
                  <div className="p-4 bg-gray-800/50 rounded-full mb-6 group-hover:bg-gray-700/50 transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-white">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Mission Section */}
        <Card className="p-12 mb-16 bg-gradient-to-r from-yellow-400/10 via-orange-500/10 to-yellow-400/10 border-yellow-500/30 backdrop-blur-sm">
          <div className="text-center">
            <Target className="w-20 h-20 text-yellow-400 mx-auto mb-8" />
            <h2 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              Nossa Missão
            </h2>
            <p className="text-base md:text-lg text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Oferecer uma experiência única de entretenimento com raspadinhas digitais, baús misteriosos e roletas emocionantes, 
              onde cada momento de diversão pode se transformar em prêmios reais. Criamos uma plataforma onde a emoção do jogo 
              se encontra com a possibilidade real de conquistar prêmios incríveis, construindo uma comunidade de vencedores 
              que celebram cada vitória juntos.
            </p>
          </div>
        </Card>

        {/* How it Works */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            Como Funciona?
          </h2>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
            Três passos simples para começar a ganhar prêmios incríveis hoje mesmo!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <Card key={index} className="p-8 text-center border-gray-700/50 bg-gradient-to-br from-gray-800/30 to-gray-900/50 backdrop-blur-sm hover:border-yellow-400/30 transition-all duration-300 group relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-r ${step.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                <div className="relative">
                  <div className={`w-20 h-20 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                    <span className="text-3xl font-bold text-white">{step.number}</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white">{step.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{step.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            Seus Benefícios
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-3 p-4 rounded-lg bg-gray-800/30 border border-gray-700/50">
                <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                <span className="text-gray-300">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <Card className="p-12 text-center bg-gradient-to-r from-gray-800/50 to-gray-900/50 border-yellow-500/20 backdrop-blur-sm">
          <Heart className="w-16 h-16 text-yellow-400 mx-auto mb-8" />
          <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            Suporte 24/7
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto text-lg">
            Nossa equipe especializada está sempre disponível para ajudar você. Entre em contato conosco 
            a qualquer momento através dos nossos canais de suporte premium.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
              <Mail className="w-5 h-5 text-yellow-400" />
              <span className="text-gray-300">suporte@baupremiado.com</span>
            </div>
            <div className="flex items-center justify-center space-x-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
              <Phone className="w-5 h-5 text-yellow-400" />
              <span className="text-gray-300">WhatsApp: (11) 9999-9999</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Sobre;
