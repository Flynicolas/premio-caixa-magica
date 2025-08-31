import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useMoneyRedemptionAdmin } from '@/hooks/useMoneyRedemptionAdmin';
import { useWalletAdmin } from '@/hooks/useWalletAdmin';
import { Progress } from '@/components/ui/progress';
import TransactionHistoryPanel from './TransactionHistoryPanel';
import ApprovalsPanel from './ApprovalsPanel';
import FinancialReportsPanel from './FinancialReportsPanel';
import CasinoStatisticsPanel from './CasinoStatisticsPanel';
import { 
  Wallet, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar,
  CreditCard,
  Target,
  BarChart3,
  TrendingDown,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Input } from '@/components/ui/input';

const CaixaGeralDashboard = () => {
  const {
    loading: redemptionLoading,
    stats: redemptionStats,
    pendingRedemptions,
    securityAlerts,
    dailyData,
    approveRedemption,
    rejectRedemption,
    resolveAlert,
    refreshAllData: refreshRedemptionData
  } = useMoneyRedemptionAdmin();

  const { 
    stats: walletStats, 
    dailyStats, 
    monthlyStats, 
    recentTransactions, 
    topUsers, 
    loading: walletLoading 
  } = useWalletAdmin();

  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedRedemption, setSelectedRedemption] = useState<string | null>(null);

  const loading = redemptionLoading || walletLoading;

  // Funções para manipular aprovações
  const handleApprove = async (redemptionId: string) => {
    const success = await approveRedemption(redemptionId);
    if (success) {
      refreshRedemptionData();
    }
  };

  const handleReject = async (redemptionId: string, reason: string) => {
    if (!reason.trim()) {
      alert('Por favor, informe o motivo da rejeição');
      return;
    }
    
    const success = await rejectRedemption(redemptionId, reason);
    if (success) {
      setRejectionReason('');
      setSelectedRedemption(null);
      refreshRedemptionData();
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    const success = await resolveAlert(alertId);
    if (success) {
      refreshRedemptionData();
    }
  };

  // Configuração de cores para alertas
  const getAlertColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getAlertTypeText = (type: string) => {
    switch (type) {
      case 'high_value': return 'Resgate de Alto Valor';
      case 'frequent_redemptions': return 'Resgates Frequentes';
      case 'suspicious_pattern': return 'Padrão Suspeito';
      default: return type;
    }
  };

  if (loading && !redemptionStats && !walletStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-white">Carregando Caixa Geral...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-background min-h-screen">
      {/* Modern Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Dashboard Financeiro
          </h1>
          <p className="text-muted-foreground mt-1">Visão geral completa do sistema financeiro</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={refreshRedemptionData} disabled={loading} variant="outline" size="sm">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Modern Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Depósitos Aprovados */}
        <Card className="bg-card border-border hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Depósitos Aprovados</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-foreground">
                    R$ {dailyStats?.totalDeposits?.toFixed(2) || '0.00'}
                  </span>
                  <div className="flex items-center text-green-500 text-xs">
                    <ArrowUpRight className="w-3 h-3" />
                    <span>+12%</span>
                  </div>
                </div>
                <div className="w-full bg-muted h-1 rounded-full">
                  <div className="bg-green-500 h-1 rounded-full w-3/4"></div>
                </div>
              </div>
              <div className="bg-green-500/10 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Saques Pendentes */}
        <Card className="bg-card border-border hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Saques Pendentes</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-foreground">
                    {redemptionStats?.pending_approvals || 0}
                  </span>
                  <div className="flex items-center text-orange-500 text-xs">
                    <ArrowDownRight className="w-3 h-3" />
                    <span>-5%</span>
                  </div>
                </div>
                <div className="w-full bg-muted h-1 rounded-full">
                  <div className="bg-orange-500 h-1 rounded-full w-1/2"></div>
                </div>
              </div>
              <div className="bg-orange-500/10 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usuários Ativos */}
        <Card className="bg-card border-border hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Usuários Ativos</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-foreground">
                    {topUsers?.length || 0}
                  </span>
                  <div className="flex items-center text-blue-500 text-xs">
                    <ArrowUpRight className="w-3 h-3" />
                    <span>+8%</span>
                  </div>
                </div>
                <div className="w-full bg-muted h-1 rounded-full">
                  <div className="bg-blue-500 h-1 rounded-full w-2/3"></div>
                </div>
              </div>
              <div className="bg-blue-500/10 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ganhos/Perdas Totais */}
        <Card className="bg-card border-border hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Lucro Líquido</p>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${(dailyStats?.netProfit || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    R$ {dailyStats?.netProfit?.toFixed(2) || '0.00'}
                  </span>
                  <div className={`flex items-center text-xs ${(dailyStats?.netProfit || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {(dailyStats?.netProfit || 0) >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    <span>{(dailyStats?.netProfit || 0) >= 0 ? '+' : '-'}15%</span>
                  </div>
                </div>
                <div className="w-full bg-muted h-1 rounded-full">
                  <div className={`h-1 rounded-full w-4/5 ${(dailyStats?.netProfit || 0) >= 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
              </div>
              <div className={`bg-opacity-10 p-3 rounded-lg ${(dailyStats?.netProfit || 0) >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                <Target className={`w-6 h-6 ${(dailyStats?.netProfit || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Retenção de Usuários */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">1x Depósito</p>
              <p className="text-3xl font-bold text-foreground">85%</p>
              <div className="w-full bg-muted h-2 rounded-full mt-3">
                <div className="bg-blue-500 h-2 rounded-full" style={{width: '85%'}}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">2x Depósito</p>
              <p className="text-3xl font-bold text-foreground">62%</p>
              <div className="w-full bg-muted h-2 rounded-full mt-3">
                <div className="bg-green-500 h-2 rounded-full" style={{width: '62%'}}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">3x Depósito</p>
              <p className="text-3xl font-bold text-foreground">41%</p>
              <div className="w-full bg-muted h-2 rounded-full mt-3">
                <div className="bg-yellow-500 h-2 rounded-full" style={{width: '41%'}}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">4x+ Depósito</p>
              <p className="text-3xl font-bold text-foreground">28%</p>
              <div className="w-full bg-muted h-2 rounded-full mt-3">
                <div className="bg-purple-500 h-2 rounded-full" style={{width: '28%'}}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modern Activity Section */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Atividades Recentes
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Buscar atividades..." 
                  className="pl-9 w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTransactions?.slice(0, 8).map((transaction, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {transaction.user_email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.type} • {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-xs">
                    {transaction.type === 'deposit' ? 'Depósito' : 
                     transaction.type === 'purchase' ? 'Compra' : 'Outros'}
                  </Badge>
                  <span className={`text-sm font-semibold ${
                    transaction.type === 'deposit' ? 'text-green-500' : 'text-blue-500'
                  }`}>
                    R$ {transaction.amount.toFixed(2)}
                  </span>
                </div>
              </div>
            )) || (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-semibold text-foreground">Nenhuma atividade recente</p>
                <p className="text-muted-foreground">As atividades aparecerão aqui quando houver transações</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs para diferentes seções */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-muted/30">
          <TabsTrigger value="overview" className="data-[state=active]:bg-background">Dashboard</TabsTrigger>
          <TabsTrigger value="transactions" className="data-[state=active]:bg-background">Transações & Histórico</TabsTrigger>
          <TabsTrigger value="approvals" className="data-[state=active]:bg-background">Liberações & Aprovações</TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-background">Relatórios Financeiros</TabsTrigger>
          <TabsTrigger value="casino-stats" className="data-[state=active]:bg-background">Estatísticas de Casino</TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resumo Mensal */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Performance Mensal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Entradas do Mês</span>
                    <span className="font-semibold text-green-500">
                      R$ {monthlyStats?.totalDeposits?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <Progress 
                    value={(monthlyStats?.totalDeposits || 0) / Math.max(monthlyStats?.totalDeposits || 1, monthlyStats?.chestSales || 1) * 100} 
                    className="h-2"
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Vendas de Baús</span>
                    <span className="font-semibold text-blue-500">
                      R$ {monthlyStats?.chestSales?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <Progress 
                    value={(monthlyStats?.chestSales || 0) / Math.max(monthlyStats?.totalDeposits || 1, monthlyStats?.chestSales || 1) * 100} 
                    className="h-2"
                  />
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-foreground">Lucro Mensal:</span>
                    <span className={`font-bold text-lg ${(monthlyStats?.netProfit || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      R$ {monthlyStats?.netProfit?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Usuários */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Top Usuários
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topUsers?.slice(0, 5).map((user, index) => (
                    <div key={user.user_id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="w-7 h-7 p-0 flex items-center justify-center text-xs">
                          {index + 1}
                        </Badge>
                        <div>
                          <p className="text-sm font-medium text-foreground">{user.email}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.transactions_count} transações
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-green-500">
                          R$ {user.total_spent?.toFixed(2) || '0.00'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Saldo: R$ {user.current_balance?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                    </div>
                  )) || (
                    <p className="text-center text-muted-foreground py-8">Carregando usuários...</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Resgates Pendentes */}
        <TabsContent value="redemptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Resgates de Dinheiro Aguardando Aprovação
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingRedemptions?.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 mx-auto text-green-400 mb-4" />
                  <p className="text-lg font-semibold">Nenhum resgate pendente</p>
                  <p className="text-muted-foreground">Todos os resgates estão em dia!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRedemptions?.map((redemption) => (
                    <div key={redemption.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-semibold text-white">{redemption.user_name}</p>
                            <p className="text-sm text-muted-foreground">{redemption.user_email}</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-green-400">
                              R$ {redemption.redemption_amount.toFixed(2)}
                            </p>
                            <p className="text-sm text-muted-foreground">{redemption.item_name}</p>
                          </div>
                          <div>
                            <Badge variant={redemption.security_score >= 70 ? 'destructive' : 'secondary'}>
                              Score: {redemption.security_score}
                            </Badge>
                            <p className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(redemption.created_at), { 
                                addSuffix: true, 
                                locale: ptBR 
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(redemption.id)}
                          disabled={loading}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Aprovar
                        </Button>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="destructive" onClick={() => setSelectedRedemption(redemption.id)}>
                              <XCircle className="w-4 h-4 mr-1" />
                              Rejeitar
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Rejeitar Resgate</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Motivo da Rejeição</Label>
                                <Textarea
                                  value={rejectionReason}
                                  onChange={(e) => setRejectionReason(e.target.value)}
                                  placeholder="Informe o motivo da rejeição..."
                                />
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => {
                                  setRejectionReason('');
                                  setSelectedRedemption(null);
                                }}>
                                  Cancelar
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  onClick={() => selectedRedemption && handleReject(selectedRedemption, rejectionReason)}
                                >
                                  Confirmar Rejeição
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alertas de Segurança */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Alertas de Segurança Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {securityAlerts?.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 mx-auto text-green-400 mb-4" />
                  <p className="text-lg font-semibold">Nenhum alerta ativo</p>
                  <p className="text-muted-foreground">Sistema funcionando normalmente!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {securityAlerts?.map((alert) => (
                    <div key={alert.id} className={`p-4 rounded-lg border ${getAlertColor(alert.alert_level)}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <Badge className={getAlertColor(alert.alert_level)}>
                              {alert.alert_level.toUpperCase()}
                            </Badge>
                            <h3 className="font-semibold">{getAlertTypeText(alert.alert_type)}</h3>
                          </div>
                          <p className="text-sm mb-2">
                            <strong>Usuário:</strong> {alert.user_name} ({alert.user_email})
                          </p>
                          <p className="text-sm">
                            <strong>Detectado:</strong> {formatDistanceToNow(new Date(alert.created_at), { 
                              addSuffix: true, 
                              locale: ptBR 
                            })}
                          </p>
                          {alert.alert_data?.amount && (
                            <p className="text-sm">
                              <strong>Valor:</strong> R$ {parseFloat(alert.alert_data.amount).toFixed(2)}
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleResolveAlert(alert.id)}
                          disabled={loading}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Resolver
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transações Recentes */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Transações Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTransactions?.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        transaction.type === 'deposit' ? 'bg-green-100 text-green-600' :
                        transaction.type === 'purchase' ? 'bg-blue-100 text-blue-600' :
                        transaction.type === 'money_redemption' ? 'bg-purple-100 text-purple-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {transaction.type === 'deposit' ? <TrendingUp className="w-4 h-4" /> :
                         transaction.type === 'purchase' ? <CreditCard className="w-4 h-4" /> :
                         transaction.type === 'money_redemption' ? <DollarSign className="w-4 h-4" /> :
                         <TrendingDown className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {transaction.user_email} • {new Date(transaction.created_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${
                        transaction.type === 'deposit' || transaction.type === 'money_redemption' ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        {transaction.type === 'deposit' || transaction.type === 'money_redemption' ? '+' : '-'}R$ {transaction.amount.toFixed(2)}
                      </p>
                      <Badge variant={
                        transaction.status === 'completed' ? 'default' :
                        transaction.status === 'pending' ? 'secondary' : 'destructive'
                      }>
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                )) || <p className="text-center text-muted-foreground">Carregando transações...</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dados de Resgates (Últimos 30 dias)</CardTitle>
            </CardHeader>
            <CardContent>
              {dailyData?.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-semibold">Nenhum dado disponível</p>
                  <p className="text-muted-foreground">Aguardando resgates para exibir analytics</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">
                        {dailyData?.reduce((acc, day) => acc + Number(day.total_redemptions), 0) || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Total de Resgates</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-400">
                        R$ {dailyData?.reduce((acc, day) => acc + Number(day.total_amount), 0).toFixed(2) || '0.00'}
                      </p>
                      <p className="text-sm text-muted-foreground">Valor Total</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-400">
                        {dailyData?.reduce((acc, day) => acc + Number(day.unique_users), 0) || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Usuários Únicos</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {dailyData?.slice(0, 10).map((day, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-800/30 rounded">
                        <div>
                          <p className="text-sm font-medium">{new Date(day.date).toLocaleDateString('pt-BR')}</p>
                          <p className="text-xs text-muted-foreground">{day.unique_users} usuários únicos</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{day.total_redemptions} resgates</p>
                          <p className="text-xs text-green-600">R$ {day.total_amount.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CaixaGeralDashboard;