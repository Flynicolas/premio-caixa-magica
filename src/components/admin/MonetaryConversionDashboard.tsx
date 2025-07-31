import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useMonetaryConversionAdmin } from '@/hooks/useMonetaryConversionAdmin';
import { Wallet, TrendingUp, AlertTriangle, DollarSign, Users, Clock, CheckCircle, XCircle, Eye, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const MonetaryConversionDashboard = () => {
  const {
    loading,
    stats,
    pendingApprovals,
    securityAlerts,
    dailyData,
    approveConversion,
    rejectConversion,
    resolveAlert,
    refreshAllData
  } = useMonetaryConversionAdmin();

  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedConversion, setSelectedConversion] = useState<string | null>(null);

  // Funções para manipular aprovações
  const handleApprove = async (conversionId: string) => {
    const success = await approveConversion(conversionId);
    if (success) {
      refreshAllData();
    }
  };

  const handleReject = async (conversionId: string, reason: string) => {
    if (!reason.trim()) {
      alert('Por favor, informe o motivo da rejeição');
      return;
    }
    
    const success = await rejectConversion(conversionId, reason);
    if (success) {
      setRejectionReason('');
      setSelectedConversion(null);
      refreshAllData();
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    const success = await resolveAlert(alertId);
    if (success) {
      refreshAllData();
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
      case 'high_value_conversion': return 'Conversão de Alto Valor';
      case 'daily_limit_reached': return 'Limite Diário Atingido';
      case 'suspicious_pattern': return 'Padrão Suspeito';
      case 'rapid_conversions': return 'Conversões Rápidas';
      case 'duplicate_conversion': return 'Conversão Duplicada';
      default: return type;
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-white">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Conversões Monetárias</h2>
          <p className="text-muted-foreground">Monitoramento de conversões de itens para saldo real</p>
        </div>
        <Button onClick={refreshAllData} disabled={loading}>
          <TrendingUp className="w-4 h-4 mr-2" />
          Atualizar Dados
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-300">Total de Conversões</p>
                <p className="text-xl font-bold text-blue-200">{stats?.total_conversions || 0}</p>
              </div>
              <Wallet className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-300">Valor Total Convertido</p>
                <p className="text-xl font-bold text-green-200">
                  R$ {(stats?.total_amount || 0).toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/20 to-orange-800/20 border-orange-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-orange-300">Pendentes Aprovação</p>
                <p className="text-xl font-bold text-orange-200">{stats?.pending_approvals || 0}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-300">Hoje</p>
                <p className="text-xl font-bold text-purple-200">{stats?.completed_today || 0}</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-900/20 to-cyan-800/20 border-cyan-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyan-300">Valor Hoje</p>
                <p className="text-xl font-bold text-cyan-200">
                  R$ {(stats?.amount_today || 0).toFixed(2)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-900/20 to-pink-800/20 border-pink-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-pink-300">Valor Médio</p>
                <p className="text-xl font-bold text-pink-200">
                  R$ {(stats?.avg_conversion_amount || 0).toFixed(2)}
                </p>
              </div>
              <Users className="w-8 h-8 text-pink-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para diferentes seções */}
      <Tabs defaultValue="approvals" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="approvals">
            Aprovações Pendentes ({pendingApprovals.length})
          </TabsTrigger>
          <TabsTrigger value="alerts">
            Alertas de Segurança ({securityAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="analytics">
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Aprovações Pendentes */}
        <TabsContent value="approvals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Conversões Aguardando Aprovação Manual
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingApprovals.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 mx-auto text-green-400 mb-4" />
                  <p className="text-lg font-semibold">Nenhuma aprovação pendente</p>
                  <p className="text-muted-foreground">Todas as conversões estão em dia!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingApprovals.map((approval) => (
                    <div key={approval.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-semibold text-white">{approval.user_name}</p>
                            <p className="text-sm text-muted-foreground">{approval.user_email}</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-green-400">
                              R$ {approval.conversion_amount.toFixed(2)}
                            </p>
                            <p className="text-sm text-muted-foreground">{approval.item_name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(approval.created_at), { 
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
                          onClick={() => handleApprove(approval.id)}
                          disabled={loading}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Aprovar
                        </Button>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="destructive" onClick={() => setSelectedConversion(approval.id)}>
                              <XCircle className="w-4 h-4 mr-1" />
                              Rejeitar
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Rejeitar Conversão</DialogTitle>
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
                                  setSelectedConversion(null);
                                }}>
                                  Cancelar
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  onClick={() => selectedConversion && handleReject(selectedConversion, rejectionReason)}
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
              {securityAlerts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 mx-auto text-green-400 mb-4" />
                  <p className="text-lg font-semibold">Nenhum alerta ativo</p>
                  <p className="text-muted-foreground">Sistema funcionando normalmente!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {securityAlerts.map((alert) => (
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

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dados Diários (Últimos 30 dias)</CardTitle>
            </CardHeader>
            <CardContent>
              {dailyData.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-semibold">Nenhum dado disponível</p>
                  <p className="text-muted-foreground">Aguardando conversões para exibir analytics</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">
                        {dailyData.reduce((acc, day) => acc + Number(day.total_conversions), 0)}
                      </p>
                      <p className="text-sm text-muted-foreground">Total de Conversões</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-400">
                        R$ {dailyData.reduce((acc, day) => acc + Number(day.total_amount), 0).toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">Valor Total</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-400">
                        {dailyData.reduce((acc, day) => acc + Number(day.unique_users), 0)}
                      </p>
                      <p className="text-sm text-muted-foreground">Usuários Únicos</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {dailyData.slice(0, 10).map((day, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-800/30 rounded">
                        <div>
                          <p className="font-medium">{new Date(day.date).toLocaleDateString('pt-BR')}</p>
                          <p className="text-sm text-muted-foreground">
                            {day.unique_users} usuários únicos
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{day.total_conversions} conversões</p>
                          <p className="text-sm text-green-400">R$ {Number(day.total_amount).toFixed(2)}</p>
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

export default MonetaryConversionDashboard;