import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, Package, ExternalLink, Calendar, Search, Filter, MapPin, User, Barcode, CreditCard, DollarSign } from 'lucide-react';
import { useWithdrawItem } from '@/hooks/useWithdrawItem';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

const MinhasEntregas = () => {
  const { user } = useAuth();
  const { entregas, loading, fetchEntregas } = useWithdrawItem();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (user) fetchEntregas();
  }, [user]);

  const getStatusBadgeLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'shipped': return 'A Caminho';
      case 'delivered': return 'Entregue';
      case 'paid': return 'Pago';
      default: return status;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'shipped': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'delivered': return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'paid': return 'bg-purple-500/20 text-purple-500 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
    }
  };

  const handleTrackOrder = (codigoRastreio: string) => {
    const url = `https://www.sitecorreios.com.br/rastreamento?cod=${codigoRastreio}`;
    window.open(url, '_blank');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const filteredEntregas = entregas.filter((entrega) => {
    const itemName = entrega.item?.name?.toLowerCase() || '';
    const status = entrega.payments?.[0]?.status === 'paid' ? entrega.delivery_status : entrega.payments?.[0]?.status;
    const matchesSearch = itemName.includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-primary flex items-center justify-center gap-2">
            <Truck className="h-8 w-8" /> Minhas Entregas
          </h1>
          <p className="text-muted-foreground">Acompanhe o status dos seus prêmios físicos</p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex w-full md:w-1/2 items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input placeholder="Buscar item..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full" />
          </div>
          <div className="flex items-center gap-2 w-full md:w-1/3">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
                <SelectItem value="shipped">A Caminho</SelectItem>
                <SelectItem value="delivered">Entregue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground">Carregando entregas...</p>
        ) : filteredEntregas.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-20 w-20 mx-auto mb-6 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Nenhuma entrega encontrada</h3>
              <p className="text-muted-foreground">
                Não há prêmios com esses filtros.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEntregas.map((entrega) => {
              const paymentStatus = entrega.payments?.[0]?.status;
              const isPaid = paymentStatus === 'paid';
              const status = isPaid ? entrega.delivery_status : paymentStatus;
              const label = getStatusBadgeLabel(status);
              const color = getStatusBadgeColor(status);

              return (
                <Card key={entrega.id} className="border-border h-full flex flex-col justify-between">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3 text-base">
                       {entrega.item ? (
                          <>
                            <img
                              src={entrega.item.image_url}
                              alt={entrega.item.name}
                              className="w-10 h-10 rounded-md object-cover border"
                            />
                            {entrega.item.name}
                          </>
                        ) : (
                          <span className="text-muted-foreground italic">Item indisponível</span>
                        )}

                      </CardTitle>
                      <Badge className={color}>{label}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" /> Pedido em: {formatDate(entrega.created_at)}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CreditCard className="h-4 w-4" /> Status do Pagamento: {paymentStatus || 'Indefinido'}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                     <User className="h-4 w-4" /> Destinatário: {entrega.profile?.full_name}

                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
<Barcode className="h-4 w-4" /> CPF: {entrega.profile?.cpf}
                    </div>
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 mt-0.5" />
            <span>
  {entrega.profile?.street}, {entrega.profile?.number}<br />
  {entrega.profile?.neighborhood} - {entrega.profile?.city}/{entrega.profile?.state}<br />
  CEP: {entrega.profile?.zip_code}
</span>
                    </div>
                    {isPaid && entrega.delivery_status === 'shipped' && (
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                        <p className="text-blue-600 text-sm">
                          🚚 Seu item já foi enviado! Clique em "Rastrear Pedido" para acompanhar.
                        </p>
                      </div>
                    )}

                    {entrega.tracking_code && (
                      <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                        <div>
                          <p className="text-sm font-medium">Código de Rastreio</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {entrega.tracking_code}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleTrackOrder(entrega.tracking_code!)}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Rastrear
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MinhasEntregas;
