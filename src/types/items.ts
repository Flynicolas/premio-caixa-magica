
// ==============================================
// TIPOS RELACIONADOS A ITENS
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
