import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, CheckCircle, Clock, User, Globe, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ErrorLog {
  id: string;
  error_type: string;
  error_message: string;
  error_stack?: string;
  user_id?: string;
  user_agent?: string;
  url?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
}

export const AdminErrorDashboard = () => {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  const fetchErrors = async () => {
    try {
      let query = supabase
        .from('admin_error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (severityFilter !== 'all') {
        query = query.eq('severity', severityFilter);
      }

      if (statusFilter !== 'all') {
        query = query.eq('resolved', statusFilter === 'resolved');
      }

      const { data, error } = await query;

      if (error) throw error;
      setErrors((data || []).map(item => ({
        ...item,
        severity: item.severity as 'low' | 'medium' | 'high' | 'critical',
        metadata: item.metadata as Record<string, any> | undefined,
        error_stack: item.error_stack || undefined,
        user_id: item.user_id || undefined,
        user_agent: item.user_agent || undefined,
        url: item.url || undefined,
        resolved_at: item.resolved_at || undefined,
        resolved_by: item.resolved_by || undefined
      })));
    } catch (error: any) {
      console.error('Error fetching error logs:', error);
      toast({
        title: "Erro ao carregar logs",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsResolved = async (errorId: string) => {
    try {
      const { error } = await supabase
        .from('admin_error_logs')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', errorId);

      if (error) throw error;

      toast({
        title: "Erro marcado como resolvido",
        variant: "default"
      });

      fetchErrors();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchErrors();
  }, [severityFilter, statusFilter]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getErrorStats = () => {
    const stats = {
      total: errors.length,
      critical: errors.filter(e => e.severity === 'critical' && !e.resolved).length,
      high: errors.filter(e => e.severity === 'high' && !e.resolved).length,
      resolved: errors.filter(e => e.resolved).length,
    };
    return stats;
  };

  const stats = getErrorStats();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-8 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">Críticos</p>
                <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Altos</p>
                <p className="text-2xl font-bold text-orange-600">{stats.high}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Resolvidos</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4" />
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Severidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="critical">Crítica</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="low">Baixa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="unresolved">Não resolvidos</SelectItem>
            <SelectItem value="resolved">Resolvidos</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={fetchErrors} variant="outline" size="sm">
          Atualizar
        </Button>
      </div>

      {/* Error List */}
      <div className="space-y-3">
        {errors.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum erro encontrado</h3>
              <p className="text-muted-foreground">
                {severityFilter !== 'all' || statusFilter !== 'all' 
                  ? 'Tente ajustar os filtros.'
                  : 'Sistema funcionando normalmente!'}
              </p>
            </CardContent>
          </Card>
        ) : (
          errors.map((error) => (
            <Card key={error.id} className={`border-l-4 ${error.resolved ? 'border-l-green-500' : getSeverityColor(error.severity)}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-base font-medium">
                        {error.error_type.replace(/_/g, ' ').toUpperCase()}
                      </CardTitle>
                      <Badge 
                        className={`${getSeverityColor(error.severity)} text-white`}
                      >
                        {error.severity}
                      </Badge>
                      {error.resolved && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Resolvido
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(error.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  
                  {!error.resolved && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markAsResolved(error.id)}
                    >
                      Marcar como resolvido
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-red-600">
                    {error.error_message}
                  </p>

                  {error.error_stack && (
                    <details className="bg-muted p-3 rounded-lg">
                      <summary className="cursor-pointer text-sm font-medium">
                        Stack Trace
                      </summary>
                      <pre className="text-xs mt-2 whitespace-pre-wrap">
                        {error.error_stack}
                      </pre>
                    </details>
                  )}

                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    {error.user_id && (
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>Usuário: {error.user_id}</span>
                      </div>
                    )}
                    
                    {error.url && (
                      <div className="flex items-center space-x-1">
                        <Globe className="h-3 w-3" />
                        <span>URL: {error.url}</span>
                      </div>
                    )}
                  </div>

                  {error.metadata && Object.keys(error.metadata).length > 0 && (
                    <details className="bg-secondary/50 p-3 rounded-lg">
                      <summary className="cursor-pointer text-sm font-medium">
                        Metadados
                      </summary>
                      <pre className="text-xs mt-2 whitespace-pre-wrap">
                        {JSON.stringify(error.metadata, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};