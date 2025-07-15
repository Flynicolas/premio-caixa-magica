import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit, Search, ExternalLink, Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Delivery {
  id: string;
  created_at: string;
  tracking_code: string | null;
  delivery_status: string;
  item: {
    name: string;
    image_url: string;
  };
  payments: {
    status: string;
  }[];
  profile: {
    full_name: string;
    cpf: string;
    zip_code: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
}

const DeliveryManagementTab = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    const { data, error } = await supabase
      .from('item_withdrawals')
      .select(`
        id,
        created_at,
        tracking_code,
        delivery_status,
        item:item_id(name, image_url),
        payments:item_withdrawal_payments(status),
        profile:profiles(full_name, cpf, zip_code, street, number, complement, neighborhood, city, state)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Erro', description: 'Erro ao buscar entregas.', variant: 'destructive' });
    } else {
      setDeliveries(data || []);
    }
  };

   const getStatusColor = (status: string) => {
  switch (status) {
    case 'aguardando_envio':
    case 'Pendente':
      return 'bg-yellow-500';
    case 'a_caminho':
    case 'A Caminho':
      return 'bg-blue-500';
    case 'entregue':
    case 'Entregue':
      return 'bg-green-600';
    case 'cancelado':
    case 'Cancelado':
      return 'bg-red-500';
    default:
      return 'bg-gray-400';
  }
};


  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const formatDeliveryStatus = (status: string): string => {
    const map: Record<string, string> = {
    aguardando_envio: 'Aguardando Envio',
    a_caminho: 'A Caminho',
    entregue: 'Entregue',
    cancelado: 'Cancelado',
    pendente: 'Pendente'
  };

  return map[status] || status;
};

  const updateDelivery = async () => {
    if (!editingDelivery) return;
    const { error } = await supabase
      .from('item_withdrawals')
      .update({
        tracking_code: editingDelivery.tracking_code,
        delivery_status: editingDelivery.delivery_status
      })
      .eq('id', editingDelivery.id);

    if (error) {
      toast({ title: 'Erro', description: 'Erro ao salvar alterações.', variant: 'destructive' });
    } else {
      toast({ title: 'Entrega atualizada!', description: 'Informações salvas com sucesso.' });
      fetchDeliveries();
      setIsEditDialogOpen(false);
    }
  };


 const getStatusIcon = (status: string) => {
  switch (status) {
    case 'aguardando_envio':
    case 'Pendente':
      return <Clock className="w-4 h-4" />;
    case 'a_caminho':
    case 'A Caminho':
      return <Truck className="w-4 h-4" />;
    case 'entregue':
    case 'Entregue':
      return <CheckCircle className="w-4 h-4" />;
    case 'cancelado':
    case 'Cancelado':
      return <XCircle className="w-4 h-4" />;
    default:
      return null;
  }
};
  const filtered = deliveries.filter(d => {
    return (
      (statusFilter === 'all' || d.delivery_status === statusFilter) &&
      (
        d.profile.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.tracking_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.profile.cpf.includes(searchTerm)
      )
    );
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Entregas ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <Input
              placeholder="Buscar por nome, item, rastreio ou CPF"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="aguardando_envio">Pendente</SelectItem>
                <SelectItem value="a_caminho">A Caminho</SelectItem>
                <SelectItem value="entregue">Entregue</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead>Rastreio</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(delivery => (
                  <TableRow key={delivery.id}>
                    <TableCell>{delivery.item?.name ?? <span className="italic text-muted-foreground">Indefinido</span>}</TableCell>
                    <TableCell>
                      <div>{delivery.profile.full_name}</div>
                      <div className="text-sm text-muted-foreground">CPF: {delivery.profile.cpf}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={delivery.payments[0]?.status === 'paid' ? 'bg-green-500' : 'bg-yellow-500'}>
                        {delivery.payments[0]?.status === 'paid' ? 'Pago' : 'Pendente'}
                      </Badge>
                    </TableCell>
                    
                    <TableCell><Badge className={`text-white ${getStatusColor(delivery.delivery_status)}`}>
  <div className="flex items-center gap-1">
    {getStatusIcon(delivery.delivery_status)}
    {formatDeliveryStatus(delivery.delivery_status)}
  </div>
</Badge>
</TableCell>
                    <TableCell className="text-sm">
                      {delivery.profile.street}, {delivery.profile.number}<br />
                      {delivery.profile.neighborhood}, {delivery.profile.city}-{delivery.profile.state}<br />
                      CEP: {delivery.profile.zip_code}
                    </TableCell>
                    <TableCell>
                      {delivery.tracking_code ? (
                        <div className="flex gap-1 items-center">
                          <code className="text-sm bg-muted px-2 py-1 rounded">{delivery.tracking_code}</code>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`https://www.sitecorreios.com.br/rastreamento?cod=${delivery.tracking_code}`, '_blank')}
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : 'N/A'}
                    </TableCell>
                    <TableCell>{formatDate(delivery.created_at)}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingDelivery(delivery);
                          setIsEditDialogOpen(true);
                        }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Entrega</DialogTitle></DialogHeader>

          {editingDelivery && (
            <div className="space-y-4">
              <div>
                <Label>Status da Entrega</Label>
                <Select
                  value={editingDelivery.delivery_status}
                  onValueChange={value => setEditingDelivery({ ...editingDelivery, delivery_status: value })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aguardando_envio">Aguardando Envio</SelectItem>
                    <SelectItem value="a_caminho">A Caminho</SelectItem>
                    <SelectItem value="entregue">Entregue</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Código de Rastreio</Label>
                <Input
                  value={editingDelivery.tracking_code || ''}
                  onChange={(e) => setEditingDelivery({ ...editingDelivery, tracking_code: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
                <Button onClick={updateDelivery}>Salvar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeliveryManagementTab;
