export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      achievements: {
        Row: {
          condition_type: string
          condition_value: number
          created_at: string | null
          description: string
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          rarity: string | null
          reward_experience: number | null
        }
        Insert: {
          condition_type: string
          condition_value: number
          created_at?: string | null
          description: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          rarity?: string | null
          reward_experience?: number | null
        }
        Update: {
          condition_type?: string
          condition_value?: number
          created_at?: string | null
          description?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          rarity?: string | null
          reward_experience?: number | null
        }
        Relationships: []
      }
      admin_action_logs: {
        Row: {
          action_type: string
          admin_user_id: string
          affected_record_id: string | null
          affected_table: string | null
          created_at: string | null
          description: string
          id: string
          ip_address: string | null
          metadata: Json | null
          new_data: Json | null
          old_data: Json | null
          user_agent: string | null
        }
        Insert: {
          action_type: string
          admin_user_id: string
          affected_record_id?: string | null
          affected_table?: string | null
          created_at?: string | null
          description: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_data?: Json | null
          old_data?: Json | null
          user_agent?: string | null
        }
        Update: {
          action_type?: string
          admin_user_id?: string
          affected_record_id?: string | null
          affected_table?: string | null
          created_at?: string | null
          description?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_data?: Json | null
          old_data?: Json | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_action_logs_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string | null
          created_by: string | null
          email: string
          id: string
          is_active: boolean | null
          permissions: Json | null
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      chest_financial_control: {
        Row: {
          chest_type: string
          chests_opened: number | null
          created_at: string | null
          date: string
          goal_reached: boolean | null
          id: string
          net_profit: number | null
          profit_goal: number | null
          total_prizes_given: number | null
          total_sales: number | null
          updated_at: string | null
        }
        Insert: {
          chest_type: string
          chests_opened?: number | null
          created_at?: string | null
          date?: string
          goal_reached?: boolean | null
          id?: string
          net_profit?: number | null
          profit_goal?: number | null
          total_prizes_given?: number | null
          total_sales?: number | null
          updated_at?: string | null
        }
        Update: {
          chest_type?: string
          chests_opened?: number | null
          created_at?: string | null
          date?: string
          goal_reached?: boolean | null
          id?: string
          net_profit?: number | null
          profit_goal?: number | null
          total_prizes_given?: number | null
          total_sales?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      chest_item_probabilities: {
        Row: {
          chest_type: string
          created_at: string | null
          id: string
          is_active: boolean | null
          item_id: string
          max_quantity: number | null
          min_quantity: number | null
          probability_weight: number
        }
        Insert: {
          chest_type: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          item_id: string
          max_quantity?: number | null
          min_quantity?: number | null
          probability_weight?: number
        }
        Update: {
          chest_type?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          item_id?: string
          max_quantity?: number | null
          min_quantity?: number | null
          probability_weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "chest_item_probabilities_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      chest_profit_goals: {
        Row: {
          chest_type: string
          created_at: string | null
          current_profit: number
          goal_reached: boolean | null
          id: string
          profit_goal: number
        }
        Insert: {
          chest_type: string
          created_at?: string | null
          current_profit?: number
          goal_reached?: boolean | null
          id?: string
          profit_goal?: number
        }
        Update: {
          chest_type?: string
          created_at?: string | null
          current_profit?: number
          goal_reached?: boolean | null
          id?: string
          profit_goal?: number
        }
        Relationships: []
      }
      collaborator_invites: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invited_by: string
          is_used: boolean | null
          role: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          invited_by: string
          is_used?: boolean | null
          role?: string
          token: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          is_used?: boolean | null
          role?: string
          token?: string
        }
        Relationships: []
      }
      items: {
        Row: {
          base_value: number
          category: string
          chest_order: number | null
          created_at: string | null
          delivery_instructions: string | null
          delivery_type: string | null
          description: string | null
          id: string
          image_filename: string | null
          image_url: string | null
          is_active: boolean | null
          name: string
          order_in_chest: number | null
          rarity: string
          requires_address: boolean | null
          requires_document: boolean | null
          shipping_fee: number | null
          updated_at: string | null
        }
        Insert: {
          base_value: number
          category?: string
          chest_order?: number | null
          created_at?: string | null
          delivery_instructions?: string | null
          delivery_type?: string | null
          description?: string | null
          id?: string
          image_filename?: string | null
          image_url?: string | null
          is_active?: boolean | null
          name: string
          order_in_chest?: number | null
          rarity: string
          requires_address?: boolean | null
          requires_document?: boolean | null
          shipping_fee?: number | null
          updated_at?: string | null
        }
        Update: {
          base_value?: number
          category?: string
          chest_order?: number | null
          created_at?: string | null
          delivery_instructions?: string | null
          delivery_type?: string | null
          description?: string | null
          id?: string
          image_filename?: string | null
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          order_in_chest?: number | null
          rarity?: string
          requires_address?: boolean | null
          requires_document?: boolean | null
          shipping_fee?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          achievements: Json | null
          avatar_url: string | null
          bio: string | null
          chests_opened: number | null
          created_at: string | null
          email: string
          experience_points: number | null
          full_name: string | null
          id: string
          is_active: boolean | null
          join_date: string | null
          last_login: string | null
          level: number | null
          preferences: Json | null
          total_prizes_won: number | null
          total_spent: number | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          achievements?: Json | null
          avatar_url?: string | null
          bio?: string | null
          chests_opened?: number | null
          created_at?: string | null
          email: string
          experience_points?: number | null
          full_name?: string | null
          id: string
          is_active?: boolean | null
          join_date?: string | null
          last_login?: string | null
          level?: number | null
          preferences?: Json | null
          total_prizes_won?: number | null
          total_spent?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          achievements?: Json | null
          avatar_url?: string | null
          bio?: string | null
          chests_opened?: number | null
          created_at?: string | null
          email?: string
          experience_points?: number | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          join_date?: string | null
          last_login?: string | null
          level?: number | null
          preferences?: Json | null
          total_prizes_won?: number | null
          total_spent?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      profit_alerts: {
        Row: {
          alert_type: string
          chest_type: string
          data: Json | null
          id: string
          is_read: boolean | null
          message: string
          triggered_at: string | null
        }
        Insert: {
          alert_type: string
          chest_type: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message: string
          triggered_at?: string | null
        }
        Update: {
          alert_type?: string
          chest_type?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string
          triggered_at?: string | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activities: {
        Row: {
          activity_type: string
          created_at: string | null
          description: string
          experience_gained: number | null
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          description: string
          experience_gained?: number | null
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          description?: string
          experience_gained?: number | null
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_levels: {
        Row: {
          benefits: Json | null
          color: string | null
          created_at: string | null
          icon: string | null
          id: string
          level: number
          max_experience: number | null
          min_experience: number
          name: string
        }
        Insert: {
          benefits?: Json | null
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          level: number
          max_experience?: number | null
          min_experience: number
          name: string
        }
        Update: {
          benefits?: Json | null
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          level?: number
          max_experience?: number | null
          min_experience?: number
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_user_level: {
        Args: { experience: number }
        Returns: {
          level: number
          name: string
          icon: string
          color: string
          benefits: Json
        }[]
      }
      cleanup_expired_invites: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      log_admin_action: {
        Args: {
          p_admin_user_id: string
          p_action_type: string
          p_description: string
          p_affected_table?: string
          p_affected_record_id?: string
          p_old_data?: Json
          p_new_data?: Json
          p_metadata?: Json
        }
        Returns: string
      }
      log_user_activity: {
        Args: {
          p_user_id: string
          p_activity_type: string
          p_description: string
          p_metadata?: Json
          p_experience_gained?: number
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
