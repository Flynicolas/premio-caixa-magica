import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, Package, ExternalLink, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Entrega {
  id: string;
  item_nome: string;
  status: string;
  created_at: string;
  codigo_rastreio: string | null;
}

const MinhasEntregas = () => {
  const { user } = useAuth();
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchEntregas();
    }
  }, [user]);

  const fetchEntregas = async () => {
    try {
      const { data, error } = await supabase
        .from('entregas')
        .select('id, item_nome, status, created_at, codigo_rastreio')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntregas(data || []);
    } catch (error) {
      console.error('Erro ao buscar entregas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar suas entregas.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Pendente':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'A Caminho':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'Entregue':
        return 'bg-green-500/20 text-green-500 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
    }
  };

  const handleTrackOrder = (codigoRastreio: string) => {
    const url = `https://www.sitecorreios.com.br/rastreamento?cod=${codigoRastreio}`;
    window.open(url, '_blank');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-bold mb-2">Acesso Restrito</h2>
            <p className="text-muted-foreground">
              Você precisa estar logado para ver suas entregas.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground animate-pulse" />
            <p className="text-muted-foreground">Carregando suas entregas...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 text-primary flex items-center justify-center gap-3">
              <Truck className="h-10 w-10" />
              Minhas Entregas
            </h1>
            <p className="text-lg text-muted-foreground">
              Acompanhe o status dos seus prêmios físicos
            </p>
          </div>

          {entregas.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="h-20 w-20 mx-auto mb-6 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Nenhuma entrega encontrada</h3>
                <p className="text-muted-foreground">
                  Você ainda não possui prêmios físicos para entrega.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {entregas.map((entrega) => (
                <Card key={entrega.id} className="border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3">
                        <Package className="h-5 w-5" />
                        {entrega.item_nome}
                      </CardTitle>
                      <Badge className={getStatusBadgeColor(entrega.status)}>
                        {entrega.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Pedido em: {formatDate(entrega.created_at)}</span>
                      </div>

                      {entrega.status === 'A Caminho' && (
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                          <p className="text-blue-600 font-medium mb-2">
                            🚚 Seu item já foi enviado! Clique em 'Rastrear Pedido' para acompanhar.
                          </p>
                        </div>
                      )}

                      {entrega.codigo_rastreio && (
                        <div className="flex items-center justify-between bg-muted/50 rounded-lg p-4">
                          <div>
                            <p className="text-sm font-medium">Código de Rastreio</p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {entrega.codigo_rastreio}
                            </p>
                          </div>
                          <Button
                            onClick={() => handleTrackOrder(entrega.codigo_rastreio!)}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Rastrear Pedido
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MinhasEntregas;