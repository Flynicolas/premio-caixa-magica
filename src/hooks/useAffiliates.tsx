import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

// Tipos para Afiliados
export interface AffiliateData {
  user_id: string;
  ref_code: string;
  status: 'pending' | 'approved' | 'blocked';
  upline1?: string;
  upline2?: string;
  upline3?: string;
  auto_payout_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface AffiliateOverview {
  affiliate_id: string;
  ref_code: string;
  status: string;
  total_gerado_cents: number;
  aprovado_cents: number;
  pago_cents: number;
  pendente_cents: number;
  total_indicados: number;
}

export interface AffiliateMetrics {
  affiliate_id: string;
  cliques: number;
  cadastros: number;
  usuarios_depositaram: number;
  total_depositos: number;
  taxa_conversao_cadastro: number;
  taxa_conversao_deposito: number;
}

export interface AffiliateCommission {
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
}

export interface AffiliateSettings {
  id: boolean;
  plan_type: 'revshare' | 'cpa' | 'ngr' | 'hybrid';
  revshare_l1: number;
  revshare_l2: number;
  revshare_l3: number;
  cpa_l1_cents: number;
  cpa_l2_cents: number;
  cpa_l3_cents: number;
  ngr_l1: number;
  ngr_l2: number;
  ngr_l3: number;
  cpa_trigger_min_deposit_cents: number;
  payout_min_cents: number;
  payout_day_of_week: number;
  payout_hour: number;
  require_manual_approval: boolean;
  negative_carryover: boolean;
  updated_at: string;
}

export interface AffiliateAsset {
  id: number;
  title: string;
  description?: string;
  url: string;
  tags: string[];
  active: boolean;
  created_at: string;
}

export const useAffiliates = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [affiliateData, setAffiliateData] = useState<AffiliateData | null>(null);
  const [overview, setOverview] = useState<AffiliateOverview | null>(null);
  const [metrics, setMetrics] = useState<AffiliateMetrics | null>(null);
  const [commissions, setCommissions] = useState<AffiliateCommission[]>([]);
  const [settings, setSettings] = useState<AffiliateSettings | null>(null);
  const [assets, setAssets] = useState<AffiliateAsset[]>([]);
  const [loading, setLoading] = useState(true);

