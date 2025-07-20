
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  HelpCircle, 
  CreditCard, 
  Gift, 
  User, 
  Settings,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const faqData = [
    {
      category: "Como Funciona",
      icon: <HelpCircle className="w-5 h-5" />,
      color: "from-blue-500 to-cyan-500",
      questions: [
        {
          question: "Como funciona o Baú Premiado?",
          answer: "O Baú Premiado é uma plataforma onde você pode abrir baús virtuais para ganhar prêmios reais. Você adiciona saldo à sua conta, escolhe um baú e descobre que prêmio ganhou. Todos os sorteios são aleatórios e transparentes."
        },
        {
          question: "Posso ver os prêmios antes de abrir o baú?",
          answer: "Sim! Você pode visualizar todos os prêmios disponíveis em cada baú clicando no botão 'Ver Itens'. Isso ajuda você a escolher o baú com os prêmios que mais te interessam."
        },
        {
          question: "Como funciona o sistema de probabilidades?",
          answer: "Cada item tem uma probabilidade específica de ser sorteado. Itens mais raros têm menor chance de serem ganhos, enquanto itens mais comuns têm maior probabilidade. Todas as probabilidades são transparentes e podem ser visualizadas."
        },
        {
          question: "Preciso ser maior de idade para jogar?",
          answer: "Sim, você precisa ter 18 anos ou mais para utilizar nossa plataforma. Isso é uma exigência legal para participar de jogos que envolvem prêmios."
        }
      ]
    },
    {
      category: "Pagamentos",
      icon: <CreditCard className="w-5 h-5" />,
      color: "from-green-500 to-emerald-500",
      questions: [
        {
          question: "Quais formas de pagamento são aceitas?",
          answer: "Aceitamos PIX (instantâneo), cartão de crédito e cartão de débito. O PIX é processado instantaneamente, enquanto cartões podem levar alguns minutos para confirmação."
        },
        {
          question: "Como adicionar saldo à minha conta?",
          answer: "Clique no botão 'Adicionar Saldo' no seu perfil ou na barra inferior (mobile), escolha o valor desejado e selecione a forma de pagamento. O saldo é adicionado automaticamente após a confirmação."
        },
        {
          question: "Posso solicitar reembolso do saldo?",
          answer: "O saldo adicionado não pode ser convertido de volta em dinheiro. Ele deve ser usado exclusivamente para abertura de baús na plataforma."
        },
        {
          question: "Há taxa para adicionar saldo?",
          answer: "Não cobramos taxas para adicionar saldo. Você paga apenas o valor que deseja adicionar à sua conta."
        }
      ]
    },
    {
      category: "Prêmios e Entregas",
      icon: <Gift className="w-5 h-5" />,
      color: "from-purple-500 to-pink-500",
      questions: [
        {
          question: "Como resgatar um prêmio que ganhei?",
          answer: "Vá para a seção 'Prêmios Conquistados', clique em 'Resgatar' no prêmio desejado, preencha seu endereço de entrega e pague a taxa de envio. Após a confirmação, o prêmio será enviado."
        },
        {
          question: "Qual o prazo para entrega dos prêmios?",
          answer: "Prêmios físicos são entregues em 5 a 15 dias úteis após a confirmação do pagamento da taxa de envio. Prêmios digitais são enviados instantaneamente por e-mail."
        },
        {
          question: "Posso rastrear meu pedido?",
          answer: "Sim! Após o envio, você receberá um código de rastreamento por e-mail e pode acompanhar o status na seção 'Minhas Entregas'."
        },
        {
          question: "E se eu não resgatar um prêmio?",
          answer: "Você tem 30 dias para resgatar um prêmio após ganhá-lo. Após este prazo, o prêmio será considerado perdido e não poderá mais ser resgatado."
        },
        {
          question: "Posso trocar um prêmio por outro?",
          answer: "Não oferecemos troca de prêmios. Cada prêmio ganho deve ser resgatado conforme suas características originais."
        }
      ]
    },
    {
      category: "Conta e Perfil",
      icon: <User className="w-5 h-5" />,
      color: "from-orange-500 to-red-500",
      questions: [
        {
          question: "Como criar uma conta?",
          answer: "Clique em 'Entrar' no menu superior, depois em 'Criar Conta'. Preencha seus dados pessoais, confirme seu e-mail e pronto! Você ganha R$ 50 de bônus para começar."
        },
        {
          question: "Esqueci minha senha, como recuperar?",
          answer: "Na tela de login, clique em 'Esqueci minha senha', digite seu e-mail e você receberá um link para criar uma nova senha."
        },
        {
          question: "Posso alterar meus dados pessoais?",
          answer: "Sim! Acesse seu perfil clicando no seu nome no menu superior e edite as informações desejadas. Alguns dados podem precisar de verificação."
        },
        {
          question: "Como excluir minha conta?",
          answer: "Entre em contato com nosso suporte através do e-mail suporte@baupremiado.com solicitando a exclusão. Processaremos seu pedido em até 48 horas."
        }
      ]
    },
    {
      category: "Problemas Técnicos",
      icon: <Settings className="w-5 h-5" />,
      color: "from-gray-500 to-slate-500",
      questions: [
        {
          question: "A plataforma não está carregando, o que fazer?",
          answer: "Primeiro, verifique sua conexão com a internet. Depois, tente limpar o cache do navegador ou usar outro navegador. Se o problema persistir, entre em contato com nosso suporte."
        },
        {
          question: "Meu pagamento foi aprovado mas o saldo não apareceu",
          answer: "Pagamentos por PIX são instantâneos, cartões podem levar até 5 minutos. Se após esse tempo o saldo não aparecer, entre em contato com nosso suporte com o comprovante."
        },
        {
          question: "Abri um baú mas não recebi o prêmio",
          answer: "Verifique na seção 'Prêmios Conquistados' se o item aparece lá. Se não aparecer, entre em contato com nosso suporte imediatamente com detalhes do ocorrido."
        },
        {
          question: "Como reportar um bug ou problema?",
          answer: "Entre em contato através do suporte@baupremiado.com ou WhatsApp (11) 9999-9999. Descreva detalhadamente o problema e, se possível, envie prints da tela."
        }
      ]
    }
  ];

  const filteredFAQ = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
           q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

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
              ❓ Perguntas Frequentes
            </Badge>
            <h1 className="text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              FAQ
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Encontre respostas rápidas para as dúvidas mais comuns sobre o Baú Premiado
            </p>
          </div>

          {/* Search */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Buscar por pergunta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 text-lg bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-yellow-400/50"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* FAQ Categories */}
        <div className="space-y-8">
          {filteredFAQ.map((category, categoryIndex) => (
            <Card key={categoryIndex} className="p-8 bg-gradient-to-br from-gray-800/30 to-gray-900/50 border-gray-700/50">
              <div className="flex items-center mb-6">
                <div className={`p-3 bg-gradient-to-r ${category.color} rounded-full mr-4 text-white`}>
                  {category.icon}
                </div>
                <h2 className="text-2xl font-bold text-white">{category.category}</h2>
                <Badge className="ml-4 bg-yellow-400/20 text-yellow-400 border-yellow-400/30">
                  {category.questions.length} pergunta{category.questions.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              
              <div className="space-y-4">
                {category.questions.map((faq, faqIndex) => {
                  const globalIndex = categoryIndex * 1000 + faqIndex;
                  const isOpen = openItems.includes(globalIndex);
                  
                  return (
                    <div key={faqIndex} className="border border-gray-700/50 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleItem(globalIndex)}
                        className="w-full p-6 text-left bg-gray-800/30 hover:bg-gray-700/30 transition-colors flex items-center justify-between"
                      >
                        <span className="font-semibold text-white pr-4">{faq.question}</span>
                        {isOpen ? (
                          <ChevronUp className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                        )}
                      </button>
                      
                      {isOpen && (
                        <div className="p-6 bg-gray-900/50 border-t border-gray-700/50">
                          <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredFAQ.length === 0 && (
          <Card className="p-12 text-center bg-gradient-to-br from-gray-800/30 to-gray-900/50 border-gray-700/50">
            <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold mb-4 text-white">
              Nenhuma pergunta encontrada
            </h3>
            <p className="text-gray-400 mb-6">
              Não encontramos resultados para sua busca. Tente usar outras palavras-chave ou entre em contato conosco.
            </p>
            <Link to="/central-ajuda" className="inline-flex items-center text-yellow-400 hover:text-yellow-300 transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar para Central de Ajuda
            </Link>
          </Card>
        )}

        {/* Contact */}
        <Card className="p-8 mt-12 text-center bg-gradient-to-r from-gray-800/50 to-gray-900/50 border-yellow-500/20">
          <h3 className="text-2xl font-bold mb-4 text-white">
            Não encontrou sua resposta?
          </h3>
          <p className="text-gray-300 mb-6">
            Nossa equipe está pronta para ajudar você com qualquer dúvida específica.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
              <strong className="text-yellow-400">E-mail:</strong>
              <br />
              <span className="text-gray-300">suporte@baupremiado.com</span>
            </div>
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
              <strong className="text-yellow-400">WhatsApp:</strong>
              <br />
              <span className="text-gray-300">(11) 9999-9999</span>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/central-ajuda" className="text-yellow-400 hover:text-yellow-300 transition-colors">
              Central de Ajuda
            </Link>
            <span className="text-gray-600">•</span>
            <Link to="/termos-uso" className="text-yellow-400 hover:text-yellow-300 transition-colors">
              Termos de Uso
            </Link>
            <span className="text-gray-600">•</span>
            <Link to="/politica-privacidade" className="text-yellow-400 hover:text-yellow-300 transition-colors">
              Política de Privacidade
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
