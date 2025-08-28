import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface AffiliateStats {
  total_clicks: number;
  registrations: number;
  active_referrals: number;
  pending_commissions_cents: number;
  paid_commissions_cents: number;
  this_month_commissions_cents: number;
  conversion_rate: number;
}

interface Commission {
  id: number;
  referred_user: string;
  kind: string;
  level: number;
  amount_cents: number;
  status: string;
  period_start: string;
  period_end: string;
  created_at: string;
  paid_at?: string;
}

interface Click {
  id: number;
  created_at: string;
  ip: unknown;
  landing_path: string;
  utm_source?: string;
  utm_campaign?: string;
  utm_medium?: string;
}

export const useAffiliateDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [clicks, setClicks] = useState<Click[]>([]);
  const [affiliate, setAffiliate] = useState<any>(null);

  const fetchAffiliateData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Buscar dados do afiliado
      const { data: affiliateData, error: affiliateError } = await supabase
        .from('affiliates')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (affiliateError && affiliateError.code !== 'PGRST116') {
        throw affiliateError;
      }

      setAffiliate(affiliateData);

      if (!affiliateData) {
        setLoading(false);
        return;
      }

      // Buscar estatísticas
      const [
        { data: clicksData },
        { data: commissionsData },
        { data: attributionsData }
      ] = await Promise.all([
        supabase
          .from('affiliate_clicks')
          .select('*')
          .eq('affiliate_id', user.id)
          .order('created_at', { ascending: false })
          .limit(100),
        
        supabase
          .from('affiliate_commissions')
          .select('*')
          .eq('affiliate_id', user.id)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('affiliate_attributions')
          .select('*')
          .eq('affiliate_id', user.id)
      ]);

      setClicks(clicksData || []);
      setCommissions(commissionsData || []);

      // Calcular estatísticas
      const totalClicks = clicksData?.length || 0;
      const totalRegistrations = attributionsData?.length || 0;
      const activeReferrals = attributionsData?.length || 0;
      
      const pendingCommissions = commissionsData
        ?.filter(c => c.status === 'accrued' || c.status === 'approved')
        ?.reduce((sum, c) => sum + c.amount_cents, 0) || 0;
      
      const paidCommissions = commissionsData
        ?.filter(c => c.status === 'paid')
        ?.reduce((sum, c) => sum + c.amount_cents, 0) || 0;

      const thisMonthCommissions = commissionsData
        ?.filter(c => {
          const commissionDate = new Date(c.created_at);
          const now = new Date();
          return commissionDate.getMonth() === now.getMonth() && 
                 commissionDate.getFullYear() === now.getFullYear();
        })
        ?.reduce((sum, c) => sum + c.amount_cents, 0) || 0;

      const conversionRate = totalClicks > 0 ? (totalRegistrations / totalClicks) * 100 : 0;

      setStats({
        total_clicks: totalClicks,
        registrations: totalRegistrations,
        active_referrals: activeReferrals,
        pending_commissions_cents: pendingCommissions,
        paid_commissions_cents: paidCommissions,
        this_month_commissions_cents: thisMonthCommissions,
        conversion_rate: conversionRate
      });

    } catch (error) {
      console.error('Erro ao buscar dados do afiliado:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const applyToAffiliate = async (referrerCode?: string) => {
    if (!user) return;

    try {
      setLoading(true);

      // Buscar uplines se houver código de referência
      let uplines = { upline1: null, upline2: null, upline3: null };
      
      if (referrerCode) {
        const { data: referrer } = await supabase
          .from('affiliates')
          .select('user_id, upline1, upline2')
          .eq('ref_code', referrerCode)
          .eq('status', 'approved')
          .single();

        if (referrer) {
          uplines = {
            upline1: referrer.user_id,
            upline2: referrer.upline1,
            upline3: referrer.upline2
          };
        }
      }

      // Gerar código único
      const { data: newCode } = await supabase.rpc('gen_ref_code');
      
      // Criar registro de afiliado
      const { error } = await supabase
        .from('affiliates')
        .insert({
          user_id: user.id,
          ref_code: newCode,
          ...uplines,
          status: 'pending'
        });

      if (error) throw error;

      toast.success('Solicitação de afiliado enviada! Aguarde aprovação.');
      await fetchAffiliateData();

    } catch (error) {
      console.error('Erro ao aplicar para afiliado:', error);
      toast.error('Erro ao enviar solicitação');
    } finally {
      setLoading(false);
    }
  };

  const generateReferralLink = (path = '') => {
    if (!affiliate?.ref_code) return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/${affiliate.ref_code}${path}`;
  };

  useEffect(() => {
    fetchAffiliateData();
  }, [user]);

  return {
    loading,
    stats,
    commissions,
    clicks,
    affiliate,
    applyToAffiliate,
    generateReferralLink,
    refetch: fetchAffiliateData
  };
};