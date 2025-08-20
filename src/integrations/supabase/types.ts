export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
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
      app_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          setting_key: string
          setting_value: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      cash_control_system: {
        Row: {
          alert_level: string | null
          created_at: string | null
          emergency_stop: boolean | null
          id: string
          last_reconciliation: string | null
          net_profit: number
          total_deposits_real: number
          total_prizes_given: number
          total_scratch_sales: number
          total_system_balance: number
          total_withdrawals_real: number
          updated_at: string | null
        }
        Insert: {
          alert_level?: string | null
          created_at?: string | null
          emergency_stop?: boolean | null
          id?: string
          last_reconciliation?: string | null
          net_profit?: number
          total_deposits_real?: number
          total_prizes_given?: number
          total_scratch_sales?: number
          total_system_balance?: number
          total_withdrawals_real?: number
          updated_at?: string | null
        }
        Update: {
          alert_level?: string | null
          created_at?: string | null
          emergency_stop?: boolean | null
          id?: string
          last_reconciliation?: string | null
          net_profit?: number
          total_deposits_real?: number
          total_prizes_given?: number
          total_scratch_sales?: number
          total_system_balance?: number
          total_withdrawals_real?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      cashouts: {
        Row: {
          amount_cents: number
          created_at: string | null
          e2eid: string | null
          id: string
          pix_key: string
          status: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string | null
          e2eid?: string | null
          id?: string
          pix_key: string
          status?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string | null
          e2eid?: string | null
          id?: string
          pix_key?: string
          status?: string
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
      critical_financial_alerts: {
        Row: {
          action_taken: string | null
          alert_level: string
          alert_type: string
          amount: number | null
          created_at: string | null
          current_balance: number | null
          description: string
          id: string
          is_resolved: boolean | null
          metadata: Json | null
          resolved_at: string | null
          resolved_by: string | null
          user_id: string | null
        }
        Insert: {
          action_taken?: string | null
          alert_level: string
          alert_type: string
          amount?: number | null
          created_at?: string | null
          current_balance?: number | null
          description: string
          id?: string
          is_resolved?: boolean | null
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          user_id?: string | null
        }
        Update: {
          action_taken?: string | null
          alert_level?: string
          alert_type?: string
          amount?: number | null
          created_at?: string | null
          current_balance?: number | null
          description?: string
          id?: string
          is_resolved?: boolean | null
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      daily_redemption_limits: {
        Row: {
          created_at: string
          date: string
          id: string
          last_redemption_at: string | null
          redemption_count: number
          total_redeemed: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          last_redemption_at?: string | null
          redemption_count?: number
          total_redeemed?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          last_redemption_at?: string | null
          redemption_count?: number
          total_redeemed?: number
          updated_at?: string
          user_id?: string
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
      event_log: {
        Row: {
          admin_id: string | null
          created_at: string
          details: Json
          event_type: string
          id: number
          ref_id: string | null
          user_id: string | null
        }
        Insert: {
          admin_id?: string | null
          created_at?: string
          details?: Json
          event_type: string
          id?: number
          ref_id?: string | null
          user_id?: string | null
        }
        Update: {
          admin_id?: string | null
          created_at?: string
          details?: Json
          event_type?: string
          id?: number
          ref_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      financial_audit_log: {
        Row: {
          actual_value: number | null
          audit_type: string
          created_at: string | null
          description: string | null
          discrepancy: number | null
          expected_value: number | null
          id: string
          metadata: Json | null
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string | null
          transaction_id: string | null
          user_id: string | null
        }
        Insert: {
          actual_value?: number | null
          audit_type: string
          created_at?: string | null
          description?: string | null
          discrepancy?: number | null
          expected_value?: number | null
          id?: string
          metadata?: Json | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          transaction_id?: string | null
          user_id?: string | null
        }
        Update: {
          actual_value?: number | null
          audit_type?: string
          created_at?: string | null
          description?: string | null
          discrepancy?: number | null
          expected_value?: number | null
          id?: string
          metadata?: Json | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          transaction_id?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      manual_scratch_releases: {
        Row: {
          created_at: string
          drawn_at: string | null
          expires_at: string
          id: string
          item_id: string
          metadata: Json | null
          priority: number
          released_by: string
          scheduled_for: string | null
          scratch_type: string
          status: string
          updated_at: string
          winner_user_id: string | null
        }
        Insert: {
          created_at?: string
          drawn_at?: string | null
          expires_at?: string
          id?: string
          item_id: string
          metadata?: Json | null
          priority?: number
          released_by: string
          scheduled_for?: string | null
          scratch_type: string
          status?: string
          updated_at?: string
          winner_user_id?: string | null
        }
        Update: {
          created_at?: string
          drawn_at?: string | null
          expires_at?: string
          id?: string
          item_id?: string
          metadata?: Json | null
          priority?: number
          released_by?: string
          scheduled_for?: string | null
          scratch_type?: string
          status?: string
          updated_at?: string
          winner_user_id?: string | null
        }
        Relationships: []
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
      money_item_redemptions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          id: string
          inventory_id: string
          item_id: string
          metadata: Json | null
          processed_at: string
          redemption_amount: number
          redemption_status: string
          requires_approval: boolean
          security_score: number
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          inventory_id: string
          item_id: string
          metadata?: Json | null
          processed_at?: string
          redemption_amount: number
          redemption_status?: string
          requires_approval?: boolean
          security_score?: number
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          inventory_id?: string
          item_id?: string
          metadata?: Json | null
          processed_at?: string
          redemption_amount?: number
          redemption_status?: string
          requires_approval?: boolean
          security_score?: number
          user_id?: string
        }
        Relationships: []
      }
      money_redemption_alerts: {
        Row: {
          alert_data: Json | null
          alert_level: string
          alert_type: string
          created_at: string
          id: string
          is_resolved: boolean
          redemption_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          user_id: string
        }
        Insert: {
          alert_data?: Json | null
          alert_level?: string
          alert_type: string
          created_at?: string
          id?: string
          is_resolved?: boolean
          redemption_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          user_id: string
        }
        Update: {
          alert_data?: Json | null
          alert_level?: string
          alert_type?: string
          created_at?: string
          id?: string
          is_resolved?: boolean
          redemption_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_cents: number
          brcode: string | null
          created_at: string | null
          description: string | null
          expires_at: string | null
          id: string
          metadata: Json | null
          provider: string
          provider_payment_id: string | null
          qrcode: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_cents: number
          brcode?: string | null
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          provider: string
          provider_payment_id?: string | null
          qrcode?: string | null
          status: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_cents?: number
          brcode?: string | null
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          provider?: string
          provider_payment_id?: string | null
          qrcode?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payouts: {
        Row: {
          amount_cents: number
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          pix_key: string
          pix_key_type: string
          provider: string
          provider_payout_id: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          pix_key: string
          pix_key_type: string
          provider?: string
          provider_payout_id?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          pix_key?: string
          pix_key_type?: string
          provider?: string
          provider_payout_id?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pix_charges: {
        Row: {
          amount_cents: number
          created_at: string | null
          status: string
          txid: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string | null
          status?: string
          txid: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string | null
          status?: string
          txid?: string
          user_id?: string
        }
        Relationships: []
      }
      pix_in_events: {
        Row: {
          amount_cents: number | null
          created_at: string | null
          e2eid: string | null
          raw: Json | null
          txid: string
        }
        Insert: {
          amount_cents?: number | null
          created_at?: string | null
          e2eid?: string | null
          raw?: Json | null
          txid: string
        }
        Update: {
          amount_cents?: number | null
          created_at?: string | null
          e2eid?: string | null
          raw?: Json | null
          txid?: string
        }
        Relationships: []
      }
      pix_intents: {
        Row: {
          amount_cents: number
          created_at: string
          paid_at: string | null
          raw: Json | null
          status: string
          txid: string
          user_id: string
          wallet_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          paid_at?: string | null
          raw?: Json | null
          status?: string
          txid: string
          user_id: string
          wallet_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          paid_at?: string | null
          raw?: Json | null
          status?: string
          txid?: string
          user_id?: string
          wallet_id?: string
        }
        Relationships: []
      }
      pix_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: number
          pix_key: string
          status: string | null
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: never
          pix_key: string
          status?: string | null
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: never
          pix_key?: string
          status?: string | null
          transaction_id?: string | null
          user_id?: string
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
          phone: string
          preferences: Json | null
          prize_notifications: boolean | null
          promo_emails: boolean | null
          push_notifications: boolean | null
          referral_date: string | null
          referral_source: string | null
          referred_by: string | null
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
          phone?: string
          preferences?: Json | null
          prize_notifications?: boolean | null
          promo_emails?: boolean | null
          push_notifications?: boolean | null
          referral_date?: string | null
          referral_source?: string | null
          referred_by?: string | null
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
          phone?: string
          preferences?: Json | null
          prize_notifications?: boolean | null
          promo_emails?: boolean | null
          push_notifications?: boolean | null
          referral_date?: string | null
          referral_source?: string | null
          referred_by?: string | null
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
      programmed_prize_queue: {
        Row: {
          created_at: string
          created_by: string
          current_uses: number | null
          expires_at: string
          id: string
          item_id: string
          max_uses: number | null
          metadata: Json | null
          priority: number
          scheduled_for: string | null
          scratch_type: string
          status: string
          target_behavior_criteria: Json | null
          target_user_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          current_uses?: number | null
          expires_at?: string
          id?: string
          item_id: string
          max_uses?: number | null
          metadata?: Json | null
          priority?: number
          scheduled_for?: string | null
          scratch_type: string
          status?: string
          target_behavior_criteria?: Json | null
          target_user_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          current_uses?: number | null
          expires_at?: string
          id?: string
          item_id?: string
          max_uses?: number | null
          metadata?: Json | null
          priority?: number
          scheduled_for?: string | null
          scratch_type?: string
          status?: string
          target_behavior_criteria?: Json | null
          target_user_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "programmed_prize_queue_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_activities: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string
          id: string
          ip_address: string | null
          referral_source: string | null
          referred_user_id: string | null
          referrer_id: string
          user_agent: string | null
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string
          id?: string
          ip_address?: string | null
          referral_source?: string | null
          referred_user_id?: string | null
          referrer_id: string
          user_agent?: string | null
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          referral_source?: string | null
          referred_user_id?: string | null
          referrer_id?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      referral_stats: {
        Row: {
          clicks: number
          conversion_rate: number
          created_at: string
          date: string
          first_deposits: number
          id: string
          referrer_id: string
          registrations: number
          total_deposit_amount: number
          total_spent_amount: number
          updated_at: string
        }
        Insert: {
          clicks?: number
          conversion_rate?: number
          created_at?: string
          date?: string
          first_deposits?: number
          id?: string
          referrer_id: string
          registrations?: number
          total_deposit_amount?: number
          total_spent_amount?: number
          updated_at?: string
        }
        Update: {
          clicks?: number
          conversion_rate?: number
          created_at?: string
          date?: string
          first_deposits?: number
          id?: string
          referrer_id?: string
          registrations?: number
          total_deposit_amount?: number
          total_spent_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      scratch_card_daily_budget: {
        Row: {
          budget_percentage: number
          created_at: string
          date: string
          games_played: number
          id: string
          remaining_budget: number
          scratch_type: string
          total_prizes_given: number
          total_sales: number
          updated_at: string
        }
        Insert: {
          budget_percentage?: number
          created_at?: string
          date?: string
          games_played?: number
          id?: string
          remaining_budget?: number
          scratch_type: string
          total_prizes_given?: number
          total_sales?: number
          updated_at?: string
        }
        Update: {
          budget_percentage?: number
          created_at?: string
          date?: string
          games_played?: number
          id?: string
          remaining_budget?: number
          scratch_type?: string
          total_prizes_given?: number
          total_sales?: number
          updated_at?: string
        }
        Relationships: []
      }
      scratch_card_dynamic_config: {
        Row: {
          base_win_probability: number
          blackout_periods: Json
          budget_threshold_high: number
          budget_threshold_low: number
          cooldown_after_big_win: number
          created_at: string
          dynamic_probability_enabled: boolean
          id: string
          max_value_per_win: number
          max_win_probability: number
          max_wins_per_hour: number
          min_win_probability: number
          peak_hours_end: number
          peak_hours_multiplier: number
          peak_hours_start: number
          scratch_type: string
          security_limits_enabled: boolean
          time_based_adjustment: boolean
          updated_at: string
        }
        Insert: {
          base_win_probability?: number
          blackout_periods?: Json
          budget_threshold_high?: number
          budget_threshold_low?: number
          cooldown_after_big_win?: number
          created_at?: string
          dynamic_probability_enabled?: boolean
          id?: string
          max_value_per_win?: number
          max_win_probability?: number
          max_wins_per_hour?: number
          min_win_probability?: number
          peak_hours_end?: number
          peak_hours_multiplier?: number
          peak_hours_start?: number
          scratch_type: string
          security_limits_enabled?: boolean
          time_based_adjustment?: boolean
          updated_at?: string
        }
        Update: {
          base_win_probability?: number
          blackout_periods?: Json
          budget_threshold_high?: number
          budget_threshold_low?: number
          cooldown_after_big_win?: number
          created_at?: string
          dynamic_probability_enabled?: boolean
          id?: string
          max_value_per_win?: number
          max_win_probability?: number
          max_wins_per_hour?: number
          min_win_probability?: number
          peak_hours_end?: number
          peak_hours_multiplier?: number
          peak_hours_start?: number
          scratch_type?: string
          security_limits_enabled?: boolean
          time_based_adjustment?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      scratch_card_financial_control: {
        Row: {
          bank_balance: number | null
          budget_percentage: number | null
          cards_played: number | null
          created_at: string | null
          daily_budget_prizes: number | null
          date: string
          goal_reached: boolean | null
          id: string
          min_bank_balance: number | null
          net_profit: number | null
          pay_upto_percentage: number | null
          payout_mode: string | null
          percentage_prizes: number | null
          percentage_profit: number | null
          profit_goal: number | null
          remaining_budget: number | null
          scratch_type: string
          total_prizes_given: number | null
          total_sales: number | null
          updated_at: string | null
        }
        Insert: {
          bank_balance?: number | null
          budget_percentage?: number | null
          cards_played?: number | null
          created_at?: string | null
          daily_budget_prizes?: number | null
          date?: string
          goal_reached?: boolean | null
          id?: string
          min_bank_balance?: number | null
          net_profit?: number | null
          pay_upto_percentage?: number | null
          payout_mode?: string | null
          percentage_prizes?: number | null
          percentage_profit?: number | null
          profit_goal?: number | null
          remaining_budget?: number | null
          scratch_type: string
          total_prizes_given?: number | null
          total_sales?: number | null
          updated_at?: string | null
        }
        Update: {
          bank_balance?: number | null
          budget_percentage?: number | null
          cards_played?: number | null
          created_at?: string | null
          daily_budget_prizes?: number | null
          date?: string
          goal_reached?: boolean | null
          id?: string
          min_bank_balance?: number | null
          net_profit?: number | null
          pay_upto_percentage?: number | null
          payout_mode?: string | null
          percentage_prizes?: number | null
          percentage_profit?: number | null
          profit_goal?: number | null
          remaining_budget?: number | null
          scratch_type?: string
          total_prizes_given?: number | null
          total_sales?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      scratch_card_games: {
        Row: {
          amount_paid: number
          created_at: string
          has_win: boolean
          id: string
          processed_at: string | null
          scratch_type: string
          symbols: Json
          user_id: string
          winning_amount: number | null
          winning_item_id: string | null
        }
        Insert: {
          amount_paid: number
          created_at?: string
          has_win?: boolean
          id?: string
          processed_at?: string | null
          scratch_type: string
          symbols: Json
          user_id: string
          winning_amount?: number | null
          winning_item_id?: string | null
        }
        Update: {
          amount_paid?: number
          created_at?: string
          has_win?: boolean
          id?: string
          processed_at?: string | null
          scratch_type?: string
          symbols?: Json
          user_id?: string
          winning_amount?: number | null
          winning_item_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scratch_card_games_winning_item_id_fkey"
            columns: ["winning_item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      scratch_card_presets: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          name: string
          pay_upto_percentage: number
          win_probability_global: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          name: string
          pay_upto_percentage: number
          win_probability_global: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          name?: string
          pay_upto_percentage?: number
          win_probability_global?: number
        }
        Relationships: []
      }
      scratch_card_probabilities: {
        Row: {
          active: boolean
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
          active?: boolean
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
          active?: boolean
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
      scratch_card_probability_history: {
        Row: {
          adjustment_factor: number
          budget_remaining: number
          created_at: string
          current_probability: number
          id: string
          scratch_type: string
          timestamp: string
          trigger_reason: string
        }
        Insert: {
          adjustment_factor?: number
          budget_remaining?: number
          created_at?: string
          current_probability: number
          id?: string
          scratch_type: string
          timestamp?: string
          trigger_reason: string
        }
        Update: {
          adjustment_factor?: number
          budget_remaining?: number
          created_at?: string
          current_probability?: number
          id?: string
          scratch_type?: string
          timestamp?: string
          trigger_reason?: string
        }
        Relationships: []
      }
      scratch_card_profit_monitoring: {
        Row: {
          created_at: string | null
          date: string | null
          id: string
          is_healthy: boolean | null
          profit_margin_percentage: number | null
          scratch_type: string
          target_margin_percentage: number | null
          total_prizes_paid: number | null
          total_sales: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          id?: string
          is_healthy?: boolean | null
          profit_margin_percentage?: number | null
          scratch_type: string
          target_margin_percentage?: number | null
          total_prizes_paid?: number | null
          total_sales?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string | null
          id?: string
          is_healthy?: boolean | null
          profit_margin_percentage?: number | null
          scratch_type?: string
          target_margin_percentage?: number | null
          total_prizes_paid?: number | null
          total_sales?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      scratch_card_security_alerts: {
        Row: {
          alert_data: Json | null
          alert_level: string
          alert_type: string
          created_at: string
          id: string
          is_resolved: boolean
          resolved_at: string | null
          resolved_by: string | null
          scratch_type: string
          user_id: string | null
        }
        Insert: {
          alert_data?: Json | null
          alert_level?: string
          alert_type: string
          created_at?: string
          id?: string
          is_resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          scratch_type: string
          user_id?: string | null
        }
        Update: {
          alert_data?: Json | null
          alert_level?: string
          alert_type?: string
          created_at?: string
          id?: string
          is_resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          scratch_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      scratch_card_settings: {
        Row: {
          backend_cost: number
          background_image: string | null
          category: string | null
          created_at: string | null
          house_edge: number | null
          id: string
          is_active: boolean | null
          name: string
          price: number
          price_display: number
          scratch_type: string
          sort_order: number | null
          updated_at: string | null
          win_probability: number | null
          win_probability_global: number
          win_probability_influencer: number | null
          win_probability_normal: number | null
        }
        Insert: {
          backend_cost?: number
          background_image?: string | null
          category?: string | null
          created_at?: string | null
          house_edge?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          price_display?: number
          scratch_type: string
          sort_order?: number | null
          updated_at?: string | null
          win_probability?: number | null
          win_probability_global?: number
          win_probability_influencer?: number | null
          win_probability_normal?: number | null
        }
        Update: {
          backend_cost?: number
          background_image?: string | null
          category?: string | null
          created_at?: string | null
          house_edge?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          price_display?: number
          scratch_type?: string
          sort_order?: number | null
          updated_at?: string | null
          win_probability?: number | null
          win_probability_global?: number
          win_probability_influencer?: number | null
          win_probability_normal?: number | null
        }
        Relationships: []
      }
      scratch_decision_logs: {
        Row: {
          budget_available: number
          created_at: string
          decision_reason: string
          decision_type: string
          financial_context: Json
          id: string
          probability_calculated: number
          result_data: Json
          scratch_type: string
          user_context: Json
          user_id: string
          user_score: number
        }
        Insert: {
          budget_available?: number
          created_at?: string
          decision_reason: string
          decision_type: string
          financial_context?: Json
          id?: string
          probability_calculated?: number
          result_data?: Json
          scratch_type: string
          user_context?: Json
          user_id: string
          user_score?: number
        }
        Update: {
          budget_available?: number
          created_at?: string
          decision_reason?: string
          decision_type?: string
          financial_context?: Json
          id?: string
          probability_calculated?: number
          result_data?: Json
          scratch_type?: string
          user_context?: Json
          user_id?: string
          user_score?: number
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
      user_behavior_analysis: {
        Row: {
          analysis_date: string
          avg_bet_amount: number
          behavior_score: number
          created_at: string
          days_since_last_win: number | null
          eligibility_tier: string
          engagement_level: string
          id: string
          last_deposit_date: string | null
          last_win_date: string | null
          metadata: Json | null
          play_pattern: string
          total_games_played: number
          total_spent: number
          total_won: number
          updated_at: string
          user_id: string
          win_frequency: number
          withdrawal_frequency: number | null
        }
        Insert: {
          analysis_date?: string
          avg_bet_amount?: number
          behavior_score?: number
          created_at?: string
          days_since_last_win?: number | null
          eligibility_tier?: string
          engagement_level?: string
          id?: string
          last_deposit_date?: string | null
          last_win_date?: string | null
          metadata?: Json | null
          play_pattern?: string
          total_games_played?: number
          total_spent?: number
          total_won?: number
          updated_at?: string
          user_id: string
          win_frequency?: number
          withdrawal_frequency?: number | null
        }
        Update: {
          analysis_date?: string
          avg_bet_amount?: number
          behavior_score?: number
          created_at?: string
          days_since_last_win?: number | null
          eligibility_tier?: string
          engagement_level?: string
          id?: string
          last_deposit_date?: string | null
          last_win_date?: string | null
          metadata?: Json | null
          play_pattern?: string
          total_games_played?: number
          total_spent?: number
          total_won?: number
          updated_at?: string
          user_id?: string
          win_frequency?: number
          withdrawal_frequency?: number | null
        }
        Relationships: []
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
      user_referrals: {
        Row: {
          active_referrals: number
          commission_pending: number
          created_at: string
          id: string
          is_active: boolean
          last_referral_at: string | null
          referral_code: string
          referral_link: string
          successful_referrals: number
          total_commission_earned: number
          total_invites: number
          updated_at: string
          user_id: string
        }
        Insert: {
          active_referrals?: number
          commission_pending?: number
          created_at?: string
          id?: string
          is_active?: boolean
          last_referral_at?: string | null
          referral_code: string
          referral_link: string
          successful_referrals?: number
          total_commission_earned?: number
          total_invites?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          active_referrals?: number
          commission_pending?: number
          created_at?: string
          id?: string
          is_active?: boolean
          last_referral_at?: string | null
          referral_code?: string
          referral_link?: string
          successful_referrals?: number
          total_commission_earned?: number
          total_invites?: number
          updated_at?: string
          user_id?: string
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
      visual_configurations: {
        Row: {
          config_data: Json
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          section_name: string
          section_type: string
          updated_at: string
        }
        Insert: {
          config_data?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          section_name: string
          section_type: string
          updated_at?: string
        }
        Update: {
          config_data?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          section_name?: string
          section_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number | null
          amount_cents: number
          chest_type: string | null
          created_at: string
          description: string
          id: string
          metadata: Json | null
          reference: string | null
          reference_id: string | null
          source: string | null
          type: string
          unique_key: string | null
          user_id: string
          wallet_id: string
        }
        Insert: {
          amount?: number | null
          amount_cents: number
          chest_type?: string | null
          created_at?: string
          description: string
          id?: string
          metadata?: Json | null
          reference?: string | null
          reference_id?: string | null
          source?: string | null
          type: string
          unique_key?: string | null
          user_id: string
          wallet_id: string
        }
        Update: {
          amount?: number | null
          amount_cents?: number
          chest_type?: string | null
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          reference?: string | null
          reference_id?: string | null
          source?: string | null
          type?: string
          unique_key?: string | null
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
        Args: { p_amount: number; p_description?: string; p_user_id: string }
        Returns: boolean
      }
      analyze_user_behavior: {
        Args: { p_user_id: string }
        Returns: {
          analysis_data: Json
          behavior_score: number
          days_since_last_win: number
          eligibility_tier: string
          engagement_level: string
          play_pattern: string
          win_frequency: number
        }[]
      }
      apply_preset_to_scratch: {
        Args: { p_preset_id: number; p_scratch_type: string }
        Returns: undefined
      }
      approve_conversion: {
        Args: { p_admin_user_id: string; p_conversion_id: string }
        Returns: {
          message: string
          success: boolean
        }[]
      }
      audit_financial_consistency: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      calculate_auto_weight_by_value: {
        Args: { item_value: number }
        Returns: number
      }
      calculate_user_level: {
        Args: { experience: number }
        Returns: {
          benefits: Json
          color: string
          icon: string
          level: number
          name: string
        }[]
      }
      check_admin_direct: {
        Args: { user_id_check: string }
        Returns: boolean
      }
      check_user_role: {
        Args: { p_role: string; p_user_id: string }
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
        Args: { p_amount: number; p_description?: string; p_user_id: string }
        Returns: {
          preference_id: string
          transaction_id: string
        }[]
      }
      event_log_add: {
        Args: {
          p_admin_id: string
          p_details: Json
          p_event_type: string
          p_ref_id: string
          p_user_id: string
        }
        Returns: undefined
      }
      expire_old_manual_releases: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_referral_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_conversion_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          amount_today: number
          avg_conversion_amount: number
          completed_today: number
          pending_approvals: number
          total_amount: number
          total_conversions: number
        }[]
      }
      get_daily_conversion_data: {
        Args: { days_back?: number }
        Returns: {
          date: string
          total_amount: number
          total_conversions: number
          unique_users: number
        }[]
      }
      get_next_programmed_prize: {
        Args: { p_scratch_type: string; p_user_id?: string }
        Returns: {
          item_id: string
          metadata: Json
          priority: number
          prize_id: string
          target_criteria: Json
        }[]
      }
      get_ranking_top10: {
        Args: Record<PropertyKey, never>
        Returns: {
          full_name: string
          id: string
          level: number
          level_title: string
          total_prizes_won: number
          total_spent: number
        }[]
      }
      get_user_ranking_position: {
        Args: { user_id_input: string }
        Returns: {
          full_name: string
          id: string
          level: number
          level_title: string
          position: number
          total_prizes_won: number
          total_spent: number
        }[]
      }
      initialize_cash_control_system: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      is_admin_role: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_valid_email: {
        Args: { input_text: string }
        Returns: boolean
      }
      is_valid_phone: {
        Args: { input_text: string }
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          p_action_type: string
          p_admin_user_id: string
          p_affected_record_id?: string
          p_affected_table?: string
          p_description: string
          p_metadata?: Json
          p_new_data?: Json
          p_old_data?: Json
        }
        Returns: string
      }
      log_user_activity: {
        Args: {
          p_activity_type: string
          p_description: string
          p_experience_gained?: number
          p_metadata?: Json
          p_user_id: string
        }
        Returns: string
      }
      migrate_chest_data: {
        Args: { items_data: Json }
        Returns: {
          error_count: number
          errors: string[]
          migrated_count: number
          updated_count: number
        }[]
      }
      open_chest: {
        Args: { p_chest_id: string; p_item_id: string; p_user_id: string }
        Returns: boolean
      }
      process_excel_import: {
        Args: { column_mapping: Json; excel_data: Json; import_id: string }
        Returns: boolean
      }
      process_mercadopago_webhook: {
        Args: {
          p_payment_id: string
          p_payment_status: string
          p_preference_id: string
          p_webhook_data: Json
        }
        Returns: boolean
      }
      process_monetary_conversion: {
        Args: {
          p_conversion_amount: number
          p_inventory_id: string
          p_item_id: string
          p_user_id: string
        }
        Returns: {
          conversion_id: string
          message: string
          status: string
        }[]
      }
      process_money_item_redemption: {
        Args: {
          p_inventory_id: string
          p_item_id: string
          p_redemption_amount: number
          p_user_id: string
        }
        Returns: {
          message: string
          redemption_id: string
          status: string
        }[]
      }
      process_referral_signup: {
        Args: {
          p_ip_address?: string
          p_referral_code: string
          p_referral_source?: string
          p_referred_user_id: string
          p_user_agent?: string
        }
        Returns: boolean
      }
      process_scratch_card_game: {
        Args: {
          p_game_price: number
          p_has_win?: boolean
          p_scratch_type: string
          p_symbols: Json
          p_user_id: string
          p_winning_amount?: number
          p_winning_item_id?: string
        }
        Returns: {
          game_id: string
          message: string
          success: boolean
          wallet_balance: number
        }[]
      }
      purchase_chest: {
        Args: { p_chest_type: string; p_price: number; p_user_id: string }
        Returns: string
      }
      reject_conversion: {
        Args: {
          p_admin_user_id: string
          p_conversion_id: string
          p_rejection_reason: string
        }
        Returns: {
          message: string
          success: boolean
        }[]
      }
      reset_demo_credits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      scratch_effective_probability: {
        Args: {
          p_global: number
          p_influencer: number
          p_is_influencer: boolean
          p_normal: number
        }
        Returns: number
      }
      scratch_validate_payout: {
        Args: {
          p_bank_balance: number
          p_min_bank_balance: number
          p_pay_upto_percentage: number
          p_payout_mode: string
          p_requested: number
        }
        Returns: boolean
      }
      validate_balance_operation: {
        Args: { p_amount: number; p_operation_type: string; p_user_id: string }
        Returns: boolean
      }
      validate_cpf_for_withdrawal: {
        Args: { cpf_input: string }
        Returns: boolean
      }
      validate_monetary_conversion: {
        Args: {
          p_conversion_amount: number
          p_item_id: string
          p_user_id: string
        }
        Returns: {
          conversion_count: number
          daily_total: number
          error_message: string
          is_valid: boolean
          requires_approval: boolean
        }[]
      }
      validate_money_item_redemption: {
        Args: {
          p_item_id: string
          p_redemption_amount: number
          p_user_id: string
        }
        Returns: {
          daily_total: number
          error_message: string
          is_valid: boolean
          redemption_count: number
          requires_approval: boolean
          security_score: number
        }[]
      }
      wallet_cashout_mark_paid: {
        Args: { p_payout_id: string; p_provider_payout_id: string }
        Returns: undefined
      }
      wallet_cashout_mark_processing: {
        Args: { p_payout_id: string; p_provider_payout_id: string }
        Returns: undefined
      }
      wallet_cashout_refund: {
        Args: { p_payout_id: string; p_reason?: string }
        Returns: undefined
      }
      wallet_cashout_request: {
        Args: {
          p_amount_cents: number
          p_description?: string
          p_pix_key: string
          p_pix_key_type: string
          p_user_id: string
        }
        Returns: string
      }
      wallet_credit_pix: {
        Args: {
          p_amount_cents: number
          p_payment_id: string
          p_provider_payment_id: string
          p_user_id: string
        }
        Returns: undefined
      }
      wallet_get_available_balance: {
        Args: { p_user_id: string }
        Returns: number
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
