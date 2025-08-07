import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, DollarSign, TrendingUp, TrendingDown, Shield, RefreshCw, Eye, AlertCircle } from 'lucide-react';
import { useUnifiedWallet } from '@/hooks/useUnifiedWallet';

import { cn } from '@/lib/utils';

/**
 * 🚨 DASHBOARD CENTRAL DE CONTROLE DE CAIXA
 * Sistema de monitoramento financeiro em tempo real
 */

const formatCurrencyBR = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const CashControlDashboard = () => {
  const { cashFlow, auditAlerts, triggerAudit, loading, refreshData } = useUnifiedWallet();
  const [isAuditing, setIsAuditing] = useState(false);

  const handleAudit = async () => {
    setIsAuditing(true);
    await triggerAudit();
    setIsAuditing(false);
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (!cashFlow) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Sistema de controle de caixa não inicializado. Contate o administrador.
        </AlertDescription>
      </Alert>
    );
  }

  const profitMargin = cashFlow.totalInflow > 0 ? 
    ((cashFlow.netProfit / cashFlow.totalInflow) * 100) : 0;

  const alertLevelColor = {
    normal: 'bg-green-500',
    warning: 'bg-yellow-500',
    critical: 'bg-orange-500',
    emergency: 'bg-red-500'
  }[cashFlow.alertLevel] || 'bg-gray-500';

  const criticalAlerts = auditAlerts.filter(alert => alert.alert_level === 'critical');
  const emergencyAlerts = auditAlerts.filter(alert => alert.alert_level === 'emergency');

  return (
    <div className="space-y-6">
      {/* Status de Emergência */}
      {cashFlow.emergencyStop && (
        <Alert variant="destructive" className="border-red-500 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-medium">
            🚨 MODO DE EMERGÊNCIA ATIVADO - Sistema financeiro parado por inconsistências críticas!
          </AlertDescription>
        </Alert>
      )}

      {/* Alertas Críticos */}
      {(criticalAlerts.length > 0 || emergencyAlerts.length > 0) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {emergencyAlerts.length > 0 && `🔥 ${emergencyAlerts.length} alertas de emergência`}
            {criticalAlerts.length > 0 && ` ⚠️ ${criticalAlerts.length} alertas críticos`}
            {' '}- Verificação imediata necessária!
          </AlertDescription>
        </Alert>
      )}

      {/* Métricas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo do Sistema</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrencyBR(cashFlow.systemBalance)}
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <div className={cn("w-2 h-2 rounded-full", alertLevelColor)} />
              <span className="text-xs text-muted-foreground capitalize">
                {cashFlow.alertLevel}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entradas Totais</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrencyBR(cashFlow.totalInflow)}
            </div>
            <p className="text-xs text-muted-foreground">
              Depósitos reais confirmados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saídas Totais</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrencyBR(cashFlow.totalOutflow)}
            </div>
            <p className="text-xs text-muted-foreground">
              Resgates + Prêmios dados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              cashFlow.netProfit >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {formatCurrencyBR(cashFlow.netProfit)}
            </div>
            <div className="flex items-center space-x-2">
              <Progress 
                value={Math.min(Math.abs(profitMargin), 100)} 
                className="flex-1 h-2"
              />
              <span className="text-xs font-medium">
                {profitMargin.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles de Administração */}
      <div className="flex space-x-4">
        <Button 
          onClick={handleAudit} 
          disabled={isAuditing}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <RefreshCw className={cn("h-4 w-4", isAuditing && "animate-spin")} />
          <span>{isAuditing ? 'Auditando...' : 'Executar Auditoria'}</span>
        </Button>

        <Button 
          onClick={refreshData}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <Eye className="h-4 w-4" />
          <span>Atualizar Dados</span>
        </Button>
      </div>

      {/* Tabs Detalhadas */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="alerts">
            Alertas {auditAlerts.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {auditAlerts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Fluxo de Caixa</CardTitle>
                <CardDescription>
                  Movimento financeiro do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Entradas</span>
                  <span className="font-medium text-green-600">
                    +{formatCurrencyBR(cashFlow.totalInflow)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Saídas</span>
                  <span className="font-medium text-red-600">
                    -{formatCurrencyBR(cashFlow.totalOutflow)}
                  </span>
                </div>
                <hr />
                <div className="flex justify-between items-center font-bold">
                  <span>Resultado</span>
                  <span className={cn(
                    cashFlow.netProfit >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {cashFlow.netProfit >= 0 ? '+' : ''}{formatCurrencyBR(cashFlow.netProfit)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status do Sistema</CardTitle>
                <CardDescription>
                  Indicadores de saúde financeira
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Nível de Alerta</span>
                  <Badge 
                    variant={cashFlow.alertLevel === 'normal' ? 'default' : 'destructive'}
                    className="capitalize"
                  >
                    {cashFlow.alertLevel}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Modo Emergência</span>
                  <Badge variant={cashFlow.emergencyStop ? 'destructive' : 'default'}>
                    {cashFlow.emergencyStop ? 'ATIVADO' : 'Normal'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Margem de Lucro</span>
                  <span className="font-medium">
                    {profitMargin.toFixed(2)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          {auditAlerts.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-green-600" />
                  <p>Nenhum alerta ativo. Sistema funcionando normalmente.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {auditAlerts.map((alert) => (
                <Alert 
                  key={alert.id}
                  variant={alert.alert_level === 'emergency' ? 'destructive' : 'default'}
                >
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <strong>{alert.description}</strong>
                        <Badge variant={
                          alert.alert_level === 'emergency' ? 'destructive' : 
                          alert.alert_level === 'critical' ? 'destructive' : 
                          'secondary'
                        }>
                          {alert.alert_level}
                        </Badge>
                      </div>
                      {alert.amount && (
                        <p className="text-sm">
                          Valor: {formatCurrencyBR(alert.amount)}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(alert.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Medidas de Segurança</CardTitle>
              <CardDescription>
                Controles automáticos do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-medium">Auditoria Automática</h4>
                  <p className="text-sm text-muted-foreground">
                    Verificação contínua de consistência financeira
                  </p>
                  <Badge variant="default">Ativo</Badge>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Triggers em Tempo Real</h4>
                  <p className="text-sm text-muted-foreground">
                    Atualizações automáticas do controle de caixa
                  </p>
                  <Badge variant="default">Ativo</Badge>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Alertas Críticos</h4>
                  <p className="text-sm text-muted-foreground">
                    Notificações para inconsistências &gt; R$ 100
                  </p>
                  <Badge variant="default">Ativo</Badge>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Parada de Emergência</h4>
                  <p className="text-sm text-muted-foreground">
                    Proteção automática para discrepâncias &gt; R$ 1.000
                  </p>
                  <Badge variant={cashFlow.emergencyStop ? 'destructive' : 'default'}>
                    {cashFlow.emergencyStop ? 'ATIVADO' : 'Standby'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};