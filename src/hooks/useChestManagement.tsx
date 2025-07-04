
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

interface ChestFinancialControl {
  id: string;
  chest_type: string;
  date: string;
  total_sales: number;
  total_prizes_given: number;
  net_profit: number;
  chests_opened: number;
  profit_goal: number;
  goal_reached: boolean;
}

interface ProfitAlert {
  id: string;
  chest_type: string;
  alert_type: 'goal_reached' | 'high_prize_ready' | 'loss_alert';
  message: string;
  is_read: boolean;
  triggered_at: string;
  data?: any;
}

export const useChestManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [financialData, setFinancialData] = useState<ChestFinancialControl[]>([]);
  const [alerts, setAlerts] = useState<ProfitAlert[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar dados financeiros de todos os baús
  const fetchFinancialData = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('chest_financial_control')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setFinancialData(data || []);
    } catch (error) {
      console.error('Erro ao buscar dados financeiros:', error);
    }
  };

  // Buscar alertas não lidos
  const fetchAlerts = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('profit_alerts')
        .select('*')
        .eq('is_read', false)
        .order('triggered_at', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Erro ao buscar alertas:', error);
    }
  };

  // Atualizar dados financeiros após compra de baú
  const updateFinancialData = async (chestType: string, chestPrice: number, prizeValue: number) => {
    try {
      // Buscar ou criar registro do dia atual
      const today = new Date().toISOString().split('T')[0];
      
      const { data: existing, error: fetchError } = await (supabase as any)
        .from('chest_financial_control')
        .select('*')
        .eq('chest_type', chestType)
        .eq('date', today)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      if (existing) {
        // Atualizar registro existente
        const newTotalSales = existing.total_sales + chestPrice;
        const newTotalPrizes = existing.total_prizes_given + prizeValue;
        const newNetProfit = newTotalSales - newTotalPrizes;
        const newChestsOpened = existing.chests_opened + 1;
        const goalReached = newNetProfit >= existing.profit_goal;

        const { error: updateError } = await (supabase as any)
          .from('chest_financial_control')
          .update({
            total_sales: newTotalSales,
            total_prizes_given: newTotalPrizes,
            net_profit: newNetProfit,
            chests_opened: newChestsOpened,
            goal_reached: goalReached,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (updateError) throw updateError;

        // Verificar se deve criar alerta
        if (goalReached && !existing.goal_reached) {
          await createAlert(chestType, 'goal_reached', 
            `Meta de lucro atingida para baú ${chestType}! Lucro atual: R$ ${newNetProfit.toFixed(2)}`);
        }
      } else {
        // Criar novo registro
        const netProfit = chestPrice - prizeValue;
        const { error: insertError } = await (supabase as any)
          .from('chest_financial_control')
          .insert({
            chest_type: chestType,
            date: today,
            total_sales: chestPrice,
            total_prizes_given: prizeValue,
            net_profit: netProfit,
            chests_opened: 1,
            goal_reached: false
          });

        if (insertError) throw insertError;
      }

      await fetchFinancialData();
    } catch (error) {
      console.error('Erro ao atualizar dados financeiros:', error);
    }
  };

  // Criar alerta
  const createAlert = async (chestType: string, alertType: ProfitAlert['alert_type'], message: string, data?: any) => {
    try {
      const { error } = await (supabase as any)
        .from('profit_alerts')
        .insert({
          chest_type: chestType,
          alert_type: alertType,
          message,
          data
        });

      if (error) throw error;
      await fetchAlerts();
    } catch (error) {
      console.error('Erro ao criar alerta:', error);
    }
  };

  // Verificar se deve liberar prêmio caro
  const shouldAllowExpensivePrize = (chestType: string, prizeValue: number): boolean => {
    const todayData = financialData.find(d => 
      d.chest_type === chestType && 
      d.date === new Date().toISOString().split('T')[0]
    );

    if (!todayData) return true; // Se não há dados, permite

    // Se já atingiu a meta, pode liberar prêmios caros
    if (todayData.goal_reached) return true;

    // Se o prêmio vai fazer o lucro ficar muito negativo, bloqueia
    const potentialLoss = todayData.net_profit - prizeValue;
    const maxAllowedLoss = todayData.profit_goal * -0.5; // Permite perda de até 50% da meta

    return potentialLoss >= maxAllowedLoss;
  };

  // Marcar alerta como lido
  const markAlertAsRead = async (alertId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('profit_alerts')
        .update({ is_read: true })
        .eq('id', alertId);

      if (error) throw error;
      await fetchAlerts();
    } catch (error) {
      console.error('Erro ao marcar alerta como lido:', error);
    }
  };

  // Resetar meta de um baú (função administrativa)
  const resetChestGoal = async (chestType: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await (supabase as any)
        .from('chest_financial_control')
        .update({
          goal_reached: false,
          updated_at: new Date().toISOString()
        })
        .eq('chest_type', chestType)
        .eq('date', today);

      if (error) throw error;
      
      await fetchFinancialData();
      
      toast({
        title: "Meta resetada",
        description: `Meta do baú ${chestType} foi resetada com sucesso`,
        variant: "default"
      });
    } catch (error) {
      console.error('Erro ao resetar meta:', error);
      toast({
        title: "Erro ao resetar meta",
        description: "Erro interno do sistema",
        variant: "destructive"
      });
    }
  };

  // Obter estatísticas resumidas
  const getChestStats = (chestType: string) => {
    const todayData = financialData.find(d => 
      d.chest_type === chestType && 
      d.date === new Date().toISOString().split('T')[0]
    );

    return {
      totalSales: todayData?.total_sales || 0,
      totalPrizes: todayData?.total_prizes_given || 0,
      netProfit: todayData?.net_profit || 0,
      chestsOpened: todayData?.chests_opened || 0,
      profitGoal: todayData?.profit_goal || 0,
      goalReached: todayData?.goal_reached || false,
      profitPercentage: todayData ? ((todayData.net_profit / todayData.profit_goal) * 100) : 0
    };
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchFinancialData(), fetchAlerts()]);
      setLoading(false);
    };

    loadData();

    // Configurar atualização em tempo real
    const channel = supabase
      .channel('chest-management')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'chest_financial_control' },
        () => fetchFinancialData()
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'profit_alerts' },
        () => fetchAlerts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    financialData,
    alerts,
    loading,
    updateFinancialData,
    createAlert,
    shouldAllowExpensivePrize,
    markAlertAsRead,
    resetChestGoal,
    getChestStats,
    refreshData: () => Promise.all([fetchFinancialData(), fetchAlerts()])
  };
};
