import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface RedemptionStats {
  total_redemptions: number;
  total_amount: number;
  pending_approvals: number;
  completed_today: number;
  amount_today: number;
  avg_redemption_amount: number;
}

interface PendingRedemption {
  id: string;
  user_id: string;
  redemption_amount: number;
  security_score: number;
  created_at: string;
  user_email: string;
  user_name: string;
  item_name: string;
  item_category: string;
}

interface SecurityAlert {
  id: string;
  user_id: string;
  alert_type: string;
  alert_level: string;
  redemption_id?: string;
  alert_data: any;
  is_resolved: boolean;
  created_at: string;
  user_email: string;
  user_name: string;
}

interface DailyRedemptionData {
  date: string;
  total_redemptions: number;
  total_amount: number;
  unique_users: number;
}

export const useMoneyRedemptionAdmin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<RedemptionStats | null>(null);
  const [pendingRedemptions, setPendingRedemptions] = useState<PendingRedemption[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [dailyData, setDailyData] = useState<DailyRedemptionData[]>([]);

  // Buscar estatísticas gerais
  const fetchStats = async () => {
    try {
      // Buscar estatísticas de resgates
      const { data: redemptions, error: redemptionsError } = await supabase
        .from('money_item_redemptions')
        .select('redemption_amount, redemption_status, created_at');

      if (redemptionsError) {
        console.error('Erro ao buscar estatísticas:', redemptionsError);
        return;
      }

      const completed = redemptions?.filter(r => r.redemption_status === 'completed') || [];
      const pending = redemptions?.filter(r => r.redemption_status === 'pending_approval') || [];
      const today = new Date().toDateString();
      const completedToday = completed.filter(r => new Date(r.created_at).toDateString() === today);

      const calculatedStats: RedemptionStats = {
        total_redemptions: completed.length,
        total_amount: completed.reduce((sum, r) => sum + parseFloat(r.redemption_amount.toString()), 0),
        pending_approvals: pending.length,
        completed_today: completedToday.length,
        amount_today: completedToday.reduce((sum, r) => sum + parseFloat(r.redemption_amount.toString()), 0),
        avg_redemption_amount: completed.length > 0 
          ? completed.reduce((sum, r) => sum + parseFloat(r.redemption_amount.toString()), 0) / completed.length 
          : 0
      };

      setStats(calculatedStats);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  // Buscar resgates pendentes de aprovação
  const fetchPendingRedemptions = async () => {
    try {
      const { data: redemptions, error: redemptionError } = await supabase
        .from('money_item_redemptions')
        .select('*')
        .eq('redemption_status', 'pending_approval')
        .order('created_at', { ascending: false });

      if (redemptionError) {
        console.error('Erro ao buscar aprovações pendentes:', redemptionError);
        return;
      }

      if (!redemptions?.length) {
        setPendingRedemptions([]);
        return;
      }

      // Buscar dados dos usuários e itens
      const userIds = [...new Set(redemptions.map(r => r.user_id))];
      const itemIds = [...new Set(redemptions.map(r => r.item_id))];

      const [{ data: profiles }, { data: items }] = await Promise.all([
        supabase.from('profiles').select('id, email, full_name').in('id', userIds),
        supabase.from('items').select('id, name, category').in('id', itemIds)
      ]);

      const formattedData = redemptions.map(item => {
        const profile = profiles?.find(p => p.id === item.user_id);
        const itemData = items?.find(i => i.id === item.item_id);
        
        return {
          id: item.id,
          user_id: item.user_id,
          redemption_amount: item.redemption_amount,
          security_score: item.security_score,
          created_at: item.created_at,
          user_email: profile?.email || 'Email não encontrado',
          user_name: profile?.full_name || 'Nome não encontrado',
          item_name: itemData?.name || 'Item não encontrado',
          item_category: itemData?.category || 'Categoria não encontrada'
        };
      });

      setPendingRedemptions(formattedData);
    } catch (error) {
      console.error('Erro ao buscar aprovações pendentes:', error);
    }
  };

  // Buscar alertas de segurança
  const fetchSecurityAlerts = async () => {
    try {
      const { data: alerts, error: alertError } = await supabase
        .from('money_redemption_alerts')
        .select('*')
        .eq('is_resolved', false)
        .order('created_at', { ascending: false })
        .limit(20);

      if (alertError) {
        console.error('Erro ao buscar alertas:', alertError);
        return;
      }

      if (!alerts?.length) {
        setSecurityAlerts([]);
        return;
      }

      // Buscar dados dos usuários
      const userIds = [...new Set(alerts.map(a => a.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);

      const formattedData = alerts.map(alert => {
        const profile = profiles?.find(p => p.id === alert.user_id);
        
        return {
          id: alert.id,
          user_id: alert.user_id,
          alert_type: alert.alert_type,
          alert_level: alert.alert_level,
          redemption_id: alert.redemption_id,
          alert_data: alert.alert_data,
          is_resolved: alert.is_resolved,
          created_at: alert.created_at,
          user_email: profile?.email || 'Email não encontrado',
          user_name: profile?.full_name || 'Nome não encontrado'
        };
      });

      setSecurityAlerts(formattedData);
    } catch (error) {
      console.error('Erro ao buscar alertas:', error);
    }
  };

  // Buscar dados diários
  const fetchDailyData = async (days: number = 30) => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: redemptions, error } = await supabase
        .from('money_item_redemptions')
        .select('redemption_amount, user_id, created_at')
        .eq('redemption_status', 'completed')
        .gte('created_at', startDate.toISOString());

      if (error) {
        console.error('Erro ao buscar dados diários:', error);
        return;
      }

      // Agrupar por data
      const dailyGroups: { [key: string]: any[] } = {};
      redemptions?.forEach(redemption => {
        const date = new Date(redemption.created_at).toDateString();
        if (!dailyGroups[date]) {
          dailyGroups[date] = [];
        }
        dailyGroups[date].push(redemption);
      });

      const formattedData = Object.entries(dailyGroups).map(([date, redemptions]) => ({
        date,
        total_redemptions: redemptions.length,
        total_amount: redemptions.reduce((sum, r) => sum + parseFloat(r.redemption_amount.toString()), 0),
        unique_users: new Set(redemptions.map(r => r.user_id)).size
      })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setDailyData(formattedData);
    } catch (error) {
      console.error('Erro ao buscar dados diários:', error);
    }
  };

  // Aprovar resgate manualmente
  const approveRedemption = async (redemptionId: string): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    try {
      // Buscar o resgate
      const { data: redemption, error: fetchError } = await supabase
        .from('money_item_redemptions')
        .select('*')
        .eq('id', redemptionId)
        .single();

      if (fetchError || !redemption) {
        throw new Error('Resgate não encontrado');
      }

      // Buscar carteira do usuário
      const { data: wallet, error: walletError } = await supabase
        .from('user_wallets')
        .select('id')
        .eq('user_id', redemption.user_id)
        .single();

      if (walletError || !wallet) {
        throw new Error('Carteira do usuário não encontrada');
      }

      // Processar em transação
      const { error: updateWalletError } = await supabase
        .from('user_wallets')
        .update({
          balance: redemption.redemption_amount,
          total_deposited: redemption.redemption_amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', wallet.id);

      if (updateWalletError) {
        throw updateWalletError;
      }

      // Marcar item como resgatado
      const { error: updateInventoryError } = await supabase
        .from('user_inventory')
        .update({
          is_redeemed: true,
          redeemed_at: new Date().toISOString()
        })
        .eq('id', redemption.inventory_id);

      if (updateInventoryError) {
        throw updateInventoryError;
      }

      // Criar transação
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: redemption.user_id,
          wallet_id: wallet.id,
          amount: redemption.redemption_amount,
          type: 'money_redemption',
          description: 'Resgate de prêmio em dinheiro (aprovação manual)',
          metadata: {
            redemption_id: redemptionId,
            item_id: redemption.item_id,
            inventory_id: redemption.inventory_id,
            approved_by: user.id
          }
        });

      if (transactionError) {
        throw transactionError;
      }

      // Atualizar status do resgate
      const { error: updateRedemptionError } = await supabase
        .from('money_item_redemptions')
        .update({
          redemption_status: 'completed',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          processed_at: new Date().toISOString()
        })
        .eq('id', redemptionId);

      if (updateRedemptionError) {
        throw updateRedemptionError;
      }

      toast({
        title: "Resgate aprovado!",
        description: "O resgate foi processado com sucesso",
        variant: "default"
      });

      await refreshAllData();
      return true;
    } catch (error) {
      console.error('Erro ao aprovar resgate:', error);
      toast({
        title: "Erro",
        description: "Não foi possível aprovar o resgate",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Rejeitar resgate
  const rejectRedemption = async (redemptionId: string, reason: string): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('money_item_redemptions')
        .update({
          redemption_status: 'rejected',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          metadata: {
            rejection_reason: reason,
            rejected_by: user.id,
            rejected_at: new Date().toISOString()
          }
        })
        .eq('id', redemptionId);

      if (error) {
        throw error;
      }

      toast({
        title: "Resgate rejeitado",
        description: "O resgate foi rejeitado com sucesso",
        variant: "default"
      });

      await refreshAllData();
      return true;
    } catch (error) {
      console.error('Erro ao rejeitar resgate:', error);
      toast({
        title: "Erro",
        description: "Não foi possível rejeitar o resgate",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Resolver alerta de segurança
  const resolveAlert = async (alertId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('money_redemption_alerts')
        .update({
          is_resolved: true,
          resolved_by: user.id,
          resolved_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) {
        throw error;
      }

      toast({
        title: "Alerta resolvido",
        description: "O alerta foi marcado como resolvido",
        variant: "default"
      });

      await fetchSecurityAlerts();
      return true;
    } catch (error) {
      console.error('Erro ao resolver alerta:', error);
      return false;
    }
  };

  // Carregar todos os dados
  const refreshAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchStats(),
        fetchPendingRedemptions(),
        fetchSecurityAlerts(),
        fetchDailyData()
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();
    
    // Configurar atualização automática a cada 30 segundos
    const interval = setInterval(() => {
      fetchStats();
      fetchPendingRedemptions();
      fetchSecurityAlerts();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    loading,
    stats,
    pendingRedemptions,
    securityAlerts,
    dailyData,
    approveRedemption,
    rejectRedemption,
    resolveAlert,
    refreshAllData,
    fetchDailyData
  };
};