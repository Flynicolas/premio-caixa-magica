
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  HelpCircle, 
  CreditCard, 
  Gift, 
  User, 
  Settings, 
  MessageCircle, 
  Phone, 
  Mail,
  ChevronRight,
  Trophy,
  Shield,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CentralAjuda = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    {
      title: "Como Funciona",
      icon: <HelpCircle className="w-6 h-6" />,
      color: "from-blue-500 to-cyan-500",
      questions: [
        "Como abrir um baú?",
        "Como funciona o sistema de prêmios?",
        "Posso ver os itens antes de abrir?",
        "Como aumentar meu saldo?"
      ]
    },
    {
      title: "Pagamentos",
      icon: <CreditCard className="w-6 h-6" />,
      color: "from-green-500 to-emerald-500",
      questions: [
        "Formas de pagamento aceitas",
        "Como adicionar saldo?",
        "Tempo de processamento do PIX",
        "Política de reembolso"
      ]
    },
    {
      title: "Prêmios e Entregas",
      icon: <Gift className="w-6 h-6" />,
      color: "from-purple-500 to-pink-500",
      questions: [
        "Como resgatar meu prêmio?",
        "Prazo para entrega",
        "Rastreamento do pedido",
        "Política de trocas"
      ]
    },
    {
      title: "Conta e Perfil",
      icon: <User className="w-6 h-6" />,
      color: "from-orange-500 to-red-500",
      questions: [
        "Como criar uma conta?",
        "Alterar dados pessoais",
        "Recuperar senha",
        "Excluir conta"
      ]
    }
  ];

  const quickActions = [
    {
      title: "Suporte Direto",
      description: "Fale com nossa equipe",
      icon: <MessageCircle className="w-8 h-8" />,
      action: "WhatsApp: (11) 9999-9999"
    },
    {
      title: "Status do Sistema",
      description: "Verificar funcionamento",
      icon: <Shield className="w-8 h-8" />,
      action: "Todos os sistemas operacionais"
    },
    {
      title: "Tempo de Resposta",
      description: "Suporte 24/7",
      icon: <Clock className="w-8 h-8" />,
      action: "Média de 2 minutos"
    }
  ];

  const guides = [
    {
      title: "Guia Completo: Como Ganhar Prêmios",
      description: "Passo a passo completo para maximizar suas chances",
      steps: 5,
      time: "3 min"
    },
    {
      title: "Configurando seu Perfil",
      description: "Configure seu perfil para receber prêmios",
      steps: 3,
      time: "2 min"
    },
    {
      title: "Sistema de Ranking",
      description: "Entenda como funciona o sistema de pontuação",
      steps: 4,
      time: "2 min"
    }
  ];

  const filteredCategories = categories.filter(category =>
    category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.questions.some(q => q.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-orange-500/10" />
        <div className="container mx-auto px-4 py-16 relative">
          <div className="text-center mb-12">
            <Badge className="mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold px-4 py-2">
              🎯 Central de Ajuda
            </Badge>
            <h1 className="text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              Como podemos ajudar?
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Encontre respostas rápidas para suas dúvidas ou entre em contato com nossa equipe de suporte
            </p>
          </div>

          {/* Search */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Digite sua dúvida..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 text-lg bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-yellow-400/50"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {quickActions.map((action, index) => (
            <Card key={index} className="p-6 text-center bg-gradient-to-br from-gray-800/30 to-gray-900/50 border-gray-700/50 hover:border-yellow-400/30 transition-all">
              <div className="flex flex-col items-center">
                <div className="p-4 bg-yellow-400/10 rounded-full mb-4 text-yellow-400">
                  {action.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">{action.title}</h3>
                <p className="text-gray-400 mb-4">{action.description}</p>
                <div className="text-yellow-400 font-semibold">{action.action}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Categories */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            Categorias de Ajuda
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredCategories.map((category, index) => (
              <Card key={index} className="p-8 bg-gradient-to-br from-gray-800/30 to-gray-900/50 border-gray-700/50 hover:border-yellow-400/30 transition-all group">
                <div className="flex items-center mb-6">
                  <div className={`p-4 bg-gradient-to-r ${category.color} rounded-full mr-4 text-white`}>
                    {category.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white">{category.title}</h3>
                </div>
                <div className="space-y-3">
                  {category.questions.map((question, qIndex) => (
                    <div key={qIndex} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg hover:bg-gray-700/30 transition-colors cursor-pointer">
                      <span className="text-gray-300">{question}</span>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-yellow-400 transition-colors" />
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Guides */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            Guias Passo a Passo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {guides.map((guide, index) => (
              <Card key={index} className="p-6 bg-gradient-to-br from-gray-800/30 to-gray-900/50 border-gray-700/50 hover:border-yellow-400/30 transition-all cursor-pointer group">
                <div className="flex items-center mb-4">
                  <Trophy className="w-6 h-6 text-yellow-400 mr-3" />
                  <div className="flex space-x-2">
                    <Badge variant="secondary" className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30">
                      {guide.steps} passos
                    </Badge>
                    <Badge variant="secondary" className="bg-blue-400/20 text-blue-400 border-blue-400/30">
                      {guide.time}
                    </Badge>
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2 text-white group-hover:text-yellow-400 transition-colors">
                  {guide.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {guide.description}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <Card className="p-12 text-center bg-gradient-to-r from-gray-800/50 to-gray-900/50 border-yellow-500/20">
          <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            Ainda precisa de ajuda?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Nossa equipe especializada está disponível 24/7 para ajudar você com qualquer dúvida ou problema.
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

        {/* Navigation */}
        <div className="mt-12 text-center">
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/termos-uso" className="text-yellow-400 hover:text-yellow-300 transition-colors">
              Termos de Uso
            </Link>
            <span className="text-gray-600">•</span>
            <Link to="/politica-privacidade" className="text-yellow-400 hover:text-yellow-300 transition-colors">
              Política de Privacidade
            </Link>
            <span className="text-gray-600">•</span>
            <Link to="/faq" className="text-yellow-400 hover:text-yellow-300 transition-colors">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CentralAjuda;
