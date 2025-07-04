
import { useState, useEffect } from 'react';
import { collaboratorService } from '@/services/collaboratorService';
import { AdminUser, CollaboratorInvite, AdminActionLog } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export const useCollaborators = () => {
  const { toast } = useToast();
  
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [pendingInvites, setPendingInvites] = useState<CollaboratorInvite[]>([]);
  const [actionLogs, setActionLogs] = useState<AdminActionLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [users, invites, logs] = await Promise.all([
        collaboratorService.fetchAdminUsers(),
        collaboratorService.fetchPendingInvites(),
        collaboratorService.fetchActionLogs()
      ]);
      
      setAdminUsers(users);
      setPendingInvites(invites);
      setActionLogs(logs);
    } catch (error: any) {
      console.error('Erro ao carregar dados dos colaboradores:', error);
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendInvite = async (email: string, role: string) => {
    try {
      await collaboratorService.sendInvite(email, role);
      toast({
        title: "Convite enviado!",
        description: `Convite enviado para ${email}`,
        variant: "default"
      });
      await fetchData();
    } catch (error: any) {
      toast({
        title: "Erro ao enviar convite",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateAdminRole = async (userId: string, newRole: string) => {
    try {
      await collaboratorService.updateAdminRole(userId, newRole);
      toast({
        title: "Role atualizado!",
        description: "Role do usuário foi alterado com sucesso",
        variant: "default"
      });
      await fetchData();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar role",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const toggleAdminStatus = async (userId: string, isActive: boolean) => {
    try {
      await collaboratorService.toggleAdminStatus(userId, isActive);
      toast({
        title: `Usuário ${isActive ? 'ativado' : 'desativado'}!`,
        description: "Status do usuário foi alterado com sucesso",
        variant: "default"
      });
      await fetchData();
    } catch (error: any) {
      toast({
        title: "Erro ao alterar status",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    adminUsers,
    pendingInvites,
    actionLogs,
    loading,
    sendInvite,
    updateAdminRole,
    toggleAdminStatus,
    refreshData: fetchData
  };
};
