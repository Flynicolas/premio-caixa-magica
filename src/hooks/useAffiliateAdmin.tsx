import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { useAdminCheck } from './useAdminCheck';

// Tipos administrativos para afiliados  
export interface AffiliateAdminUser {
  user_id: string;
  ref_code: string;
  status: 'pending' | 'approved' | 'blocked';
  upline1?: string;
  upline2?: string;
  upline3?: string;
  auto_payout_enabled: boolean;
  created_at: string;
  updated_at: string;
  // Dados do usuário
  profiles?: {
    full_name?: string;
    email?: string;
  };
}

export interface AffiliateAdminOverview {
  total_affiliates: number;
  pending_approvals: number;
  active_affiliates: number;
  blocked_affiliates: number;
  total_commissions_cents: number;
  pending_commissions_cents: number;
  approved_commissions_cents: number;
  paid_commissions_cents: number;
}

export interface CommissionAdminView {
  id: number;
  affiliate_id: string;
  referred_user: string;
  level: number;
  kind: 'revshare' | 'cpa' | 'ngr';
  base_amount_cents: number;
  rate: number;
  amount_cents: number;
  period_start: string;
  period_end: string;
  status: 'accrued' | 'approved' | 'paid' | 'rejected';
  source_ref?: string;
  created_at: string;
  approved_by?: string;
  approved_at?: string;
  paid_at?: string;
  // Dados expandidos
  affiliate_name?: string;
  affiliate_ref_code?: string;
  referred_user_name?: string;
}

export const useAffiliateAdmin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isAdmin } = useAdminCheck();
  
  const [affiliates, setAffiliates] = useState<AffiliateAdminUser[]>([]);
  const [overview, setOverview] = useState<AffiliateAdminOverview | null>(null);
  const [commissions, setCommissions] = useState<CommissionAdminView[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Buscar todos os afiliados
  const fetchAffiliates = useCallback(async (status?: string) => {
    if (!user || !isAdmin) return;

    try {
      let query = supabase
        .from('affiliates')
        .select(`
          *,
          profiles!inner(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      setAffiliates(data as AffiliateAdminUser[] || []);
    } catch (error) {
      console.error('Erro ao carregar afiliados:', error);
    }
  }, [user, isAdmin]);

  // Buscar overview administrativo
  const fetchOverview = useCallback(async () => {
    if (!user || !isAdmin) return;

    try {
      // Buscar contadores de afiliados
      const { data: affiliateStats } = await supabase
        .from('affiliates')
        .select('status');

      const totalAffiliates = affiliateStats?.length || 0;
      const pendingApprovals = affiliateStats?.filter(a => a.status === 'pending').length || 0;
      const activeAffiliates = affiliateStats?.filter(a => a.status === 'approved').length || 0;
      const blockedAffiliates = affiliateStats?.filter(a => a.status === 'blocked').length || 0;

      // Buscar estatísticas de comissões
      const { data: commissionStats } = await supabase
        .from('affiliate_commissions')
        .select('status, amount_cents');

      const totalCommissions = commissionStats?.reduce((sum, c) => sum + c.amount_cents, 0) || 0;
      const pendingCommissions = commissionStats
        ?.filter(c => c.status === 'accrued')
        .reduce((sum, c) => sum + c.amount_cents, 0) || 0;
      const approvedCommissions = commissionStats
        ?.filter(c => c.status === 'approved')
        .reduce((sum, c) => sum + c.amount_cents, 0) || 0;
      const paidCommissions = commissionStats
        ?.filter(c => c.status === 'paid')
        .reduce((sum, c) => sum + c.amount_cents, 0) || 0;

      setOverview({
        total_affiliates: totalAffiliates,
        pending_approvals: pendingApprovals,
        active_affiliates: activeAffiliates,
        blocked_affiliates: blockedAffiliates,
        total_commissions_cents: totalCommissions,
        pending_commissions_cents: pendingCommissions,
        approved_commissions_cents: approvedCommissions,
        paid_commissions_cents: paidCommissions
      });
    } catch (error) {
      console.error('Erro ao carregar overview:', error);
    }
  }, [user, isAdmin]);

  // Buscar comissões para admin
  const fetchCommissions = useCallback(async (
    status?: string, 
    affiliateId?: string,
    limit: number = 100
  ) => {
    if (!user || !isAdmin) return;

    try {
      let query = supabase
        .from('affiliate_commissions')
        .select(`
          *,
          affiliate:affiliate_id(ref_code, profiles!inner(full_name)),
          referred:referred_user(profiles!inner(full_name))
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      if (affiliateId) {
        query = query.eq('affiliate_id', affiliateId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Transformar dados para CommissionAdminView
      const transformedData: CommissionAdminView[] = (data || []).map((c: any) => ({
        ...c,
        affiliate_name: c.affiliate?.profiles?.full_name || 'N/A',
        affiliate_ref_code: c.affiliate?.ref_code || 'N/A',
        referred_user_name: c.referred?.profiles?.full_name || 'N/A'
      }));

      setCommissions(transformedData);
    } catch (error) {
      console.error('Erro ao carregar comissões:', error);
    }
  }, [user, isAdmin]);

  // Aprovar afiliado
  const approveAffiliate = useCallback(async (affiliateId: string) => {
    if (!user || !isAdmin) return false;

    try {
      const { error } = await supabase
        .from('affiliates')
        .update({ 
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', affiliateId);

      if (error) throw error;

      toast({
        title: "Afiliado aprovado!",
        description: "O afiliado foi aprovado com sucesso.",
        variant: "default"
      });

      await fetchAffiliates();
      await fetchOverview();
      return true;
    } catch (error: any) {
      console.error('Erro ao aprovar afiliado:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao aprovar afiliado.",
        variant: "destructive"
      });
      return false;
    }
  }, [user, isAdmin, toast, fetchAffiliates, fetchOverview]);

  // Bloquear afiliado
  const blockAffiliate = useCallback(async (affiliateId: string) => {
    if (!user || !isAdmin) return false;

    try {
      const { error } = await supabase
        .from('affiliates')
        .update({ 
          status: 'blocked',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', affiliateId);

      if (error) throw error;

      toast({
        title: "Afiliado bloqueado!",
        description: "O afiliado foi bloqueado com sucesso.",
        variant: "default"
      });

      await fetchAffiliates();
      await fetchOverview();
      return true;
    } catch (error: any) {
      console.error('Erro ao bloquear afiliado:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao bloquear afiliado.",
        variant: "destructive"
      });
      return false;
    }
  }, [user, isAdmin, toast, fetchAffiliates, fetchOverview]);

  // Aprovar comissões em lote
  const approveCommissions = useCallback(async (commissionIds: number[]) => {
    if (!user || !isAdmin) return false;

    try {
      const { error } = await supabase
        .from('affiliate_commissions')
        .update({ 
          status: 'approved',
          approved_by: user.id,
          approved_at: new Date().toISOString()
        })
        .in('id', commissionIds);

      if (error) throw error;

      toast({
        title: "Comissões aprovadas!",
        description: `${commissionIds.length} comissões foram aprovadas com sucesso.`,
        variant: "default"
      });

      await fetchCommissions();
      await fetchOverview();
      return true;
    } catch (error: any) {
      console.error('Erro ao aprovar comissões:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao aprovar comissões.",
        variant: "destructive"
      });
      return false;
    }
  }, [user, isAdmin, toast, fetchCommissions, fetchOverview]);

  // Buscar configurações
  const fetchSettings = useCallback(async () => {
    if (!user || !isAdmin) return;

    try {
      const { data, error } = await supabase
        .from('affiliate_settings')
        .select('*')
        .eq('id', true)
        .maybeSingle();

      if (error) throw error;
      setSettings(data);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  }, [user, isAdmin]);

  // Atualizar configurações
  const updateSettings = useCallback(async (newSettings: Partial<any>) => {
    if (!user || !isAdmin) return false;

    try {
      const { error } = await supabase
        .from('affiliate_settings')
        .update({
          ...newSettings,
          updated_at: new Date().toISOString()
        })
        .eq('id', true);

      if (error) throw error;

      toast({
        title: "Configurações atualizadas!",
        description: "As configurações do programa de afiliados foram atualizadas.",
        variant: "default"
      });

      await fetchSettings();
      return true;
    } catch (error: any) {
      console.error('Erro ao atualizar configurações:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar configurações.",
        variant: "destructive"
      });
      return false;
    }
  }, [user, isAdmin, toast, fetchSettings]);

  // Executar cálculo manual de comissões
  const calculateCommissions = useCallback(async (startDate: string, endDate: string) => {
    if (!user || !isAdmin) return false;

    try {
      const { error } = await supabase
        .rpc('aff_calc_commissions', {
          p_start: startDate,
          p_end: endDate
        });

      if (error) throw error;

      toast({
        title: "Cálculo executado!",
        description: "O cálculo de comissões foi executado com sucesso.",
        variant: "default"
      });

      await fetchCommissions();
      await fetchOverview();
      return true;
    } catch (error: any) {
      console.error('Erro ao calcular comissões:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao calcular comissões.",
        variant: "destructive"
      });
      return false;
    }
  }, [user, isAdmin, toast, fetchCommissions, fetchOverview]);

  // Atualizar todos os dados
  const refreshData = useCallback(async () => {
    if (!user || !isAdmin) {
      setLoading(false);
      return;
    }

    setLoading(true);
    await Promise.all([
      fetchAffiliates(),
      fetchOverview(),
      fetchCommissions(),
      fetchSettings()
    ]);
    setLoading(false);
  }, [user, isAdmin, fetchAffiliates, fetchOverview, fetchCommissions, fetchSettings]);

  // Carregar dados iniciais
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    // Estados
    affiliates,
    overview,
    commissions,
    settings,
    loading,
    
    // Status
    isAdmin,
    
    // Ações
    fetchAffiliates,
    fetchCommissions,
    approveAffiliate,
    blockAffiliate,
    approveCommissions,
    updateSettings,
    calculateCommissions,
    refreshData
  };
};