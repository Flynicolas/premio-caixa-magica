
// ==============================================
// TIPOS RELACIONADOS A USUÁRIOS
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
