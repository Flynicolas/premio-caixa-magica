// ==============================================
// TIPOS DO BANCO DE DADOS
// ==============================================

export interface DatabaseItem {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  base_value: number;
  delivery_type: 'digital' | 'physical';
  delivery_instructions: string | null;
  requires_address: boolean;
  requires_document: boolean;
  is_active: boolean;
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
