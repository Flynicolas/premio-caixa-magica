import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAffiliateDashboard } from '@/hooks/useAffiliateDashboard';
import { 
  Users, 
  DollarSign, 
  MousePointer, 
  TrendingUp, 
  Copy, 
  ExternalLink,
  Plus,
  Clock,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

export const AffiliateUserDashboard = () => {
  const {
    loading,
    stats,
    commissions,
    clicks,
    affiliate,
    applyToAffiliate,
    generateReferralLink
  } = useAffiliateDashboard();

  const [referrerCode, setReferrerCode] = useState('');
  const [customPath, setCustomPath] = useState('');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copiado para a área de transferência!');
  };

  const formatCurrency = (cents: number) => {
    return (cents / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!affiliate) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Users className="w-6 h-6" />
              Programa de Afiliados
            </CardTitle>
            <p className="text-muted-foreground">
              Ganhe comissões indicando novos usuários para nossa plataforma
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 border rounded-lg">
                <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <h3 className="font-semibold">CPA</h3>
                <p className="text-sm text-muted-foreground">R$ 50 por cadastro com depósito</p>
              </div>
              <div className="p-4 border rounded-lg">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-semibold">RevShare</h3>
                <p className="text-sm text-muted-foreground">8% dos gastos dos indicados</p>
              </div>
              <div className="p-4 border rounded-lg">
                <Users className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <h3 className="font-semibold">3 Níveis</h3>
                <p className="text-sm text-muted-foreground">Ganhe com sub-afiliados</p>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                placeholder="Código do afiliado que te indicou (opcional)"
                value={referrerCode}
                onChange={(e) => setReferrerCode(e.target.value)}
              />
              <Button 
                onClick={() => applyToAffiliate(referrerCode)}
                className="w-full"
                disabled={loading}
              >
                <Plus className="w-4 h-4 mr-2" />
                Aplicar para Afiliado
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (affiliate.status === 'pending') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Clock className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
              <h2 className="text-xl font-semibold mb-2">Solicitação em Análise</h2>
              <p className="text-muted-foreground">
                Sua solicitação para se tornar afiliado está sendo analisada. 
                Você receberá uma notificação quando for aprovada.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (affiliate.status === 'blocked') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <ExternalLink className="w-12 h-12 mx-auto mb-4 text-red-500" />
              <h2 className="text-xl font-semibold mb-2">Conta Suspensa</h2>
              <p className="text-muted-foreground">
                Sua conta de afiliado foi suspensa. Entre em contato com o suporte para mais informações.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard de Afiliado</h1>
          <p className="text-muted-foreground">
            Seu código: <span className="font-mono font-semibold">{affiliate.ref_code}</span>
          </p>
        </div>
        <Badge variant="outline" className="text-green-600 border-green-600">
          <CheckCircle className="w-4 h-4 mr-1" />
          Ativo
        </Badge>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Cliques</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_clicks}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cadastros</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.registrations}</div>
              <p className="text-xs text-muted-foreground">
                {stats.conversion_rate.toFixed(1)}% conversão
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendente</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.pending_commissions_cents)}
              </div>
              <p className="text-xs text-muted-foreground">
                Aguardando aprovação
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pago</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.paid_commissions_cents)}
              </div>
              <p className="text-xs text-muted-foreground">
                Este mês: {formatCurrency(stats.this_month_commissions_cents)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="links" className="space-y-4">
        <TabsList>
          <TabsTrigger value="links">Links de Referência</TabsTrigger>
          <TabsTrigger value="commissions">Comissões</TabsTrigger>
          <TabsTrigger value="clicks">Cliques</TabsTrigger>
        </TabsList>

        <TabsContent value="links" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerar Links de Referência</CardTitle>
              <p className="text-sm text-muted-foreground">
                Crie links personalizados para compartilhar e ganhar comissões
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Página de destino (opcional)</label>
                <Input
                  placeholder="/baús ou /raspadinha"
                  value={customPath}
                  onChange={(e) => setCustomPath(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Seu link de referência</label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={generateReferralLink(customPath)}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generateReferralLink(customPath))}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Comissões</CardTitle>
            </CardHeader>
            <CardContent>
              {commissions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma comissão encontrada ainda
                </p>
              ) : (
                <div className="space-y-2">
                  {commissions.slice(0, 10).map((commission) => (
                    <div
                      key={commission.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">
                          {commission.kind.toUpperCase()} - Nível {commission.level}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(commission.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">
                          {formatCurrency(commission.amount_cents)}
                        </div>
                        <Badge 
                          variant={
                            commission.status === 'paid' ? 'outline' :
                            commission.status === 'approved' ? 'secondary' : 'outline'
                          }
                          className={
                            commission.status === 'paid' ? 'text-green-600 border-green-600' :
                            commission.status === 'approved' ? 'text-blue-600' : 'text-yellow-600'
                          }
                        >
                          {commission.status === 'paid' ? 'Pago' :
                           commission.status === 'approved' ? 'Aprovado' : 'Pendente'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clicks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Últimos Cliques</CardTitle>
            </CardHeader>
            <CardContent>
              {clicks.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum clique registrado ainda
                </p>
              ) : (
                <div className="space-y-2">
                  {clicks.slice(0, 10).map((click) => (
                    <div
                      key={click.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{click.landing_path || '/'}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(click.created_at).toLocaleString('pt-BR')}
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        {click.utm_source && (
                          <div>Fonte: {click.utm_source}</div>
                        )}
                        {click.utm_campaign && (
                          <div>Campanha: {click.utm_campaign}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};