export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
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
          identifier: string | null
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
          identifier?: string | null
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
          identifier?: string | null
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
      admin_error_logs: {
        Row: {
          created_at: string
          error_message: string
          error_stack: string | null
          error_type: string
          id: string
          metadata: Json | null
          resolved: boolean
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          error_message: string
          error_stack?: string | null
          error_type: string
          id?: string
          metadata?: Json | null
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string
          error_stack?: string | null
          error_type?: string
          id?: string
          metadata?: Json | null
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      admin_wallet_control: {
        Row: {
          created_at: string | null
          daily_deposits: number | null
          date_control: string | null
          id: string
          last_updated: string | null
          monthly_deposits: number | null
          total_chest_sales: number | null
          total_system_balance: number | null
          total_withdrawals: number | null
        }
        Insert: {
          created_at?: string | null
          daily_deposits?: number | null
          date_control?: string | null
          id?: string
          last_updated?: string | null
          monthly_deposits?: number | null
          total_chest_sales?: number | null
          total_system_balance?: number | null
          total_withdrawals?: number | null
        }
        Update: {
          created_at?: string | null
          daily_deposits?: number | null
          date_control?: string | null
          id?: string
          last_updated?: string | null
          monthly_deposits?: number | null
          total_chest_sales?: number | null
          total_system_balance?: number | null
          total_withdrawals?: number | null
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
          liberado_manual: boolean | null
          max_quantity: number | null
          min_quantity: number | null
          probability_weight: number
          sorteado_em: string | null
        }
        Insert: {
          chest_type: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          item_id: string
          liberado_manual?: boolean | null
          max_quantity?: number | null
          min_quantity?: number | null
          probability_weight?: number
          sorteado_em?: string | null
        }
        Update: {
          chest_type?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          item_id?: string
          liberado_manual?: boolean | null
          max_quantity?: number | null
          min_quantity?: number | null
          probability_weight?: number
          sorteado_em?: string | null
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
      data_imports: {
        Row: {
          admin_user_id: string | null
          completed_at: string | null
          created_at: string | null
          error_log: Json | null
          failed_records: number | null
          filename: string | null
          id: string
          import_type: string
          mapping_config: Json | null
          preview_data: Json | null
          processed_records: number | null
          status: string | null
          total_records: number | null
        }
        Insert: {
          admin_user_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          error_log?: Json | null
          failed_records?: number | null
          filename?: string | null
          id?: string
          import_type: string
          mapping_config?: Json | null
          preview_data?: Json | null
          processed_records?: number | null
          status?: string | null
          total_records?: number | null
        }
        Update: {
          admin_user_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          error_log?: Json | null
          failed_records?: number | null
          filename?: string | null
          id?: string
          import_type?: string
          mapping_config?: Json | null
          preview_data?: Json | null
          processed_records?: number | null
          status?: string | null
          total_records?: number | null
        }
        Relationships: []
      }
      demo_inventory: {
        Row: {
          chest_type: string
          created_at: string
          id: string
          is_redeemed: boolean
          item_id: string | null
          item_image: string | null
          item_name: string
          rarity: string
          redeemed_at: string | null
          user_id: string
          won_at: string
        }
        Insert: {
          chest_type: string
          created_at?: string
          id?: string
          is_redeemed?: boolean
          item_id?: string | null
          item_image?: string | null
          item_name: string
          rarity?: string
          redeemed_at?: string | null
          user_id: string
          won_at?: string
        }
        Update: {
          chest_type?: string
          created_at?: string
          id?: string
          is_redeemed?: boolean
          item_id?: string | null
          item_image?: string | null
          item_name?: string
          rarity?: string
          redeemed_at?: string | null
          user_id?: string
          won_at?: string
        }
        Relationships: []
      }
      demo_settings: {
        Row: {
          created_at: string
          id: string
          itens_demo: Json
          probabilidades_chest: Json
          saldo_inicial: number
          tempo_reset_horas: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          itens_demo?: Json
          probabilidades_chest?: Json
          saldo_inicial?: number
          tempo_reset_horas?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          itens_demo?: Json
          probabilidades_chest?: Json
          saldo_inicial?: number
          tempo_reset_horas?: number
          updated_at?: string
        }
        Relationships: []
      }
      entregas: {
        Row: {
          bairro: string
          cep: string
          cidade: string
          codigo_rastreio: string | null
          complemento: string | null
          cpf: string
          created_at: string
          email: string
          estado: string
          id: string
          item_id: string | null
          item_nome: string
          nome_completo: string
          numero: string
          rua: string
          status: string
          telefone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bairro: string
          cep: string
          cidade: string
          codigo_rastreio?: string | null
          complemento?: string | null
          cpf: string
          created_at?: string
          email: string
          estado: string
          id?: string
          item_id?: string | null
          item_nome: string
          nome_completo: string
          numero: string
          rua: string
          status?: string
          telefone: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bairro?: string
          cep?: string
          cidade?: string
          codigo_rastreio?: string | null
          complemento?: string | null
          cpf?: string
          created_at?: string
          email?: string
          estado?: string
          id?: string
          item_id?: string | null
          item_nome?: string
          nome_completo?: string
          numero?: string
          rua?: string
          status?: string
          telefone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "entregas_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      item_change_log: {
        Row: {
          action_type: string
          admin_user_id: string | null
          created_at: string | null
          description: string | null
          id: string
          item_id: string | null
          new_data: Json | null
          old_data: Json | null
        }
        Insert: {
          action_type: string
          admin_user_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          item_id?: string | null
          new_data?: Json | null
          old_data?: Json | null
        }
        Update: {
          action_type?: string
          admin_user_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          item_id?: string | null
          new_data?: Json | null
          old_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "item_change_log_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      item_images: {
        Row: {
          created_at: string | null
          file_size: number | null
          filename: string
          id: string
          mime_type: string | null
          original_name: string | null
          updated_at: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          file_size?: number | null
          filename: string
          id?: string
          mime_type?: string | null
          original_name?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          file_size?: number | null
          filename?: string
          id?: string
          mime_type?: string | null
          original_name?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      item_withdrawal_payments: {
        Row: {
          created_at: string | null
          id: string
          paid_at: string | null
          preference_id: string | null
          status: string | null
          transaction_id: string | null
          user_id: string | null
          withdrawal_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          paid_at?: string | null
          preference_id?: string | null
          status?: string | null
          transaction_id?: string | null
          user_id?: string | null
          withdrawal_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          paid_at?: string | null
          preference_id?: string | null
          status?: string | null
          transaction_id?: string | null
          user_id?: string | null
          withdrawal_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "item_withdrawal_payments_withdrawal_id_fkey"
            columns: ["withdrawal_id"]
            isOneToOne: false
            referencedRelation: "item_withdrawals"
            referencedColumns: ["id"]
          },
        ]
      }
      item_withdrawals: {
        Row: {
          cpf: string | null
          created_at: string | null
          delivered_at: string | null
          delivery_address: string | null
          delivery_fee: number | null
          delivery_status: string | null
          full_name: string | null
          id: string
          inventory_id: string | null
          item_id: string | null
          paid_at: string | null
          payment_status: string | null
          sent_at: string | null
          tracking_code: string | null
          user_id: string | null
        }
        Insert: {
          cpf?: string | null
          created_at?: string | null
          delivered_at?: string | null
          delivery_address?: string | null
          delivery_fee?: number | null
          delivery_status?: string | null
          full_name?: string | null
          id?: string
          inventory_id?: string | null
          item_id?: string | null
          paid_at?: string | null
          payment_status?: string | null
          sent_at?: string | null
          tracking_code?: string | null
          user_id?: string | null
        }
        Update: {
          cpf?: string | null
          created_at?: string | null
          delivered_at?: string | null
          delivery_address?: string | null
          delivery_fee?: number | null
          delivery_status?: string | null
          full_name?: string | null
          id?: string
          inventory_id?: string | null
          item_id?: string | null
          paid_at?: string | null
          payment_status?: string | null
          sent_at?: string | null
          tracking_code?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "item_withdrawals_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "user_inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_withdrawals_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_withdrawals_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          base_value: number
          category: string
          chest_order: number | null
          chest_types: string[] | null
          created_at: string | null
          delivery_instructions: string | null
          delivery_type: string | null
          description: string | null
          id: string
          image_filename: string | null
          image_url: string | null
          import_source: string | null
          is_active: boolean | null
          name: string
          notes: string | null
          order_in_chest: number | null
          probability_weight: number | null
          rarity: string
          requires_address: boolean | null
          requires_document: boolean | null
          shipping_fee: number | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          base_value: number
          category?: string
          chest_order?: number | null
          chest_types?: string[] | null
          created_at?: string | null
          delivery_instructions?: string | null
          delivery_type?: string | null
          description?: string | null
          id?: string
          image_filename?: string | null
          image_url?: string | null
          import_source?: string | null
          is_active?: boolean | null
          name: string
          notes?: string | null
          order_in_chest?: number | null
          probability_weight?: number | null
          rarity: string
          requires_address?: boolean | null
          requires_document?: boolean | null
          shipping_fee?: number | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          base_value?: number
          category?: string
          chest_order?: number | null
          chest_types?: string[] | null
          created_at?: string | null
          delivery_instructions?: string | null
          delivery_type?: string | null
          description?: string | null
          id?: string
          image_filename?: string | null
          image_url?: string | null
          import_source?: string | null
          is_active?: boolean | null
          name?: string
          notes?: string | null
          order_in_chest?: number | null
          probability_weight?: number | null
          rarity?: string
          requires_address?: boolean | null
          requires_document?: boolean | null
          shipping_fee?: number | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      manual_item_releases: {
        Row: {
          chest_type: string
          created_at: string | null
          drawn_at: string | null
          expires_at: string
          id: string
          item_id: string
          metadata: Json | null
          probability_id: string
          released_at: string
          released_by: string
          status: string
          updated_at: string | null
          winner_user_id: string | null
        }
        Insert: {
          chest_type: string
          created_at?: string | null
          drawn_at?: string | null
          expires_at?: string
          id?: string
          item_id: string
          metadata?: Json | null
          probability_id: string
          released_at?: string
          released_by: string
          status?: string
          updated_at?: string | null
          winner_user_id?: string | null
        }
        Update: {
          chest_type?: string
          created_at?: string | null
          drawn_at?: string | null
          expires_at?: string
          id?: string
          item_id?: string
          metadata?: Json | null
          probability_id?: string
          released_at?: string
          released_by?: string
          status?: string
          updated_at?: string | null
          winner_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "manual_item_releases_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manual_item_releases_probability_id_fkey"
            columns: ["probability_id"]
            isOneToOne: false
            referencedRelation: "chest_item_probabilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manual_item_releases_released_by_fkey"
            columns: ["released_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      mercadopago_payments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          payment_id: string | null
          payment_method: string | null
          payment_status: string | null
          preference_id: string
          transaction_id: string | null
          updated_at: string | null
          user_id: string | null
          webhook_data: Json | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          preference_id: string
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          webhook_data?: Json | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          preference_id?: string
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          webhook_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "mercadopago_payments_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      metas_baus: {
        Row: {
          created_at: string
          id: string
          meta_valor: number
          nome_bau: string
          notificacao_enviada: boolean
          updated_at: string
          valor_atual: number
        }
        Insert: {
          created_at?: string
          id?: string
          meta_valor?: number
          nome_bau: string
          notificacao_enviada?: boolean
          updated_at?: string
          valor_atual?: number
        }
        Update: {
          created_at?: string
          id?: string
          meta_valor?: number
          nome_bau?: string
          notificacao_enviada?: boolean
          updated_at?: string
          valor_atual?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          achievements: Json | null
          avatar_url: string | null
          bio: string | null
          birth_date: string | null
          chests_opened: number | null
          city: string | null
          complement: string | null
          cpf: string | null
          created_at: string | null
          credito_demo: number | null
          delivery_updates: boolean | null
          email: string
          email_notifications: boolean | null
          experience: number | null
          experience_points: number | null
          full_name: string | null
          id: string
          is_active: boolean | null
          is_demo: boolean | null
          join_date: string | null
          last_login: string | null
          level: number | null
          neighborhood: string | null
          number: string | null
          phone: string | null
          preferences: Json | null
          prize_notifications: boolean | null
          promo_emails: boolean | null
          push_notifications: boolean | null
          simulate_actions: boolean | null
          state: string | null
          street: string | null
          total_prizes_won: number | null
          total_spent: number | null
          ultimo_reset_demo: string | null
          updated_at: string | null
          username: string | null
          zip_code: string | null
        }
        Insert: {
          achievements?: Json | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          chests_opened?: number | null
          city?: string | null
          complement?: string | null
          cpf?: string | null
          created_at?: string | null
          credito_demo?: number | null
          delivery_updates?: boolean | null
          email: string
          email_notifications?: boolean | null
          experience?: number | null
          experience_points?: number | null
          full_name?: string | null
          id: string
          is_active?: boolean | null
          is_demo?: boolean | null
          join_date?: string | null
          last_login?: string | null
          level?: number | null
          neighborhood?: string | null
          number?: string | null
          phone?: string | null
          preferences?: Json | null
          prize_notifications?: boolean | null
          promo_emails?: boolean | null
          push_notifications?: boolean | null
          simulate_actions?: boolean | null
          state?: string | null
          street?: string | null
          total_prizes_won?: number | null
          total_spent?: number | null
          ultimo_reset_demo?: string | null
          updated_at?: string | null
          username?: string | null
          zip_code?: string | null
        }
        Update: {
          achievements?: Json | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          chests_opened?: number | null
          city?: string | null
          complement?: string | null
          cpf?: string | null
          created_at?: string | null
          credito_demo?: number | null
          delivery_updates?: boolean | null
          email?: string
          email_notifications?: boolean | null
          experience?: number | null
          experience_points?: number | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          is_demo?: boolean | null
          join_date?: string | null
          last_login?: string | null
          level?: number | null
          neighborhood?: string | null
          number?: string | null
          phone?: string | null
          preferences?: Json | null
          prize_notifications?: boolean | null
          promo_emails?: boolean | null
          push_notifications?: boolean | null
          simulate_actions?: boolean | null
          state?: string | null
          street?: string | null
          total_prizes_won?: number | null
          total_spent?: number | null
          ultimo_reset_demo?: string | null
          updated_at?: string | null
          username?: string | null
          zip_code?: string | null
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
      scratch_card_financial_control: {
        Row: {
          cards_played: number | null
          created_at: string | null
          date: string
          goal_reached: boolean | null
          id: string
          net_profit: number | null
          profit_goal: number | null
          scratch_type: string
          total_prizes_given: number | null
          total_sales: number | null
          updated_at: string | null
        }
        Insert: {
          cards_played?: number | null
          created_at?: string | null
          date?: string
          goal_reached?: boolean | null
          id?: string
          net_profit?: number | null
          profit_goal?: number | null
          scratch_type: string
          total_prizes_given?: number | null
          total_sales?: number | null
          updated_at?: string | null
        }
        Update: {
          cards_played?: number | null
          created_at?: string | null
          date?: string
          goal_reached?: boolean | null
          id?: string
          net_profit?: number | null
          profit_goal?: number | null
          scratch_type?: string
          total_prizes_given?: number | null
          total_sales?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      scratch_card_probabilities: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          item_id: string
          max_quantity: number | null
          min_quantity: number | null
          probability_weight: number
          scratch_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          item_id: string
          max_quantity?: number | null
          min_quantity?: number | null
          probability_weight?: number
          scratch_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          item_id?: string
          max_quantity?: number | null
          min_quantity?: number | null
          probability_weight?: number
          scratch_type?: string
        }
        Relationships: []
      }
      scratch_card_settings: {
        Row: {
          background_image: string | null
          created_at: string | null
          house_edge: number | null
          id: string
          is_active: boolean | null
          name: string
          price: number
          scratch_type: string
          updated_at: string | null
          win_probability: number | null
        }
        Insert: {
          background_image?: string | null
          created_at?: string | null
          house_edge?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          scratch_type: string
          updated_at?: string | null
          win_probability?: number | null
        }
        Update: {
          background_image?: string | null
          created_at?: string | null
          house_edge?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          scratch_type?: string
          updated_at?: string | null
          win_probability?: number | null
        }
        Relationships: []
      }
      test_payments: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          kirvano_data: Json | null
          payment_data: Json | null
          payment_id: string
          payment_provider: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          kirvano_data?: Json | null
          payment_data?: Json | null
          payment_id: string
          payment_provider?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          kirvano_data?: Json | null
          payment_data?: Json | null
          payment_id?: string
          payment_provider?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          notification_url: string | null
          payment_id: string | null
          payment_provider: string | null
          payment_status: string | null
          reference_id: string | null
          status: string | null
          type: string
          user_id: string
          wallet_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          notification_url?: string | null
          payment_id?: string | null
          payment_provider?: string | null
          payment_status?: string | null
          reference_id?: string | null
          status?: string | null
          type: string
          user_id: string
          wallet_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          notification_url?: string | null
          payment_id?: string | null
          payment_provider?: string | null
          payment_status?: string | null
          reference_id?: string | null
          status?: string | null
          type?: string
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "user_wallets"
            referencedColumns: ["id"]
          },
        ]
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
      user_chests: {
        Row: {
          chest_type: string
          created_at: string
          id: string
          item_won_id: string | null
          opened_at: string | null
          purchased_at: string
          status: string
          user_id: string
        }
        Insert: {
          chest_type: string
          created_at?: string
          id?: string
          item_won_id?: string | null
          opened_at?: string | null
          purchased_at?: string
          status?: string
          user_id: string
        }
        Update: {
          chest_type?: string
          created_at?: string
          id?: string
          item_won_id?: string | null
          opened_at?: string | null
          purchased_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_chests_item_won_id_fkey"
            columns: ["item_won_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      user_inventory: {
        Row: {
          chest_type: string
          created_at: string
          id: string
          is_redeemed: boolean
          item_id: string
          rarity: string
          redeemed_at: string | null
          user_id: string
          won_at: string
        }
        Insert: {
          chest_type: string
          created_at?: string
          id?: string
          is_redeemed?: boolean
          item_id: string
          rarity: string
          redeemed_at?: string | null
          user_id: string
          won_at?: string
        }
        Update: {
          chest_type?: string
          created_at?: string
          id?: string
          is_redeemed?: boolean
          item_id?: string
          rarity?: string
          redeemed_at?: string | null
          user_id?: string
          won_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_inventory_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
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
      user_wallets: {
        Row: {
          balance: number | null
          created_at: string | null
          id: string
          test_balance: number | null
          total_deposited: number | null
          total_spent: number | null
          total_withdrawn: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          id?: string
          test_balance?: number | null
          total_deposited?: number | null
          total_spent?: number | null
          total_withdrawn?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          id?: string
          test_balance?: number | null
          total_deposited?: number | null
          total_spent?: number | null
          total_withdrawn?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          chest_type: string | null
          created_at: string
          description: string
          id: string
          metadata: Json | null
          type: string
          user_id: string
          wallet_id: string
        }
        Insert: {
          amount: number
          chest_type?: string | null
          created_at?: string
          description: string
          id?: string
          metadata?: Json | null
          type: string
          user_id: string
          wallet_id: string
        }
        Update: {
          amount?: number
          chest_type?: string | null
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          type?: string
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "user_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_experience_and_level: {
        Args: { user_id_input: string; xp_to_add: number }
        Returns: undefined
      }
      add_wallet_balance: {
        Args: { p_user_id: string; p_amount: number; p_description?: string }
        Returns: boolean
      }
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
      check_admin_direct: {
        Args: { user_id_check: string }
        Returns: boolean
      }
      check_user_role: {
        Args: { p_user_id: string; p_role: string }
        Returns: boolean
      }
      cleanup_expired_invites: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      clear_items_table: {
        Args: Record<PropertyKey, never>
        Returns: {
          deleted_count: number
        }[]
      }
      create_payment_preference: {
        Args: { p_user_id: string; p_amount: number; p_description?: string }
        Returns: {
          preference_id: string
          transaction_id: string
        }[]
      }
      expire_old_manual_releases: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_ranking_top10: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          full_name: string
          total_spent: number
          total_prizes_won: number
          level: number
          level_title: string
        }[]
      }
      get_user_ranking_position: {
        Args: { user_id_input: string }
        Returns: {
          id: string
          full_name: string
          total_spent: number
          total_prizes_won: number
          level: number
          level_title: string
          position: number
        }[]
      }
      is_admin_role: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
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
      migrate_chest_data: {
        Args: { items_data: Json }
        Returns: {
          migrated_count: number
          updated_count: number
          error_count: number
          errors: string[]
        }[]
      }
      open_chest: {
        Args: { p_user_id: string; p_chest_id: string; p_item_id: string }
        Returns: boolean
      }
      process_excel_import: {
        Args: { import_id: string; excel_data: Json; column_mapping: Json }
        Returns: boolean
      }
      process_mercadopago_webhook: {
        Args: {
          p_preference_id: string
          p_payment_id: string
          p_payment_status: string
          p_webhook_data: Json
        }
        Returns: boolean
      }
      purchase_chest: {
        Args: { p_user_id: string; p_chest_type: string; p_price: number }
        Returns: string
      }
      reset_demo_credits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      validate_balance_operation: {
        Args: { p_user_id: string; p_amount: number; p_operation_type: string }
        Returns: boolean
      }
      validate_cpf_for_withdrawal: {
        Args: { cpf_input: string }
        Returns: boolean
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
