import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * 🔍 PAINEL DE RECONCILIAÇÃO FINANCEIRA
 * Detecta e resolve discrepâncias no sistema
 */

interface ReconciliationItem {
  id: string;
  description: string;
  expected_value: number;
  actual_value: number;
  discrepancy: number;
  severity: string;
  created_at: string;
  resolved: boolean;
}

const formatCurrencyBR = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const FinancialReconciliation = () => {
  const { toast } = useToast();
  const [reconciliationItems, setReconciliationItems] = useState<ReconciliationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRunningAudit, setIsRunningAudit] = useState(false);

  const fetchReconciliationData = async () => {
    try {
      const { data, error } = await supabase
        .from('financial_audit_log')
        .select('*')
        .eq('audit_type', 'balance_check')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setReconciliationItems(data || []);
    } catch (error) {
      console.error('Erro ao carregar dados de reconciliação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados de reconciliação.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const runCompleteAudit = async () => {
    setIsRunningAudit(true);
    
    try {
      console.log('🔍 Executando auditoria completa...');

      // Executar função de auditoria
      const { error } = await supabase.rpc('audit_financial_consistency');
      
      if (error) throw error;

      toast({
        title: "Auditoria Concluída",
        description: "Verificação completa de consistência executada com sucesso.",
        variant: "default"
      });

      // Recarregar dados
      await fetchReconciliationData();
    } catch (error) {
      console.error('Erro na auditoria:', error);
      toast({
        title: "Erro na Auditoria",
        description: "Não foi possível executar a auditoria completa.",
        variant: "destructive"
      });
    } finally {
      setIsRunningAudit(false);
    }
  };

  const markAsResolved = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('financial_audit_log')
        .update({ 
          resolved: true, 
          resolved_at: new Date().toISOString() 
        })
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: "Item Resolvido",
        description: "Discrepância marcada como resolvida.",
        variant: "default"
      });

      await fetchReconciliationData();
    } catch (error) {
      console.error('Erro ao marcar como resolvido:', error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar item como resolvido.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchReconciliationData();
  }, []);

  const unresolvedItems = reconciliationItems.filter(item => !item.resolved);
  const criticalItems = unresolvedItems.filter(item => item.severity === 'critical');
  const highPriorityItems = unresolvedItems.filter(item => item.severity === 'high');

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      low: 'default',
      medium: 'secondary',
      high: 'destructive',
      critical: 'destructive'
    };
    
    return (
      <Badge variant={variants[severity] || 'default'}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Itens Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {unresolvedItems.length}
            </div>
            <p className="text-sm text-muted-foreground">
              Discrepâncias não resolvidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Críticos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {criticalItems.length}
            </div>
            <p className="text-sm text-muted-foreground">
              Requerem atenção imediata
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Alta Prioridade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {highPriorityItems.length}
            </div>
            <p className="text-sm text-muted-foreground">
              Discrepâncias importantes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {criticalItems.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Atenção:</strong> {criticalItems.length} item(ns) crítico(s) detectado(s). 
            Verifique imediatamente para evitar problemas financeiros.
          </AlertDescription>
        </Alert>
      )}

      {/* Controles */}
      <div className="flex space-x-4">
        <Button 
          onClick={runCompleteAudit}
          disabled={isRunningAudit}
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRunningAudit ? 'animate-spin' : ''}`} />
          <span>{isRunningAudit ? 'Executando...' : 'Executar Auditoria Completa'}</span>
        </Button>

        <Button 
          onClick={fetchReconciliationData}
          variant="outline"
        >
          Atualizar Dados
        </Button>
      </div>

      {/* Tabela de Discrepâncias */}
      <Card>
        <CardHeader>
          <CardTitle>Discrepâncias Detectadas</CardTitle>
          <CardDescription>
            Histórico de inconsistências financeiras encontradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reconciliationItems.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhuma discrepância encontrada. Sistema em perfeita ordem!
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor Esperado</TableHead>
                  <TableHead>Valor Real</TableHead>
                  <TableHead>Discrepância</TableHead>
                  <TableHead>Severidade</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reconciliationItems.map((item) => (
                  <TableRow key={item.id} className={item.resolved ? 'opacity-50' : ''}>
                    <TableCell>
                      {item.resolved ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="text-sm">
                        {item.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatCurrencyBR(item.expected_value || 0)}
                    </TableCell>
                    <TableCell>
                      {formatCurrencyBR(item.actual_value || 0)}
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${
                        (item.discrepancy || 0) > 100 ? 'text-red-600' : 
                        (item.discrepancy || 0) > 10 ? 'text-orange-600' : 
                        'text-green-600'
                      }`}>
                        {formatCurrencyBR(item.discrepancy || 0)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {getSeverityBadge(item.severity)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(item.created_at).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(item.created_at).toLocaleTimeString('pt-BR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      {!item.resolved && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => markAsResolved(item.id)}
                        >
                          Marcar Resolvido
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};