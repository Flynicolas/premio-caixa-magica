
// ==============================================
// TIPOS RELACIONADOS À ADMINISTRAÇÃO
// ==============================================

export interface CollaboratorInvite {
  id: string;
  email: string;
  role: string;
  invited_by: string;
  token: string;
  expires_at: string;
  accepted_at: string | null;
  accepted_by: string | null;
  is_used: boolean;
  created_at: string;
}

export interface AdminActionLog {
  id: string;
  admin_user_id: string;
  action_type: string;
  description: string;
  affected_table: string | null;
  affected_record_id: string | null;
  old_data: any;
  new_data: any;
  metadata: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  role: string;
  permissions: any;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
}
