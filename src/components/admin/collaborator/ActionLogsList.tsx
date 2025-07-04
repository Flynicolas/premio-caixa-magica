
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AdminActionLog } from '@/types/database';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ActionLogsListProps {
  logs: AdminActionLog[];
}

const ActionLogsList: React.FC<ActionLogsListProps> = ({ logs }) => {
  const getActionBadgeColor = (actionType: string) => {
    switch (actionType) {
      case 'INVITE_SENT':
        return 'bg-blue-100 text-blue-800';
      case 'ROLE_CHANGED':
        return 'bg-yellow-100 text-yellow-800';
      case 'USER_ACTIVATED':
        return 'bg-green-100 text-green-800';
      case 'USER_DEACTIVATED':
        return 'bg-red-100 text-red-800';
      case 'ITEM_CREATED':
      case 'ITEM_UPDATED':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionLabel = (actionType: string) => {
    const actionLabels: { [key: string]: string } = {
      'INVITE_SENT': 'Convite Enviado',
      'ROLE_CHANGED': 'Role Alterado',
      'USER_ACTIVATED': 'Usuário Ativado',
      'USER_DEACTIVATED': 'Usuário Desativado',
      'ITEM_CREATED': 'Item Criado',
      'ITEM_UPDATED': 'Item Atualizado',
      'ITEM_DELETED': 'Item Removido',
      'CHEST_UPDATED': 'Baú Atualizado'
    };
    return actionLabels[actionType] || actionType;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logs de Ações Administrativas</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Tabela Afetada</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                </TableCell>
                <TableCell>
                  <Badge className={getActionBadgeColor(log.action_type)}>
                    {getActionLabel(log.action_type)}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-md">
                  {log.description}
                </TableCell>
                <TableCell>
                  {log.affected_table && (
                    <Badge variant="outline">
                      {log.affected_table}
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {logs.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum log encontrado.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActionLogsList;
