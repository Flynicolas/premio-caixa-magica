
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Package, Truck, CheckCircle, Clock, Edit, Search, Filter, ExternalLink } from 'lucide-react';

interface Delivery {
  id: string;
  user_id: string;
  item_nome: string;
  nome_completo: string;
  email: string;
  telefone: string;
  cpf: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  complemento?: string;
  status: string;
  codigo_rastreio?: string;
  created_at: string;
  updated_at: string;
}

const DeliveryManagementTab = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDeliveries();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [deliveries, searchTerm, statusFilter]);

  const fetchDeliveries = async () => {
    try {
      const { data, error } = await supabase
        .from('entregas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeliveries(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar entregas:', error);
      toast({
        title: "Erro ao carregar entregas",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...deliveries];

    if (searchTerm) {
      filtered = filtered.filter(delivery =>
        delivery.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.item_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.codigo_rastreio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(delivery => delivery.status === statusFilter);
    }

    setFilteredDeliveries(filtered);
  };

  const updateDeliveryStatus = async (deliveryId: string, newStatus: string, trackingCode?: string) => {
    try {
      const updateData: any = { status: newStatus };
      if (trackingCode) {
        updateData.codigo_rastreio = trackingCode;
      }

      const { error } = await supabase
        .from('entregas')
        .update(updateData)
        .eq('id', deliveryId);

      if (error) throw error;

      toast({
        title: "Status atualizado!",
        description: `Entrega atualizada para: ${newStatus}`,
      });

      fetchDeliveries();
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleEditDelivery = (delivery: Delivery) => {
    setEditingDelivery(delivery);
    setIsEditDialogOpen(true);
  };

  const saveDeliveryChanges = async () => {
    if (!editingDelivery) return;

    try {
      const { error } = await supabase
        .from('entregas')
        .update({
          status: editingDelivery.status,
          codigo_rastreio: editingDelivery.codigo_rastreio
        })
        .eq('id', editingDelivery.id);

      if (error) throw error;

      toast({
        title: "Entrega atualizada!",
        description: "As informações foram atualizadas com sucesso",
      });

      setIsEditDialogOpen(false);
      setEditingDelivery(null);
      fetchDeliveries();
    } catch (error: any) {
      console.error('Erro ao salvar alterações:', error);
      toast({
        title: "Erro ao salvar alterações",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pendente': return <Clock className="w-4 h-4" />;
      case 'A Caminho': return <Truck className="w-4 h-4" />;
      case 'Entregue': return <CheckCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendente': return 'bg-yellow-500';
      case 'A Caminho': return 'bg-blue-500';
      case 'Entregue': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
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

  const getDeliveryStats = () => {
    const total = deliveries.length;
    const pending = deliveries.filter(d => d.status === 'Pendente').length;
    const inTransit = deliveries.filter(d => d.status === 'A Caminho').length;
    const delivered = deliveries.filter(d => d.status === 'Entregue').length;

    return { total, pending, inTransit, delivered };
  };

  const stats = getDeliveryStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-3">Carregando entregas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Package className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">A Caminho</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inTransit}</p>
              </div>
              <Truck className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Entregues</p>
                <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Entregas ({filteredDeliveries.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar por nome, item, código de rastreio ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="w-full md:w-48">
              <Label htmlFor="status-filter">Filtrar por Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="A Caminho">A Caminho</SelectItem>
                  <SelectItem value="Entregue">Entregue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabela de Entregas */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data do Pedido</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead>Código de Rastreio</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeliveries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-muted-foreground">
                        {searchTerm || statusFilter !== 'all' 
                          ? 'Nenhuma entrega encontrada com os filtros aplicados.' 
                          : 'Nenhuma entrega encontrada.'
                        }
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDeliveries.map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell className="font-medium">
                        {delivery.item_nome}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{delivery.nome_completo}</div>
                          <div className="text-sm text-muted-foreground">{delivery.email}</div>
                          <div className="text-sm text-muted-foreground">{delivery.telefone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-white ${getStatusColor(delivery.status)}`}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(delivery.status)}
                            {delivery.status}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDate(delivery.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{delivery.rua}, {delivery.numero}</div>
                          <div>{delivery.bairro}</div>
                          <div>{delivery.cidade} - {delivery.estado}</div>
                          <div>CEP: {delivery.cep}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {delivery.codigo_rastreio ? (
                          <div className="flex items-center gap-2">
                            <code className="text-sm bg-muted px-2 py-1 rounded">
                              {delivery.codigo_rastreio}
                            </code>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(`https://www.sitecorreios.com.br/rastreamento?cod=${delivery.codigo_rastreio}`, '_blank')}
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Não informado</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditDelivery(delivery)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Entrega</DialogTitle>
          </DialogHeader>
          
          {editingDelivery && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editingDelivery.status}
                  onValueChange={(value) => 
                    setEditingDelivery({ ...editingDelivery, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="A Caminho">A Caminho</SelectItem>
                    <SelectItem value="Entregue">Entregue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit-tracking">Código de Rastreio</Label>
                <Input
                  id="edit-tracking"
                  value={editingDelivery.codigo_rastreio || ''}
                  onChange={(e) => 
                    setEditingDelivery({ 
                      ...editingDelivery, 
                      codigo_rastreio: e.target.value 
                    })
                  }
                  placeholder="Digite o código de rastreio"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={saveDeliveryChanges}>
                  Salvar Alterações
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeliveryManagementTab;
