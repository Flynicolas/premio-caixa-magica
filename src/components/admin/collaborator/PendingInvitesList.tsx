
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CollaboratorInvite } from '@/types/database';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PendingInvitesListProps {
  invites: CollaboratorInvite[];
  onRefresh: () => void;
}

const PendingInvitesList: React.FC<PendingInvitesListProps> = ({
  invites,
  onRefresh
}) => {
  const { toast } = useToast();

  const copyInviteLink = (token: string) => {
    const inviteUrl = `${window.location.origin}/accept-invite?token=${token}`;
    navigator.clipboard.writeText(inviteUrl);
    toast({
      title: "Link copiado!",
      description: "Link do convite foi copiado para a área de transferência",
      variant: "default"
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'collaborator':
        return 'bg-blue-100 text-blue-800';
      case 'viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'collaborator':
        return 'Colaborador';
      case 'viewer':
        return 'Visualizador';
      default:
        return role;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Convites Pendentes</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Data do Convite</TableHead>
              <TableHead>Expira em</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invites.map((invite) => (
              <TableRow key={invite.id}>
                <TableCell className="font-medium">{invite.email}</TableCell>
                <TableCell>
                  <Badge className={getRoleBadgeColor(invite.role)}>
                    {getRoleLabel(invite.role)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(invite.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </TableCell>
                <TableCell>
                  {format(new Date(invite.expires_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyInviteLink(invite.token)}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copiar Link
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {invites.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum convite pendente.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingInvitesList;
