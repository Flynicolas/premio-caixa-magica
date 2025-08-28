import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, CheckCircle, XCircle, Clock, Users, Link2, Calendar, Eye, UserCheck } from 'lucide-react';
import { useAffiliateAdmin } from '@/hooks/useAffiliateAdmin';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

export const AffiliatesList = () => {
  const { affiliates, approveAffiliate, blockAffiliate, loading } = useAffiliateAdmin();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAffiliate, setSelectedAffiliate] = useState<any>(null);

  const handleStatusUpdate = async (affiliateId: string, newStatus: 'approved' | 'blocked') => {
    try {
      if (newStatus === 'approved') {
        await approveAffiliate(affiliateId);
      } else {
        await blockAffiliate(affiliateId);
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const filteredAffiliates = affiliates?.filter(affiliate => {
    const matchesSearch = !searchTerm || 
      affiliate.ref_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      affiliate.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || affiliate.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Aprovado</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      case 'blocked':
        return <Badge className="bg-red-100 text-red-800 border-red-200"><XCircle className="w-3 h-3 mr-1" />Bloqueado</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Lista de Afiliados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por código ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="approved">Aprovados</SelectItem>
              <SelectItem value="blocked">Bloqueados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabela */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Níveis</TableHead>
                <TableHead>Criado</TableHead>
                <TableHead>Ações</TableHead>
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
                  </TableRow>
                ))
              ) : filteredAffiliates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="w-8 h-8 text-gray-400" />
                      <p className="text-muted-foreground">Nenhum afiliado encontrado</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAffiliates.map((affiliate) => (
                  <TableRow key={affiliate.user_id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                          {affiliate.ref_code}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigator.clipboard.writeText(`${window.location.origin}/${affiliate.ref_code}`)}
                        >
                          <Link2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {affiliate.profiles?.email || 'Email não disponível'}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(affiliate.status)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        Upline1: {affiliate.upline1 ? '✓' : '✗'} | 
                        Upline2: {affiliate.upline2 ? '✓' : '✗'} | 
                        Upline3: {affiliate.upline3 ? '✓' : '✗'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDistanceToNow(new Date(affiliate.created_at), { 
                          addSuffix: true,
                          locale: ptBR 
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedAffiliate(affiliate)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Detalhes do Afiliado</DialogTitle>
                            </DialogHeader>
                            {selectedAffiliate && (
                              <AffiliateDetails 
                                affiliate={selectedAffiliate}
                                onStatusUpdate={handleStatusUpdate}
                              />
                            )}
                          </DialogContent>
                        </Dialog>

                        {affiliate.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusUpdate(affiliate.user_id, 'approved')}
                              className="text-green-600 border-green-600 hover:bg-green-50"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusUpdate(affiliate.user_id, 'blocked')}
                              className="text-red-600 border-red-600 hover:bg-red-50"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}

                        {affiliate.status === 'approved' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusUpdate(affiliate.user_id, 'blocked')}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        )}

                        {affiliate.status === 'blocked' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusUpdate(affiliate.user_id, 'approved')}
                            className="text-green-600 border-green-600 hover:bg-green-50"
                          >
                            <UserCheck className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente de detalhes do afiliado
const AffiliateDetails = ({ affiliate, onStatusUpdate }: { 
  affiliate: any, 
  onStatusUpdate: (id: string, status: 'approved' | 'blocked') => void 
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Código de Referência</label>
          <div className="mt-1">
            <code className="bg-gray-100 px-2 py-1 rounded">{affiliate.ref_code}</code>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Status</label>
          <div className="mt-1">
            {affiliate.status === 'approved' && (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />Aprovado
              </Badge>
            )}
            {affiliate.status === 'pending' && (
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                <Clock className="w-3 h-3 mr-1" />Pendente
              </Badge>
            )}
            {affiliate.status === 'blocked' && (
              <Badge className="bg-red-100 text-red-800 border-red-200">
                <XCircle className="w-3 h-3 mr-1" />Bloqueado
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Email do Usuário</label>
          <p className="mt-1 text-sm">{affiliate.user_email || 'Não disponível'}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Data de Criação</label>
          <p className="mt-1 text-sm">
            {formatDistanceToNow(new Date(affiliate.created_at), { 
              addSuffix: true,
              locale: ptBR 
            })}
          </p>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Link de Referência</label>
        <div className="mt-1 flex items-center gap-2">
          <code className="bg-gray-100 px-2 py-1 rounded text-sm flex-1">
            {window.location.origin}/{affiliate.ref_code}
          </code>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigator.clipboard.writeText(`${window.location.origin}/${affiliate.ref_code}`)}
          >
            <Link2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Árvore de Uplines</label>
        <div className="mt-1 text-sm space-y-1">
          <div>Upline 1: {affiliate.upline1 || 'Nenhum'}</div>
          <div>Upline 2: {affiliate.upline2 || 'Nenhum'}</div>
          <div>Upline 3: {affiliate.upline3 || 'Nenhum'}</div>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        {affiliate.status === 'pending' && (
          <>
            <Button
              onClick={() => onStatusUpdate(affiliate.user_id, 'approved')}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Aprovar
            </Button>
            <Button
              variant="destructive"
              onClick={() => onStatusUpdate(affiliate.user_id, 'blocked')}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Bloquear
            </Button>
          </>
        )}

        {affiliate.status === 'approved' && (
          <Button
            variant="destructive"
            onClick={() => onStatusUpdate(affiliate.user_id, 'blocked')}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Bloquear Afiliado
          </Button>
        )}

        {affiliate.status === 'blocked' && (
          <Button
            onClick={() => onStatusUpdate(affiliate.user_id, 'approved')}
            className="bg-green-600 hover:bg-green-700"
          >
            <UserCheck className="w-4 h-4 mr-2" />
            Reativar Afiliado
          </Button>
        )}
      </div>
    </div>
  );
};