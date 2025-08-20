import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Download, Filter, Eye, Calendar } from 'lucide-react';
import { useAdvancedScratchCard } from '@/hooks/useAdvancedScratchCard';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const ScratchCardEventLogs: React.FC = () => {
  const { eventLogs } = useAdvancedScratchCard();
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const eventTypes = [
    { value: 'all', label: 'Todos os Eventos' },
    { value: 'SCRATCH_PLAY', label: 'Jogos de Raspadinha' },
    { value: 'SCRATCH_TEST', label: 'Simulações' },
    { value: 'SCRATCH_CONFIG_UPDATED', label: 'Config. Atualizadas' },
    { value: 'SCRATCH_PRESET_APPLIED', label: 'Presets Aplicados' },
    { value: 'BANK_CONTROL_UPDATED', label: 'Controle da Banca' },
    { value: 'PAYOUT', label: 'Pagamentos' },
    { value: 'MANUAL_RELEASE', label: 'Liberações Manuais' }
  ];

  const filteredLogs = eventLogs.filter(log => {
    const typeMatch = filterType === 'all' || log.event_type === filterType;
    const searchMatch = searchTerm === '' || 
      log.event_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase());
    
    return typeMatch && searchMatch;
  });

  const getEventBadgeVariant = (eventType: string): "default" | "destructive" | "outline" | "secondary" => {
    const variants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      'SCRATCH_PLAY': 'default',
      'SCRATCH_TEST': 'secondary',
      'SCRATCH_CONFIG_UPDATED': 'outline',
      'SCRATCH_PRESET_APPLIED': 'default',
      'BANK_CONTROL_UPDATED': 'destructive',
      'PAYOUT': 'default',
      'MANUAL_RELEASE': 'secondary'
    };
    return variants[eventType] || 'outline';
  };

  const formatEventType = (eventType: string) => {
    const names = {
      'SCRATCH_PLAY': 'Jogo',
      'SCRATCH_TEST': 'Simulação',
      'SCRATCH_CONFIG_UPDATED': 'Config. Atualizada',
      'SCRATCH_PRESET_APPLIED': 'Preset Aplicado',
      'BANK_CONTROL_UPDATED': 'Controle da Banca',
      'PAYOUT': 'Pagamento',
      'MANUAL_RELEASE': 'Liberação Manual'
    };
    return names[eventType as keyof typeof names] || eventType;
  };

  const exportLogs = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Data,Evento,Admin,Usuario,Detalhes\n"
      + filteredLogs.map(log => [
          format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR }),
          log.event_type,
          log.admin_id || '',
          log.user_id || '',
          JSON.stringify(log.details).replace(/"/g, '""')
        ].join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `logs-raspadinha-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Logs de Eventos & Auditoria
            </CardTitle>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={exportLogs}>
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Buscar nos logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Estatísticas Rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-muted rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold">{filteredLogs.length}</p>
              <p className="text-sm text-muted-foreground">Total de Eventos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {filteredLogs.filter(l => l.event_type === 'SCRATCH_PLAY').length}
              </p>
              <p className="text-sm text-muted-foreground">Jogos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {filteredLogs.filter(l => l.event_type === 'SCRATCH_TEST').length}
              </p>
              <p className="text-sm text-muted-foreground">Simulações</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {filteredLogs.filter(l => l.admin_id).length}
              </p>
              <p className="text-sm text-muted-foreground">Ações Admin</p>
            </div>
          </div>

          {/* Tabela de Logs */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Evento</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Detalhes</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-mono">
                          {format(new Date(log.created_at), 'dd/MM HH:mm:ss', { locale: ptBR })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getEventBadgeVariant(log.event_type)}>
                        {formatEventType(log.event_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {log.admin_id ? (
                        <Badge variant="outline" className="text-xs">
                          Admin
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {log.user_id ? (
                        <span className="text-xs font-mono">
                          {log.user_id.substring(0, 8)}...
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-48 truncate text-sm">
                        {Object.keys(log.details).length > 0 
                          ? JSON.stringify(log.details).substring(0, 50) + '...'
                          : 'Sem detalhes'
                        }
                      </div>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Detalhes do Evento</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium">Tipo de Evento</p>
                                <Badge variant={getEventBadgeVariant(log.event_type)}>
                                  {formatEventType(log.event_type)}
                                </Badge>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Data/Hora</p>
                                <p className="text-sm">
                                  {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                                </p>
                              </div>
                            </div>
                            
                            {log.admin_id && (
                              <div>
                                <p className="text-sm font-medium">ID do Admin</p>
                                <p className="text-sm font-mono">{log.admin_id}</p>
                              </div>
                            )}
                            
                            {log.user_id && (
                              <div>
                                <p className="text-sm font-medium">ID do Usuário</p>
                                <p className="text-sm font-mono">{log.user_id}</p>
                              </div>
                            )}
                            
                            <div>
                              <p className="text-sm font-medium">Detalhes (JSON)</p>
                              <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-64">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum evento encontrado com os filtros aplicados.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};