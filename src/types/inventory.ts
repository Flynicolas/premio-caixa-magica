
// ==============================================
// TIPOS RELACIONADOS A INVENTÁRIO
// ==============================================

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
  item?: import('./items').DatabaseItem; // Join com a tabela items
}
