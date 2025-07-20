
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, Eye, UserCheck, Database, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const PoliticaPrivacidade = () => {
  const sections = [
    {
      id: "coleta",
      title: "1. Informações que Coletamos",
      icon: <Database className="w-5 h-5" />,
      content: [
        "Dados pessoais: Nome, e-mail, CPF, telefone e endereço para entrega.",
        "Dados de pagamento: Informações de cartão (processadas por terceiros seguros).",
        "Dados de navegação: IP, navegador, dispositivo e comportamento na plataforma.",
        "Dados de interação: Baús abertos, prêmios ganhos e histórico de atividades.",
        "Cookies: Para melhorar a experiência do usuário e personalizar conteúdo."
      ]
    },
    {
      id: "uso",
      title: "2. Como Usamos suas Informações",
      icon: <UserCheck className="w-5 h-5" />,
      content: [
        "Processar pagamentos e entregar prêmios físicos.",
        "Personalizar sua experiência na plataforma.",
        "Comunicar sobre promoções, atualizações e suporte.",
        "Melhorar nossos serviços através de análises de uso.",
        "Cumprir obrigações legais e regulamentares."
      ]
    },
    {
      id: "compartilhamento",
      title: "3. Compartilhamento de Dados",
      icon: <Shield className="w-5 h-5" />,
      content: [
        "Não vendemos suas informações pessoais para terceiros.",
        "Compartilhamos dados apenas com parceiros essenciais (pagamento, entrega).",
        "Todos os parceiros assinam acordos de confidencialidade.",
        "Podemos compartilhar dados mediante ordem judicial.",
        "Dados anonimizados podem ser usados para estatísticas."
      ]
    },
    {
      id: "seguranca",
      title: "4. Segurança dos Dados",
      icon: <Lock className="w-5 h-5" />,
      content: [
        "Utilizamos criptografia SSL para proteger transmissão de dados.",
        "Senhas são armazenadas com hash seguro.",
        "Acesso aos dados é restrito a funcionários autorizados.",
        "Realizamos backups regulares e testes de segurança.",
        "Monitoramento 24/7 contra atividades suspeitas."
      ]
    },
    {
      id: "direitos",
      title: "5. Seus Direitos (LGPD)",
      icon: <Eye className="w-5 h-5" />,
      content: [
        "Acesso: Solicitar cópia de todos os seus dados.",
        "Correção: Alterar informações incorretas ou incompletas.",
        "Exclusão: Solicitar a remoção de seus dados pessoais.",
        "Portabilidade: Receber seus dados em formato estruturado.",
        "Oposição: Contestar o processamento de seus dados."
      ]
    }
  ];

  const dataRetention = [
    { type: "Dados de conta", period: "Enquanto a conta estiver ativa", reason: "Funcionamento do serviço" },
    { type: "Histórico de transações", period: "5 anos", reason: "Obrigações fiscais" },
    { type: "Dados de navegação", period: "2 anos", reason: "Análises e melhorias" },
    { type: "Cookies não essenciais", period: "12 meses", reason: "Personalização" }
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
              🔒 Política de Privacidade
            </Badge>
            <h1 className="text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              Política de Privacidade
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Entenda como coletamos, usamos e protegemos suas informações pessoais
            </p>
            <div className="mt-6 text-sm text-gray-400">
              Última atualização: 20 de julho de 2024
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Introduction */}
        <Card className="p-8 mb-12 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 border-blue-500/30">
          <div className="text-center">
            <Shield className="w-16 h-16 text-blue-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4 text-white">
              Seu Privacidade é Nossa Prioridade
            </h2>
            <p className="text-gray-300 leading-relaxed">
              No Baú Premiado, levamos sua privacidade muito a sério. Esta política explica como 
              coletamos, usamos, armazenamos e protegemos suas informações pessoais em conformidade 
              com a Lei Geral de Proteção de Dados (LGPD) e melhores práticas internacionais.
            </p>
          </div>
        </Card>

        {/* Main Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <Card key={index} className="p-8 bg-gradient-to-br from-gray-800/30 to-gray-900/50 border-gray-700/50">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-blue-400/20 rounded-full mr-4 text-blue-400">
                  {section.icon}
                </div>
                <h3 className="text-2xl font-bold text-white">{section.title}</h3>
              </div>
              <div className="space-y-4">
                {section.content.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-300 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Data Retention */}
        <Card className="p-8 mt-12 bg-gradient-to-br from-gray-800/30 to-gray-900/50 border-gray-700/50">
          <h3 className="text-2xl font-bold mb-6 text-white flex items-center">
            <Database className="w-6 h-6 mr-3 text-purple-400" />
            Retenção de Dados
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700/50">
                  <th className="text-left py-3 px-4 text-gray-300">Tipo de Dado</th>
                  <th className="text-left py-3 px-4 text-gray-300">Período</th>
                  <th className="text-left py-3 px-4 text-gray-300">Motivo</th>
                </tr>
              </thead>
              <tbody>
                {dataRetention.map((item, index) => (
                  <tr key={index} className="border-b border-gray-800/50">
                    <td className="py-3 px-4 text-white">{item.type}</td>
                    <td className="py-3 px-4 text-yellow-400">{item.period}</td>
                    <td className="py-3 px-4 text-gray-300">{item.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Contact for Privacy */}
        <Card className="p-8 mt-12 bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-500/30">
          <div className="text-center">
            <UserCheck className="w-16 h-16 text-green-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold mb-4 text-white">
              Exercer seus Direitos
            </h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Para exercer qualquer dos seus direitos relacionados aos dados pessoais, 
              entre em contato conosco através dos canais oficiais. Responderemos em até 
              15 dias úteis conforme exigido pela LGPD.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                <strong className="text-green-400">E-mail DPO:</strong>
                <br />
                <span className="text-gray-300">privacidade@baupremiado.com</span>
              </div>
              <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                <strong className="text-green-400">Suporte:</strong>
                <br />
                <span className="text-gray-300">suporte@baupremiado.com</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <Card className="p-8 mt-12 text-center bg-gradient-to-r from-gray-800/50 to-gray-900/50 border-yellow-500/20">
          <h3 className="text-xl font-bold mb-4 text-white">
            Dúvidas sobre Privacidade?
          </h3>
          <p className="text-gray-300 mb-6">
            Se você tiver dúvidas sobre como tratamos seus dados, entre em contato conosco.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/central-ajuda" className="text-yellow-400 hover:text-yellow-300 transition-colors">
              Central de Ajuda
            </Link>
            <span className="text-gray-600">•</span>
            <Link to="/termos-uso" className="text-yellow-400 hover:text-yellow-300 transition-colors">
              Termos de Uso
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

export default PoliticaPrivacidade;