  // Verificar se usuário é afiliado
  const fetchAffiliateData = useCallback(async () => {
    if (!user) {
      setAffiliateData(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('affiliates')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setAffiliateData(data as AffiliateData);
    } catch (error) {
      console.error('Erro ao carregar dados do afiliado:', error);
    }
  }, [user]);

  // Buscar overview do afiliado
  const fetchOverview = useCallback(async () => {
    if (!user || !affiliateData) return;

    try {
      const { data, error } = await supabase
        .from('v_affiliate_overview')
        .select('*')
        .eq('affiliate_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setOverview(data);
    } catch (error) {
      console.error('Erro ao carregar overview:', error);
    }
  }, [user, affiliateData]);

  // Buscar métricas do afiliado
  const fetchMetrics = useCallback(async () => {
    if (!user || !affiliateData) return;

    try {
      const { data, error } = await supabase
        .from('v_affiliate_metrics')
        .select('*')
        .eq('affiliate_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setMetrics(data);
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    }
  }, [user, affiliateData]);

  // Buscar comissões
  const fetchCommissions = useCallback(async (status?: string, limit: number = 50) => {
    if (!user || !affiliateData) return;

    try {
      let query = supabase
        .from('affiliate_commissions')
        .select('*')
        .eq('affiliate_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      setCommissions(data as AffiliateCommission[] || []);
    } catch (error) {
      console.error('Erro ao carregar comissões:', error);
    }
  }, [user, affiliateData]);

  // Buscar configurações do programa
  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('affiliate_settings')
        .select('*')
        .eq('id', true)
        .maybeSingle();

      if (error) throw error;
      setSettings(data as AffiliateSettings);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  }, []);

  // Buscar materiais de marketing
  const fetchAssets = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('affiliate_assets')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssets(data || []);
    } catch (error) {
      console.error('Erro ao carregar materiais:', error);
    }
  }, []);

  // Solicitar para ser afiliado
  const requestAffiliation = useCallback(async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para se tornar afiliado.",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Gerar código único
      const { data: refCode, error: codeError } = await supabase
        .rpc('gen_ref_code');

      if (codeError) throw codeError;

      // Criar afiliado
      const { error } = await supabase
        .from('affiliates')
        .insert({
          user_id: user.id,
          ref_code: refCode,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Solicitação enviada!",
        description: "Sua solicitação para se tornar afiliado foi enviada. Aguarde aprovação.",
        variant: "default"
      });

      await fetchAffiliateData();
      return true;
    } catch (error: any) {
      console.error('Erro ao solicitar afiliação:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao enviar solicitação.",
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast, fetchAffiliateData]);

  // Registrar clique no link de referência
  const trackClick = useCallback(async (
    refCode: string, 
    utmParams?: {
      utm_source?: string;
      utm_medium?: string;
      utm_campaign?: string;
      utm_content?: string;
      utm_term?: string;
    }
  ) => {
    try {
      const { error } = await supabase
        .from('affiliate_clicks')
        .insert({
          ref_code: refCode,
          utm_source: utmParams?.utm_source,
          utm_medium: utmParams?.utm_medium,
          utm_campaign: utmParams?.utm_campaign,
          utm_content: utmParams?.utm_content,
          utm_term: utmParams?.utm_term,
          landing_path: window.location.pathname + window.location.search
        });

      if (error) throw error;
      console.log('Clique registrado para:', refCode);
    } catch (error) {
      console.error('Erro ao registrar clique:', error);
    }
  }, []);

  // Gerar link de referência
  const generateReferralLink = useCallback((utmParams?: Record<string, string>) => {
    if (!affiliateData?.ref_code) return '';
    
    const baseUrl = `${window.location.origin}/${affiliateData.ref_code}`;
    
    if (!utmParams || Object.keys(utmParams).length === 0) {
      return baseUrl;
    }

    const params = new URLSearchParams();
    Object.entries(utmParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    return `${baseUrl}?${params.toString()}`;
  }, [affiliateData?.ref_code]);

  // Copiar link de referência
  const copyReferralLink = useCallback(async (utmParams?: Record<string, string>) => {
    const link = generateReferralLink(utmParams);
    if (!link) return false;

    try {
      await navigator.clipboard.writeText(link);
      toast({
        title: "Link copiado!",
        description: "Seu link de afiliado foi copiado para a área de transferência.",
        variant: "default"
      });
      return true;
    } catch (error) {
      console.error('Erro ao copiar link:', error);
      toast({
        title: "Erro",
        description: "Não foi possível copiar o link.",
        variant: "destructive"
      });
      return false;
    }
  }, [generateReferralLink, toast]);

  // Compartilhar no WhatsApp
  const shareOnWhatsApp = useCallback((message?: string, utmParams?: Record<string, string>) => {
    const link = generateReferralLink(utmParams);
    if (!link) return;

    const defaultMessage = `🎯 Venha jogar no Baú Premiado e ganhe prêmios incríveis! ${link}`;
    const encodedMessage = encodeURIComponent(message || defaultMessage);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  }, [generateReferralLink]);

  // Compartilhar no Telegram
  const shareOnTelegram = useCallback((message?: string, utmParams?: Record<string, string>) => {
    const link = generateReferralLink(utmParams);
    if (!link) return;

    const defaultMessage = `🎯 Venha jogar no Baú Premiado e ganhe prêmios incríveis! ${link}`;
    const encodedMessage = encodeURIComponent(message || defaultMessage);
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodedMessage}`;
    
    window.open(telegramUrl, '_blank');
  }, [generateReferralLink]);

  // Atualizar todos os dados
  const refreshData = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchAffiliateData(),
      fetchSettings(),
      fetchAssets()
    ]);
    
    // Aguardar um pouco para garantir que affiliateData foi atualizado
    setTimeout(async () => {
      await Promise.all([
        fetchOverview(),
        fetchMetrics(),
        fetchCommissions()
      ]);
      setLoading(false);
    }, 100);
  }, [fetchAffiliateData, fetchOverview, fetchMetrics, fetchCommissions, fetchSettings, fetchAssets]);

  // Carregar dados iniciais
  useEffect(() => {
    if (user) {
      refreshData();
    } else {
      setLoading(false);
    }
  }, [user, refreshData]);

  // Verificar se é afiliado
  const isAffiliate = affiliateData !== null;
  const isApprovedAffiliate = affiliateData?.status === 'approved';

  return {
    // Estados
    affiliateData,
    overview,
    metrics,
    commissions,
    settings,
    assets,
    loading,
    
    // Status
    isAffiliate,
    isApprovedAffiliate,
    
    // Ações
    requestAffiliation,
    trackClick,
    generateReferralLink,
    copyReferralLink,
    shareOnWhatsApp,
    shareOnTelegram,
    fetchCommissions,
    refreshData
  };
};