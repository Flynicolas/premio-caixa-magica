
import { supabase } from '@/integrations/supabase/client';
import { CollaboratorInvite, AdminUser, AdminActionLog } from '@/types/database';

export const collaboratorService = {
  // Buscar todos os usuários administrativos
  async fetchAdminUsers(): Promise<AdminUser[]> {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Buscar convites pendentes
  async fetchPendingInvites(): Promise<CollaboratorInvite[]> {
    const { data, error } = await supabase
      .from('collaborator_invites')
      .select('*')
      .eq('is_used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Enviar convite para colaborador
  async sendInvite(email: string, role: string): Promise<void> {
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expira em 7 dias

    const { error } = await supabase
      .from('collaborator_invites')
      .insert([{
        email,
        role,
        token,
        expires_at: expiresAt.toISOString(),
        invited_by: (await supabase.auth.getUser()).data.user?.id
      }]);

    if (error) throw error;

    // Log da ação
    await this.logAction('INVITE_SENT', `Convite enviado para ${email} com role ${role}`, {
      email,
      role
    });
  },

  // Atualizar role de um usuário admin
  async updateAdminRole(userId: string, newRole: string): Promise<void> {
    const { error } = await supabase
      .from('admin_users')
      .update({ role: newRole })
      .eq('user_id', userId);

    if (error) throw error;

    await this.logAction('ROLE_CHANGED', `Role alterado para ${newRole}`, {
      user_id: userId,
      new_role: newRole
    });
  },

  // Ativar/desativar usuário admin
  async toggleAdminStatus(userId: string, isActive: boolean): Promise<void> {
    const { error } = await supabase
      .from('admin_users')
      .update({ is_active: isActive })
      .eq('user_id', userId);

    if (error) throw error;

    await this.logAction(
      isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      `Usuário ${isActive ? 'ativado' : 'desativado'}`,
      { user_id: userId }
    );
  },

  // Buscar logs de ações
  async fetchActionLogs(): Promise<AdminActionLog[]> {
    const { data, error } = await supabase
      .from('admin_action_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return data || [];
  },

  // Registrar ação administrativa
  async logAction(actionType: string, description: string, metadata: any = {}): Promise<void> {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    const { error } = await supabase.rpc('log_admin_action', {
      p_admin_user_id: user.id,
      p_action_type: actionType,
      p_description: description,
      p_metadata: metadata
    });

    if (error) console.error('Erro ao registrar log:', error);
  },

  // Limpar convites expirados
  async cleanupExpiredInvites(): Promise<void> {
    const { error } = await supabase.rpc('cleanup_expired_invites');
    if (error) console.error('Erro ao limpar convites expirados:', error);
  }
};
