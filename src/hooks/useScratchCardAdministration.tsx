import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ScratchCardFinancialData {
  id: string;
  scratch_type: string;
  date: string;
  total_sales: number;
  total_prizes_given: number;
  net_profit: number;
  cards_played: number;
  profit_goal: number;
  goal_reached: boolean;
  percentage_profit: number;
  percentage_prizes: number;
  daily_budget_prizes: number;
  remaining_budget: number;
}

interface ScratchCardSettings {
  id: string;
  scratch_type: string;
  name: string;
  price: number;
  house_edge: number;
  win_probability: number;
  is_active: boolean;
}

export const useScratchCardAdministration = () => {
  const [financialData, setFinancialData] = useState<ScratchCardFinancialData[]>([]);
  const [settings, setSettings] = useState<ScratchCardSettings[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar dados financeiros e configurações
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar dados financeiros
      const { data: financialResult, error: financialError } = await supabase
        .from('scratch_card_financial_control')
        .select('*')
        .eq('date', new Date().toISOString().split('T')[0])
        .order('scratch_type');

      if (financialError) throw financialError;

      // Carregar configurações
      const { data: settingsResult, error: settingsError } = await supabase
        .from('scratch_card_settings')
        .select('*')
        .eq('is_active', true)
        .order('price');

      if (settingsError) throw settingsError;

      setFinancialData(financialResult || []);
      setSettings(settingsResult || []);
    } catch (error) {
      console.error('Erro ao carregar dados das raspadinhas:', error);
      toast.error('Erro ao carregar dados das raspadinhas');
    } finally {
      setLoading(false);
    }
  };

  // Atualizar configurações de percentual
  const updatePercentages = async (
    scratchType: string, 
    percentageProfit: number, 
    percentagePrizes: number
  ) => {
    try {
      const { error } = await supabase
        .from('scratch_card_financial_control')
        .update({
          percentage_profit: percentageProfit,
          percentage_prizes: percentagePrizes,
          updated_at: new Date().toISOString()
        })
        .eq('scratch_type', scratchType)
        .eq('date', new Date().toISOString().split('T')[0]);

      if (error) throw error;

      // Atualizar também as configurações gerais
      await supabase
        .from('scratch_card_settings')
        .update({
          house_edge: percentageProfit,
          win_probability: percentagePrizes,
          updated_at: new Date().toISOString()
        })
        .eq('scratch_type', scratchType);

      toast.success('Percentuais atualizados com sucesso!');
      await loadData();
    } catch (error) {
      console.error('Erro ao atualizar percentuais:', error);
      toast.error('Erro ao atualizar percentuais');
    }
  };

  // Atualizar meta de lucro
  const updateProfitGoal = async (scratchType: string, newGoal: number) => {
    try {
      const { error } = await supabase
        .from('scratch_card_financial_control')
        .update({
          profit_goal: newGoal,
          updated_at: new Date().toISOString()
        })
        .eq('scratch_type', scratchType)
        .eq('date', new Date().toISOString().split('T')[0]);

      if (error) throw error;

      toast.success('Meta de lucro atualizada com sucesso!');
      await loadData();
    } catch (error) {
      console.error('Erro ao atualizar meta de lucro:', error);
      toast.error('Erro ao atualizar meta de lucro');
    }
  };

  // Resetar estatísticas
  const resetStats = async (scratchType: string) => {
    try {
      const { error } = await supabase
        .from('scratch_card_financial_control')
        .update({
          total_sales: 0,
          total_prizes_given: 0,
          net_profit: 0,
          cards_played: 0,
          goal_reached: false,
          daily_budget_prizes: 0,
          remaining_budget: 0,
          updated_at: new Date().toISOString()
        })
        .eq('scratch_type', scratchType)
        .eq('date', new Date().toISOString().split('T')[0]);

      if (error) throw error;

      toast.success('Estatísticas resetadas com sucesso!');
      await loadData();
    } catch (error) {
      console.error('Erro ao resetar estatísticas:', error);
      toast.error('Erro ao resetar estatísticas');
    }
  };

  // Atualizar orçamento diário de prêmios
  const updateDailyBudget = async (scratchType: string, budget: number) => {
    try {
      const { error } = await supabase
        .from('scratch_card_financial_control')
        .update({
          daily_budget_prizes: budget,
          remaining_budget: budget,
          updated_at: new Date().toISOString()
        })
        .eq('scratch_type', scratchType)
        .eq('date', new Date().toISOString().split('T')[0]);

      if (error) throw error;

      toast.success('Orçamento diário atualizado com sucesso!');
      await loadData();
    } catch (error) {
      console.error('Erro ao atualizar orçamento:', error);
      toast.error('Erro ao atualizar orçamento');
    }
  };

  // Configurar listener para atualizações em tempo real
  useEffect(() => {
    loadData();

    const channel = supabase
      .channel('scratch-card-administration')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scratch_card_financial_control'
        },
        () => {
          loadData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scratch_card_settings'
        },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    financialData,
    settings,
    loading,
    updatePercentages,
    updateProfitGoal,
    resetStats,
    updateDailyBudget,
    refetchData: loadData
  };
};