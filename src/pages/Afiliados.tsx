import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Users, 
  Link2, 
  TrendingUp, 
  DollarSign,
  Share2,
  Copy,
  QrCode,
  FileText,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAffiliates } from '@/hooks/useAffiliates';
import { AffiliateOverviewCards } from '@/components/affiliate/AffiliateOverviewCards';
import { AffiliateReferralLink } from '@/components/affiliate/AffiliateReferralLink';
import { AffiliateCommissionsTable } from '@/components/affiliate/AffiliateCommissionsTable';
import { AffiliateUTMBuilder } from '@/components/affiliate/AffiliateUTMBuilder';
import { AffiliateMarketingMaterials } from '@/components/affiliate/AffiliateMarketingMaterials';
import { AffiliateAnalytics } from '@/components/affiliate/AffiliateAnalytics';

const Afiliados = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    affiliateData,
    overview,
    metrics,
    commissions,
    settings,
    assets,
    loading,
    isAffiliate,
    isApprovedAffiliate,
    requestAffiliation
  } = useAffiliates();

  const [requestingAffiliation, setRequestingAffiliation] = useState(false);

  const handleAffiliationRequest = async () => {
    setRequestingAffiliation(true);
    await requestAffiliation();
    setRequestingAffiliation(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-primary/5 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center gap-2 justify-center">
              <Users className="w-6 h-6 text-primary" />
              Programa de Afiliados
            </CardTitle>
            <CardDescription>
              Faça login para acessar o programa de afiliados.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => navigate('/auth')} 
              className="w-full"
            >
              Fazer Login
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/')} 
              className="w-full"
            >
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-32 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Se não é afiliado ainda
  if (!isAffiliate) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-primary/5">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Programa de Afiliados
              </h1>
            </div>
          </div>

          {/* Apresentação do Programa */}
          <div className="grid gap-6">
            <Card>
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl">
                  🚀 Ganhe Dinheiro Indicando Amigos
                </CardTitle>
                <CardDescription className="text-lg">
                  Torne-se um afiliado e receba comissões por cada jogador que você trouxer!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Benefícios */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <h3 className="font-semibold mb-1">Comissões Atrativas</h3>
                    <p className="text-sm text-muted-foreground">
                      Até {settings ? (settings.revshare_l1 * 100).toFixed(1) : '8'}% de comissão sobre o lucro
                    </p>
                  </div>
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <h3 className="font-semibold mb-1">3 Níveis</h3>
                    <p className="text-sm text-muted-foreground">
                      Ganhe também com indicações dos seus indicados
                    </p>
                  </div>
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <BarChart3 className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <h3 className="font-semibold mb-1">Relatórios Detalhados</h3>
                    <p className="text-sm text-muted-foreground">
                      Acompanhe seus ganhos em tempo real
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Como Funciona */}
                <div>
                  <h3 className="font-semibold text-lg mb-4 text-center">Como Funciona?</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                      <div>
                        <h4 className="font-medium">Seja Aprovado</h4>
                        <p className="text-sm text-muted-foreground">Solicite para ser afiliado e aguarde aprovação.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                      <div>
                        <h4 className="font-medium">Compartilhe seu Link</h4>
                        <p className="text-sm text-muted-foreground">Receba um link único para compartilhar com amigos.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                      <div>
                        <h4 className="font-medium">Ganhe Comissões</h4>
                        <p className="text-sm text-muted-foreground">Receba % sobre tudo que seus indicados jogarem!</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Tipos de Comissão */}
                {settings && (
                  <div>
                    <h3 className="font-semibold text-lg mb-4 text-center">Tipos de Comissão</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {(settings.plan_type === 'cpa' || settings.plan_type === 'hybrid') && (
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium text-green-600 mb-2">💰 CPA (Custo por Aquisição)</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Receba um valor fixo quando seu indicado fizer o primeiro depósito.
                          </p>
                          <div className="space-y-1 text-xs">
                            <div>Nível 1: R$ {(settings.cpa_l1_cents / 100).toFixed(2)}</div>
                            <div>Nível 2: R$ {(settings.cpa_l2_cents / 100).toFixed(2)}</div>
                            <div>Nível 3: R$ {(settings.cpa_l3_cents / 100).toFixed(2)}</div>
                          </div>
                        </div>
                      )}
                      {(settings.plan_type === 'revshare' || settings.plan_type === 'hybrid') && (
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium text-blue-600 mb-2">📈 Revshare (Participação na Receita)</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Receba % sobre o lucro do site com seus indicados.
                          </p>
                          <div className="space-y-1 text-xs">
                            <div>Nível 1: {(settings.revshare_l1 * 100).toFixed(1)}%</div>
                            <div>Nível 2: {(settings.revshare_l2 * 100).toFixed(1)}%</div>
                            <div>Nível 3: {(settings.revshare_l3 * 100).toFixed(1)}%</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Botão de Solicitação */}
                <div className="text-center pt-4">
                  <Button 
                    size="lg"
                    onClick={handleAffiliationRequest}
                    disabled={requestingAffiliation}
                    className="px-8"
                  >
                    {requestingAffiliation ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Enviando Solicitação...
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4 mr-2" />
                        Quero Ser Afiliado
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Sua solicitação será analisada e você receberá uma resposta em breve.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Se é afiliado mas está pendente de aprovação
  if (isAffiliate && !isApprovedAffiliate) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-primary/5">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Programa de Afiliados
              </h1>
            </div>
          </div>

          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
              <CardTitle>Solicitação em Análise</CardTitle>
              <CardDescription>
                Sua solicitação para se tornar afiliado está sendo analisada pela nossa equipe.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm">
                  <strong>Status:</strong>{' '}
                  <Badge variant="secondary" className="ml-2">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {affiliateData?.status === 'pending' ? 'Pendente' : 
                     affiliateData?.status === 'blocked' ? 'Bloqueado' : 'Status desconhecido'}
                  </Badge>
                </p>
                <p className="text-sm mt-2">
                  <strong>Código de Referência:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{affiliateData?.ref_code}</code>
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Você receberá uma notificação assim que sua solicitação for aprovada.
                </p>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
              >
                Voltar ao Jogo
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Painel do afiliado aprovado
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-primary/5">
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                  Painel do Afiliado
                </h1>
                <p className="text-sm text-muted-foreground">
                  Código: <code className="bg-muted px-1 rounded">{affiliateData?.ref_code}</code>
                  <Badge variant="default" className="ml-2">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Aprovado
                  </Badge>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cards de Overview */}
        <AffiliateOverviewCards 
          overview={overview}
          metrics={metrics}
          className="mb-8"
        />

        {/* Tabs do Painel */}
        <Tabs defaultValue="link" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6">
            <TabsTrigger value="link" className="flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              <span className="hidden sm:inline">Meu Link</span>
            </TabsTrigger>
            <TabsTrigger value="commissions" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Comissões</span>
            </TabsTrigger>
            <TabsTrigger value="utm" className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">UTM Builder</span>
            </TabsTrigger>
            <TabsTrigger value="materials" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Materiais</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="help" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Ajuda</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-6">
            <AffiliateReferralLink affiliateData={affiliateData} />
          </TabsContent>

          <TabsContent value="commissions" className="space-y-6">
            <AffiliateCommissionsTable commissions={commissions} />
          </TabsContent>

          <TabsContent value="utm" className="space-y-6">
            <AffiliateUTMBuilder affiliateData={affiliateData} />
          </TabsContent>

          <TabsContent value="materials" className="space-y-6">
            <AffiliateMarketingMaterials assets={assets || []} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AffiliateAnalytics 
              overview={overview}
              metrics={metrics}
              commissions={commissions}
            />
          </TabsContent>

          <TabsContent value="help" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Como Funciona o Programa de Afiliados
                </CardTitle>
                <CardDescription>
                  Entenda como ganhar dinheiro com indicações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {settings && (
                  <>
                    <div>
                      <h3 className="font-semibold mb-3">💰 Tipos de Comissão</h3>
                      <div className="space-y-3">
                        {(settings.plan_type === 'revshare' || settings.plan_type === 'hybrid') && (
                          <div className="p-3 border rounded">
                            <h4 className="font-medium text-blue-600">Revshare (Participação na Receita)</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              Você ganha uma porcentagem sobre o <strong>lucro do site</strong> gerado pelos seus indicados.
                            </p>
                            <div className="mt-2 text-sm">
                              <div>• Nível 1 (seus indicados): {(settings.revshare_l1 * 100).toFixed(1)}%</div>
                              <div>• Nível 2 (indicados dos seus indicados): {(settings.revshare_l2 * 100).toFixed(1)}%</div>
                              <div>• Nível 3: {(settings.revshare_l3 * 100).toFixed(1)}%</div>
                            </div>
                          </div>
                        )}
                        
                        {(settings.plan_type === 'cpa' || settings.plan_type === 'hybrid') && (
                          <div className="p-3 border rounded">
                            <h4 className="font-medium text-green-600">CPA (Custo por Aquisição)</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              Você recebe um <strong>valor fixo</strong> quando seu indicado fazer o primeiro depósito de pelo menos R$ {(settings.cpa_trigger_min_deposit_cents / 100).toFixed(2)}.
                            </p>
                            <div className="mt-2 text-sm">
                              <div>• Nível 1: R$ {(settings.cpa_l1_cents / 100).toFixed(2)}</div>
                              <div>• Nível 2: R$ {(settings.cpa_l2_cents / 100).toFixed(2)}</div>
                              <div>• Nível 3: R$ {(settings.cpa_l3_cents / 100).toFixed(2)}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="font-semibold mb-3">📅 Pagamentos</h3>
                      <div className="space-y-2 text-sm">
                        <p>• <strong>Mínimo para saque:</strong> R$ {(settings.payout_min_cents / 100).toFixed(2)}</p>
                        <p>• <strong>Frequência:</strong> Semanal (toda {
                          ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'][settings.payout_day_of_week - 1]
                        })</p>
                        <p>• <strong>Aprovação:</strong> {settings.require_manual_approval ? 'Manual (requer aprovação)' : 'Automática'}</p>
                        <p>• <strong>Método:</strong> Adicionado diretamente à sua carteira do jogo</p>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="font-semibold mb-3">🎯 Dicas para Maximizar Ganhos</h3>
                      <ul className="space-y-2 text-sm list-disc list-inside">
                        <li>Compartilhe seu link em redes sociais</li>
                        <li>Use os materiais de marketing fornecidos</li>
                        <li>Crie conteúdo sobre suas vitórias no jogo</li>
                        <li>Participe de grupos relacionados a jogos</li>
                        <li>Use UTMs para rastrear qual canal funciona melhor</li>
                        <li>Incentive seus indicados a continuarem jogando</li>
                      </ul>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Afiliados;