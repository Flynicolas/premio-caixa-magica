import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMoneyRedemptionAdmin } from '@/hooks/useMoneyRedemptionAdmin';
import ManualReleaseHistory from './ManualReleaseHistory';
import { 
  Clock, 
  CheckCircle, 
  XCircle,
  Shield,
  Crown,
  DollarSign,
  AlertTriangle
} from 'lucide-react';

const ApprovalsPanel = () => {
  const {
    pendingRedemptions,
    securityAlerts,
    approveRedemption,
    rejectRedemption,
    resolveAlert,
    loading
  } = useMoneyRedemptionAdmin();

  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedRedemption, setSelectedRedemption] = useState<string | null>(null);

  const handleApprove = async (redemptionId: string) => {
    await approveRedemption(redemptionId);
  };

  const handleReject = async (redemptionId: string, reason: string) => {
    if (!reason.trim()) {
      alert('Por favor, informe o motivo da rejeição');
      return;
    }
    await rejectRedemption(redemptionId, reason);
    setRejectionReason('');
    setSelectedRedemption(null);
  };

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

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-orange-900/20 to-orange-800/20 border-orange-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-300">Resgates Pendentes</p>
                <p className="text-2xl font-bold text-orange-200">{pendingRedemptions?.length || 0}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-900/20 to-red-800/20 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-300">Alertas de Segurança</p>
                <p className="text-2xl font-bold text-red-200">{securityAlerts?.length || 0}</p>
              </div>
              <Shield className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 border-yellow-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-300">Valor Total Pendente</p>
                <p className="text-xl font-bold text-yellow-200">
                  R$ {pendingRedemptions?.reduce((sum, r) => sum + r.redemption_amount, 0).toFixed(2) || '0.00'}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="redemptions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="redemptions">
            Resgates Pendentes ({pendingRedemptions?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="alerts">
            Alertas de Segurança ({securityAlerts?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="manual-releases">
            Liberações Manuais
          </TabsTrigger>
        </TabsList>

        {/* Resgates de Dinheiro Pendentes */}
        <TabsContent value="redemptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
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
                              {new Date(redemption.created_at).toLocaleString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApprove(redemption.id)}
                          disabled={loading}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm flex items-center gap-1"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Aprovar
                        </button>
                        
                        <button
                          onClick={() => {
                            const reason = prompt('Motivo da rejeição:');
                            if (reason) handleReject(redemption.id, reason);
                          }}
                          disabled={loading}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm flex items-center gap-1"
                        >
                          <XCircle className="w-4 h-4" />
                          Rejeitar
                        </button>
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
                <Shield className="w-5 h-5" />
                Alertas de Segurança Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {securityAlerts?.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 mx-auto text-green-400 mb-4" />
                  <p className="text-lg font-semibold">Nenhum alerta ativo</p>
                  <p className="text-muted-foreground">Sistema seguro!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {securityAlerts?.map((alert) => (
                    <div key={alert.id} className={`p-4 rounded-lg border ${getAlertColor(alert.alert_level)}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-5 h-5" />
                            <span className="font-semibold">{getAlertTypeText(alert.alert_type)}</span>
                            <Badge variant="outline" className={`border-current`}>
                              {alert.alert_level}
                            </Badge>
                          </div>
                          <p className="text-sm mb-2">{alert.user_name} - {alert.user_email}</p>
                          {alert.alert_data && (
                            <div className="text-sm space-y-1">
                              {alert.alert_data.amount && (
                                <p>Valor: R$ {Number(alert.alert_data.amount).toFixed(2)}</p>
                              )}
                              {alert.alert_data.security_score && (
                                <p>Score de Segurança: {alert.alert_data.security_score}</p>
                              )}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => resolveAlert(alert.id)}
                          disabled={loading}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                        >
                          Resolver
                        </button>
                      </div>
                      <p className="text-xs text-right mt-2">
                        {new Date(alert.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Liberações Manuais */}
        <TabsContent value="manual-releases" className="space-y-4">
          <ManualReleaseHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApprovalsPanel;