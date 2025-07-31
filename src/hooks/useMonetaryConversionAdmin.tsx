import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface ConversionStats {
  total_conversions: number;
  total_amount: number;
  pending_approvals: number;
  completed_today: number;
  amount_today: number;
  avg_conversion_amount: number;
}

interface PendingApproval {
  id: string;
  user_id: string;
  conversion_amount: number;
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
  conversion_id?: string;
  alert_data: any;
  is_resolved: boolean;
  created_at: string;
  user_email: string;
  user_name: string;
}

interface DailyConversionData {
  date: string;
  total_conversions: number;
  total_amount: number;
  unique_users: number;
}

export const useMonetaryConversionAdmin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<ConversionStats | null>(null);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [dailyData, setDailyData] = useState<DailyConversionData[]>([]);

  // Buscar estatísticas gerais
  const fetchStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_conversion_stats');
      
      if (error) {
        console.error('Erro ao buscar estatísticas:', error);
        return;
      }

      setStats(data[0] || {
        total_conversions: 0,
        total_amount: 0,
        pending_approvals: 0,
        completed_today: 0,
        amount_today: 0,
        avg_conversion_amount: 0
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  // Buscar conversões pendentes de aprovação
  const fetchPendingApprovals = async () => {
    try {
      const { data, error } = await supabase
        .from('monetary_conversions')
        .select(`
          id,
          user_id,
          conversion_amount,
          created_at,
          item_id,
          profiles:user_id (
            email,
            full_name
          ),
          items:item_id (
            name,
            category
          )
        `)
        .eq('approval_status', 'pending_approval')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar aprovações pendentes:', error);
        return;
      }

      const formattedData = data?.map(item => ({
        id: item.id,
        user_id: item.user_id,
        conversion_amount: item.conversion_amount,
        created_at: item.created_at,
        user_email: item.profiles?.email || 'Email não encontrado',
        user_name: item.profiles?.full_name || 'Nome não encontrado',
        item_name: item.items?.name || 'Item não encontrado',
        item_category: item.items?.category || 'Categoria não encontrada'
      })) || [];

      setPendingApprovals(formattedData);
    } catch (error) {
      console.error('Erro ao buscar aprovações pendentes:', error);
    }
  };

  // Buscar alertas de segurança
  const fetchSecurityAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('conversion_security_alerts')
        .select(`
          id,
          user_id,
          alert_type,
          alert_level,
          conversion_id,
          alert_data,
          is_resolved,
          created_at,
          profiles:user_id (
            email,
            full_name
          )
        `)
        .eq('is_resolved', false)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Erro ao buscar alertas:', error);
        return;
      }

      const formattedData = data?.map(alert => ({
        id: alert.id,
        user_id: alert.user_id,
        alert_type: alert.alert_type,
        alert_level: alert.alert_level,
        conversion_id: alert.conversion_id,
        alert_data: alert.alert_data,
        is_resolved: alert.is_resolved,
        created_at: alert.created_at,
        user_email: alert.profiles?.email || 'Email não encontrado',
        user_name: alert.profiles?.full_name || 'Nome não encontrado'
      })) || [];

      setSecurityAlerts(formattedData);
    } catch (error) {
      console.error('Erro ao buscar alertas:', error);
    }
  };

  // Buscar dados diários para gráficos
  const fetchDailyData = async (days: number = 30) => {
    try {
      const { data, error } = await supabase.rpc('get_daily_conversion_data', {
        days_back: days
      });

      if (error) {
        console.error('Erro ao buscar dados diários:', error);
        return;
      }

      setDailyData(data || []);
    } catch (error) {
      console.error('Erro ao buscar dados diários:', error);
    }
  };

  // Aprovar conversão manualmente
  const approveConversion = async (conversionId: string): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('approve_conversion', {
        p_conversion_id: conversionId,
        p_admin_user_id: user.id
      });

      if (error) {
        console.error('Erro ao aprovar conversão:', error);
        toast({
          title: "Erro",
          description: "Não foi possível aprovar a conversão",
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Conversão aprovada!",
        description: "A conversão foi processada com sucesso",
        variant: "default"
      });

      // Recarregar dados
      await Promise.all([
        fetchPendingApprovals(),
        fetchStats(),
        fetchSecurityAlerts()
      ]);

      return true;
    } catch (error) {
      console.error('Erro ao aprovar conversão:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao aprovar conversão",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Rejeitar conversão
  const rejectConversion = async (conversionId: string, reason: string): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('reject_conversion', {
        p_conversion_id: conversionId,
        p_admin_user_id: user.id,
        p_rejection_reason: reason
      });

      if (error) {
        console.error('Erro ao rejeitar conversão:', error);
        toast({
          title: "Erro",
          description: "Não foi possível rejeitar a conversão",
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Conversão rejeitada",
        description: "A conversão foi rejeitada",
        variant: "default"
      });

      // Recarregar dados
      await Promise.all([
        fetchPendingApprovals(),
        fetchStats(),
        fetchSecurityAlerts()
      ]);

      return true;
    } catch (error) {
      console.error('Erro ao rejeitar conversão:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao rejeitar conversão",
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
        .from('conversion_security_alerts')
        .update({
          is_resolved: true,
          resolved_by: user.id,
          resolved_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) {
        console.error('Erro ao resolver alerta:', error);
        toast({
          title: "Erro",
          description: "Não foi possível resolver o alerta",
          variant: "destructive"
        });
        return false;
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
        fetchPendingApprovals(),
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
      fetchPendingApprovals();
      fetchSecurityAlerts();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    loading,
    stats,
    pendingApprovals,
    securityAlerts,
    dailyData,
    approveConversion,
    rejectConversion,
    resolveAlert,
    refreshAllData,
    fetchDailyData
  };
};