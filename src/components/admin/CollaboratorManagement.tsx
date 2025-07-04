
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Users, Mail, Activity } from 'lucide-react';
import { useCollaborators } from '@/hooks/useCollaborators';
import CollaboratorList from './collaborator/CollaboratorList';
import InviteModal from './collaborator/InviteModal';
import PendingInvitesList from './collaborator/PendingInvitesList';
import ActionLogsList from './collaborator/ActionLogsList';

const CollaboratorManagement = () => {
  const {
    adminUsers,
    pendingInvites,
    actionLogs,
    loading,
    sendInvite,
    updateAdminRole,
    toggleAdminStatus,
    refreshData
  } = useCollaborators();

  const [showInviteModal, setShowInviteModal] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gerenciamento de Colaboradores</h2>
          <p className="text-muted-foreground">
            Gerencie usuários administrativos, convites e permissões
          </p>
        </div>
        <Button onClick={() => setShowInviteModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Convidar Colaborador
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Colaboradores Ativos
              </p>
              <p className="text-2xl font-bold">
                {adminUsers.filter(user => user.is_active).length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Mail className="w-8 h-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Convites Pendentes
              </p>
              <p className="text-2xl font-bold">{pendingInvites.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Activity className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Ações Hoje
              </p>
              <p className="text-2xl font-bold">
                {actionLogs.filter(log => {
                  const today = new Date().toDateString();
                  const logDate = new Date(log.created_at).toDateString();
                  return today === logDate;
                }).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="collaborators" className="space-y-4">
        <TabsList>
          <TabsTrigger value="collaborators">Colaboradores</TabsTrigger>
          <TabsTrigger value="invites">Convites Pendentes</TabsTrigger>
          <TabsTrigger value="logs">Logs de Ações</TabsTrigger>
        </TabsList>

        <TabsContent value="collaborators">
          <CollaboratorList
            users={adminUsers}
            onUpdateRole={updateAdminRole}
            onToggleStatus={toggleAdminStatus}
          />
        </TabsContent>

        <TabsContent value="invites">
          <PendingInvitesList invites={pendingInvites} onRefresh={refreshData} />
        </TabsContent>

        <TabsContent value="logs">
          <ActionLogsList logs={actionLogs} />
        </TabsContent>
      </Tabs>

      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSendInvite={sendInvite}
      />
    </div>
  );
};

export default CollaboratorManagement;
