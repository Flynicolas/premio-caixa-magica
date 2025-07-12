
// ==============================================
// TIPOS DO BANCO DE DADOS
// ==============================================

export interface DatabaseItem {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  category: string;
  rarity: string; // Changed from union type to string to match Supabase
  base_value: number;
  delivery_type: string; // Changed from union type to string to match Supabase
  delivery_instructions: string | null;
  requires_address: boolean;
  requires_document: boolean;
  is_active: boolean;
  chest_types: string[] | null;
  probability_weight: number | null;
  import_source: string | null;
  tags: string[] | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChestItemProbability {
  id: string;
  chest_type: 'silver' | 'gold' | 'delas' | 'diamond' | 'ruby' | 'premium';
  item_id: string;
  probability_weight: number;
  min_quantity: number;
  max_quantity: number;
  is_active: boolean;
  liberado_manual: boolean;
  sorteado_em: string | null;
  created_at: string;
  item?: DatabaseItem; // Join com a tabela items
}

export interface UserChestInventory {
  id: string;
  user_id: string;
  chest_type: 'silver' | 'gold' | 'delas' | 'diamond' | 'ruby' | 'premium';
  quantity: number;
  acquired_from: string;
  order_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserItemInventory {
  id: string;
  user_id: string;
  item_id: string;
  quantity: number;
  chest_opening_id: string | null;
  is_claimed: boolean;
  claimed_at: string | null;
  created_at: string;
  item?: DatabaseItem; // Join com a tabela items
}

export interface UserAddress {
  id: string;
  user_id: string;
  name: string;
  street: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  phone: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface ItemRedemptionRequest {
  id: string;
  user_id: string;
  user_item_id: string;
  delivery_address_id: string | null;
  additional_info: any;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  tracking_code: string | null;
  admin_notes: string | null;
  requested_at: string;
  processed_at: string | null;
  delivered_at: string | null;
}

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

// ==============================================
// NOVOS TIPOS PARA SISTEMA DE USUÁRIOS
// ==============================================

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  username: string | null;
  bio: string | null;
  level: number;
  experience_points: number;
  total_spent: number;
  total_prizes_won: number;
  chests_opened: number;
  join_date: string;
  last_login: string;
  is_active: boolean;
  is_demo: boolean;
  simulate_actions: boolean;
  preferences: any;
  achievements: any[];
  created_at: string;
  updated_at: string;
}

export interface UserLevel {
  id: string;
  level: number;
  name: string;
  min_experience: number;
  max_experience: number | null;
  benefits: string[];
  icon: string;
  color: string;
  created_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  condition_type: string;
  condition_value: number;
  reward_experience: number;
  is_active: boolean;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  achievement?: Achievement; // Join com a tabela achievements
}

export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: string;
  description: string;
  metadata: any;
  experience_gained: number;
  created_at: string;
}
