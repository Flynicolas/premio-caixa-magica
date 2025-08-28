import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { DollarSign, Search, CheckCircle, XCircle, Clock, Users, Calendar } from 'lucide-react';
import { useAffiliateAdmin } from '@/hooks/useAffiliateAdmin';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

export const CommissionsManagement = () => {
  const { commissions, approveCommissions, loading } = useAffiliateAdmin();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCommissions, setSelectedCommissions] = useState<Set<number>>(new Set());
  const [processing, setProcessing] = useState(false);

  const handleBulkApprove = async () => {
    if (selectedCommissions.size === 0) return;
    
    setProcessing(true);
    try {
      await approveCommissions(Array.from(selectedCommissions));
      toast({
        title: "Comissões aprovadas",
        description: `${selectedCommissions.size} comissão(ões) aprovada(s) com sucesso.`,
      });
      setSelectedCommissions(new Set());
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao aprovar comissões.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedCommissions.size === 0) return;
    
    setProcessing(true);
    try {
      // TODO: Implementar rejeição de comissões
      toast({
        title: "Função em desenvolvimento",
        description: "A rejeição de comissões será implementada em breve.",
        variant: "default"
      });
      setSelectedCommissions(new Set());
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao rejeitar comissões.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const pendingIds = filteredCommissions
        .filter(c => c.status === 'accrued')
        .map(c => c.id);
      setSelectedCommissions(new Set(pendingIds));
    } else {
      setSelectedCommissions(new Set());
    }
  };

  const handleSelectCommission = (commissionId: number, checked: boolean) => {
    const newSelection = new Set(selectedCommissions);
    if (checked) {
      newSelection.add(commissionId);
    } else {
      newSelection.delete(commissionId);
    }
    setSelectedCommissions(newSelection);
  };

  const filteredCommissions = commissions?.filter(commission => {
    const matchesSearch = !searchTerm || 
      commission.affiliate_ref_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commission.affiliate_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || commission.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accrued':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Aprovado</Badge>;
      case 'paid':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200"><DollarSign className="w-3 h-3 mr-1" />Pago</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200"><XCircle className="w-3 h-3 mr-1" />Rejeitado</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  const getKindBadge = (kind: string) => {
    switch (kind) {
      case 'revshare':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Revshare</Badge>;
      case 'cpa':
        return <Badge variant="outline" className="text-green-600 border-green-600">CPA</Badge>;
      case 'ngr':
        return <Badge variant="outline" className="text-purple-600 border-purple-600">NGR</Badge>;
      default:
        return <Badge variant="outline">{kind}</Badge>;
    }
  };

  const pendingCommissions = filteredCommissions.filter(c => c.status === 'accrued');
  const totalPendingAmount = pendingCommissions.reduce((sum, c) => sum + c.amount_cents, 0);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">Pendentes</p>
                <p className="text-xl font-bold">{pendingCommissions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">Valor Pendente</p>
                <p className="text-xl font-bold">R$ {(totalPendingAmount / 100).toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Selecionadas</p>
                <p className="text-xl font-bold">{selectedCommissions.size}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Este Mês</p>
                <p className="text-xl font-bold">
                  {filteredCommissions.filter(c => {
                    const createdDate = new Date(c.created_at);
                    const now = new Date();
                    return createdDate.getMonth() === now.getMonth() && 
                           createdDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      {selectedCommissions.size > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{selectedCommissions.size} comissão(ões) selecionada(s)</p>
                <p className="text-sm text-muted-foreground">
                  Total: R$ {(pendingCommissions
                    .filter(c => selectedCommissions.has(c.id))
                    .reduce((sum, c) => sum + c.amount_cents, 0) / 100).toFixed(2)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleBulkApprove}
                  disabled={processing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Aprovar Selecionadas
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleBulkReject}
                  disabled={processing}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Rejeitar Selecionadas
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros e Tabela */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Comissões de Afiliados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por código ou email do afiliado..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="accrued">Pendentes</SelectItem>
                <SelectItem value="approved">Aprovados</SelectItem>
                <SelectItem value="paid">Pagos</SelectItem>
                <SelectItem value="rejected">Rejeitados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabela */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedCommissions.size > 0 && 
                               selectedCommissions.size === pendingCommissions.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Afiliado</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Nível</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                    </TableRow>
                  ))
                ) : filteredCommissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <DollarSign className="w-8 h-8 text-gray-400" />
                        <p className="text-muted-foreground">Nenhuma comissão encontrada</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCommissions.map((commission) => (
                    <TableRow key={commission.id}>
                      <TableCell>
                        {commission.status === 'accrued' && (
                          <Checkbox
                            checked={selectedCommissions.has(commission.id)}
                            onCheckedChange={(checked) => 
                              handleSelectCommission(commission.id, checked as boolean)
                            }
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {commission.affiliate_name || 'Nome não disponível'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {commission.affiliate_ref_code}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getKindBadge(commission.kind)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Nível {commission.level}</Badge>
                      </TableCell>
                      <TableCell className="font-mono">
                        R$ {(commission.amount_cents / 100).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(commission.period_start).toLocaleDateString('pt-BR')} - {' '}
                        {new Date(commission.period_end).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(commission.status)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDistanceToNow(new Date(commission.created_at), { 
                          addSuffix: true,
                          locale: ptBR 
                        })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};