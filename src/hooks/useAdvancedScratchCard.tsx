import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ScratchCardSettings {
  id: string;
  scratch_type: string;
  name: string;
  price: number;
  price_display: number;
  backend_cost: number;
  category: string;
  sort_order: number;
  win_probability_global: number;
  win_probability_influencer?: number;
  win_probability_normal?: number;
  house_edge: number;
  is_active: boolean;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

interface ScratchCardPreset {
  id: number;
  name: string;
  win_probability_global: number;
  pay_upto_percentage: number;
  description: string;
  created_at: string;
}

interface EventLog {
  id: number;
  event_type: string;
  user_id?: string;
  admin_id?: string;
  ref_id?: string;
  details: any;
  created_at: string;
}

interface BankControl {
  scratch_type: string;
  payout_mode: string;
  pay_upto_percentage?: number;
  min_bank_balance?: number;
  bank_balance: number;
  total_sales: number;
  total_prizes_given: number;
  net_profit: number;
}

export const useAdvancedScratchCard = () => {
  const [scratchCards, setScratchCards] = useState<ScratchCardSettings[]>([]);
  const [presets, setPresets] = useState<ScratchCardPreset[]>([]);
  const [eventLogs, setEventLogs] = useState<EventLog[]>([]);
  const [bankControls, setBankControls] = useState<BankControl[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar dados iniciais
  const loadData = async () => {
    try {
      setLoading(true);

      // Carregar configurações de raspadinhas
      const { data: scratchData, error: scratchError } = await supabase
        .from('scratch_card_settings')
        .select('*')
        .order('sort_order', { ascending: true });

      if (scratchError) throw scratchError;

      // Carregar presets
      const { data: presetsData, error: presetsError } = await supabase
        .from('scratch_card_presets')
        .select('*')
        .order('name');

      if (presetsError) throw presetsError;

      // Carregar logs recentes
      const { data: logsData, error: logsError } = await supabase
        .from('event_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (logsError) throw logsError;

      // Carregar controles financeiros
      const { data: bankData, error: bankError } = await supabase
        .from('scratch_card_financial_control')
        .select('*')
        .eq('date', new Date().toISOString().split('T')[0]);

      if (bankError) throw bankError;

      setScratchCards(scratchData || []);
      setPresets(presetsData || []);
      setEventLogs(logsData || []);
      setBankControls(bankData || []);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados das raspadinhas');
    } finally {
      setLoading(false);
    }
  };

  // Aplicar configurações padrão seguras
  const applySafeDefaults = async () => {
    const safeDefaults = {
      pix: { win_probability_global: 8, target_rtp: 25 },
      sorte: { win_probability_global: 10, target_rtp: 30 },
      dupla: { win_probability_global: 12, target_rtp: 35 },
      ouro: { win_probability_global: 8, target_rtp: 40 },
      diamante: { win_probability_global: 6, target_rtp: 45 },
      premium: { win_probability_global: 5, target_rtp: 50 }
    };

    try {
      for (const [scratchType, defaults] of Object.entries(safeDefaults)) {
        await updateScratchCard(scratchType, defaults);
      }
      toast.success('Configurações seguras aplicadas a todas as raspadinhas');
    } catch (error) {
      toast.error('Erro ao aplicar configurações seguras');
    }
  };

  // Atualizar configuração de raspadinha
  const updateScratchCard = async (scratchType: string, updates: Partial<ScratchCardSettings>) => {
    try {
      const { error } = await supabase
        .from('scratch_card_settings')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('scratch_type', scratchType);

      if (error) throw error;

      // Log da ação
      await supabase.rpc('event_log_add', {
        p_event_type: 'SCRATCH_CONFIG_UPDATED',
        p_user_id: null,
        p_admin_id: (await supabase.auth.getUser()).data.user?.id,
        p_ref_id: null,
        p_details: {
          scratch_type: scratchType,
          updates: updates
        }
      });

      toast.success('Configuração atualizada com sucesso');
      await loadData();
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      toast.error('Erro ao atualizar configuração');
    }
  };

  // Aplicar preset
  const applyPreset = async (scratchType: string, presetId: number) => {
    try {
      const { error } = await supabase.rpc('apply_preset_to_scratch', {
        p_scratch_type: scratchType,
        p_preset_id: presetId
      });

      if (error) throw error;

      toast.success('Preset aplicado com sucesso');
      await loadData();
    } catch (error) {
      console.error('Erro ao aplicar preset:', error);
      toast.error('Erro ao aplicar preset');
    }
  };

  // Atualizar controle da banca
  const updateBankControl = async (scratchType: string, updates: Partial<BankControl>) => {
    try {
      const { error } = await supabase
        .from('scratch_card_financial_control')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('scratch_type', scratchType)
        .eq('date', new Date().toISOString().split('T')[0]);

      if (error) throw error;

      // Log da ação
      await supabase.rpc('event_log_add', {
        p_event_type: 'BANK_CONTROL_UPDATED',
        p_user_id: null,
        p_admin_id: (await supabase.auth.getUser()).data.user?.id,
        p_ref_id: null,
        p_details: {
          scratch_type: scratchType,
          updates: updates
        }
      });

      toast.success('Controle da banca atualizado');
      await loadData();
    } catch (error) {
      console.error('Erro ao atualizar controle da banca:', error);
      toast.error('Erro ao atualizar controle da banca');
    }
  };

  // Simular jogo como usuário
  const simulateGame = async (scratchType: string, userId?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('play-scratch-card', {
        body: {
          scratch_type: scratchType,
          simulate: true,
          simulate_user_id: userId
        }
      });

      if (error) throw error;

      toast.success('Simulação executada com sucesso');
      await loadData(); // Recarregar logs
      return data;
    } catch (error) {
      console.error('Erro na simulação:', error);
      toast.error('Erro ao executar simulação');
    }
  };

  useEffect(() => {
    loadData();

    // Listener para atualizações em tempo real
    const channel = supabase
      .channel('advanced-scratch-admin')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'scratch_card_settings'
      }, () => loadData())
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'scratch_card_financial_control'
      }, () => loadData())
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'event_log'
      }, () => loadData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    scratchCards,
    presets,
    eventLogs,
    bankControls,
    loading,
    updateScratchCard,
    applyPreset,
    updateBankControl,
    simulateGame,
    applySafeDefaults,
    refetch: loadData
  };
};