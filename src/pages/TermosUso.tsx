
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Scale, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermosUso = () => {
  const sections = [
    {
      id: "definicoes",
      title: "1. Definições",
      icon: <Shield className="w-5 h-5" />,
      content: [
        "Plataforma: Sistema online Baú Premiado acessível através do website.",
        "Usuário: Pessoa física maior de 18 anos que utiliza nossos serviços.",
        "Baú: Produto virtual que contém prêmios sorteados aleatoriamente.",
        "Prêmio: Item físico ou digital obtido através da abertura de baús.",
        "Saldo: Créditos virtuais utilizados para abertura de baús."
      ]
    },
    {
      id: "uso",
      title: "2. Uso da Plataforma",
      icon: <CheckCircle className="w-5 h-5" />,
      content: [
        "É necessário ter 18 anos ou mais para utilizar nossos serviços.",
        "Cada usuário pode ter apenas uma conta ativa.",
        "É proibido o uso de bots, scripts ou qualquer automação.",
        "O usuário é responsável por manter seus dados de acesso seguros.",
        "Atividades fraudulentas resultarão em suspensão da conta."
      ]
    },
    {
      id: "pagamentos",
      title: "3. Pagamentos e Saldo",
      icon: <Scale className="w-5 h-5" />,
      content: [
        "Aceitamos pagamentos via PIX, cartão de crédito e débito.",
        "O saldo adquirido não pode ser convertido de volta em dinheiro.",
        "Todas as transações são processadas em ambiente seguro.",
        "Reembolsos só serão realizados em casos de erro técnico comprovado.",
        "Taxas de entrega são cobradas separadamente para prêmios físicos."
      ]
    },
    {
      id: "premios",
      title: "4. Prêmios e Entregas",
      icon: <AlertTriangle className="w-5 h-5" />,
      content: [
        "Prêmios são sorteados de forma aleatória e transparente.",
        "Prazo de entrega: 5 a 15 dias úteis para prêmios físicos.",
        "É necessário fornecer endereço válido para recebimento.",
        "Prêmios não resgatados em 30 dias serão considerados perdidos.",
        "Não nos responsabilizamos por danos durante o transporte."
      ]
    },
    {
      id: "responsabilidades",
      title: "5. Responsabilidades",
      icon: <Shield className="w-5 h-5" />,
      content: [
        "Garantimos o funcionamento da plataforma 24/7, salvo manutenções.",
        "Não nos responsabilizamos por perdas devido a problemas técnicos do usuário.",
        "Todas as informações fornecidas devem ser verídicas.",
        "O usuário é responsável por verificar a compatibilidade de prêmios eletrônicos.",
        "Reservamos o direito de alterar estes termos com aviso prévio."
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-orange-500/10" />
        <div className="container mx-auto px-4 py-16 relative">
          <div className="text-center mb-12">
            <Link to="/central-ajuda" className="inline-flex items-center text-yellow-400 hover:text-yellow-300 transition-colors mb-6">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar para Central de Ajuda
            </Link>
            <Badge className="mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold px-4 py-2">
              📋 Termos de Uso
            </Badge>
            <h1 className="text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              Termos de Uso
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Leia atentamente nossos termos de uso antes de utilizar a plataforma
            </p>
            <div className="mt-6 text-sm text-gray-400">
              Última atualização: 20 de julho de 2024
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Introduction */}
        <Card className="p-8 mb-12 bg-gradient-to-r from-yellow-400/10 via-orange-500/10 to-yellow-400/10 border-yellow-500/30">
          <div className="text-center">
            <Scale className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4 text-white">
              Bem-vindo ao Baú Premiado
            </h2>
            <p className="text-gray-300 leading-relaxed">
              Ao utilizar nossa plataforma, você concorda com todos os termos e condições descritos abaixo. 
              Estes termos constituem um acordo legal entre você e o Baú Premiado. Se você não concordar 
              com algum destes termos, não utilize nossos serviços.
            </p>
          </div>
        </Card>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <Card key={index} className="p-8 bg-gradient-to-br from-gray-800/30 to-gray-900/50 border-gray-700/50">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-yellow-400/20 rounded-full mr-4 text-yellow-400">
                  {section.icon}
                </div>
                <h3 className="text-2xl font-bold text-white">{section.title}</h3>
              </div>
              <div className="space-y-4">
                {section.content.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-300 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Legal Notice */}
        <Card className="p-8 mt-12 bg-gradient-to-r from-red-900/20 to-orange-900/20 border-red-500/30">
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-400 mr-3" />
            <h3 className="text-xl font-bold text-red-400">Aviso Legal Importante</h3>
          </div>
          <p className="text-gray-300 leading-relaxed">
            O Baú Premiado é um serviço de entretenimento que envolve elementos de sorte. 
            Jogue com responsabilidade e nunca gaste mais do que pode perder. Se você tem 
            problemas com jogos, procure ajuda profissional. Este serviço é destinado apenas 
            para maiores de 18 anos.
          </p>
        </Card>

        {/* Footer */}
        <Card className="p-8 mt-12 text-center bg-gradient-to-r from-gray-800/50 to-gray-900/50 border-yellow-500/20">
          <h3 className="text-xl font-bold mb-4 text-white">
            Dúvidas sobre os Termos?
          </h3>
          <p className="text-gray-300 mb-6">
            Se você tiver dúvidas sobre estes termos, entre em contato conosco.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/central-ajuda" className="text-yellow-400 hover:text-yellow-300 transition-colors">
              Central de Ajuda
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
        </Card>
      </div>
    </div>
  );
};

export default TermosUso;
