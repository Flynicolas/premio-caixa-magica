import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ReferralData {
  id: string;
  referral_code: string;
  referral_link: string;
  total_invites: number;
  successful_referrals: number;
  active_referrals: number;
  total_commission_earned: number;
  commission_pending: number;
  last_referral_at: string | null;
  is_active: boolean;
}

interface ReferralStats {
  id: string;
  date: string;
  clicks: number;
  registrations: number;
  first_deposits: number;
  total_deposit_amount: number;
  total_spent_amount: number;
  conversion_rate: number;
}

interface ReferralActivity {
  id: string;
  activity_type: string;
  activity_data: any;
  ip_address: string | null;
  user_agent: string | null;
  referral_source: string | null;
  created_at: string;
  referred_user?: {
    full_name: string;
    email: string;
  };
}

interface ReferredUser {
  id: string;
  full_name: string;
  email: string;
  referral_date: string;
  referral_source: string;
  total_spent: number;
  last_activity: string;
  is_active: boolean;
}

export const useReferrals = () => {
  const { user } = useAuth();
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [referralStats, setReferralStats] = useState<ReferralStats[]>([]);
  const [activities, setActivities] = useState<ReferralActivity[]>([]);
  const [referredUsers, setReferredUsers] = useState<ReferredUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar dados de referral do usuário
  const fetchReferralData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_referrals')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar dados de referral:', error);
        return;
      }

      setReferralData(data);
    } catch (error) {
      console.error('Erro ao buscar dados de referral:', error);
    }
  };

  // Buscar estatísticas de referral
  const fetchReferralStats = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('referral_stats')
        .select('*')
        .eq('referrer_id', user.id)
        .order('date', { ascending: false })
        .limit(30);

      if (error) {
        console.error('Erro ao buscar estatísticas:', error);
        return;
      }

      setReferralStats(data || []);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  // Buscar atividades de referral
  const fetchActivities = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('referral_activities')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Erro ao buscar atividades:', error);
        return;
      }

      setActivities(data || []);
    } catch (error) {
      console.error('Erro ao buscar atividades:', error);
    }
  };

  // Buscar usuários referenciados
  const fetchReferredUsers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          referral_date,
          referral_source,
          total_spent,
          last_login,
          is_active
        `)
        .eq('referred_by', user.id)
        .order('referral_date', { ascending: false });

      if (error) {
        console.error('Erro ao buscar usuários referenciados:', error);
        return;
      }

      setReferredUsers(
        data?.map(user => ({
          ...user,
          last_activity: user.last_login,
        })) || []
      );
    } catch (error) {
      console.error('Erro ao buscar usuários referenciados:', error);
    }
  };

  // Registrar clique no link
  const trackClick = async (referralCode: string, source: string = 'direct') => {
    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const { ip } = await ipResponse.json();

      const { error } = await supabase
        .from('referral_activities')
        .insert({
          referrer_id: user?.id,
          activity_type: 'click',
          activity_data: { referral_code: referralCode },
          ip_address: ip,
          user_agent: navigator.userAgent,
          referral_source: source
        });

      if (error) {
        console.error('Erro ao registrar clique:', error);
      }

      // Atualizar estatísticas diárias será implementado via trigger ou função específica
    } catch (error) {
      console.error('Erro ao rastrear clique:', error);
    }
  };

  // Copiar link para clipboard
  const copyReferralLink = async () => {
    if (!referralData) return;

    const fullLink = `${window.location.origin}/convite/${referralData.referral_code}`;
    
    try {
      await navigator.clipboard.writeText(fullLink);
      toast.success('Link copiado para a área de transferência!');
    } catch (error) {
      // Fallback para navegadores que não suportam clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = fullLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Link copiado para a área de transferência!');
    }
  };

  // Compartilhar no WhatsApp
  const shareOnWhatsApp = () => {
    if (!referralData) return;

    const fullLink = `${window.location.origin}/convite/${referralData.referral_code}`;
    const message = `🎰 Venha jogar comigo! Cadastre-se usando meu link de convite e ganhe bônus especiais: ${fullLink}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    trackClick(referralData.referral_code, 'whatsapp');
  };

  // Compartilhar no Telegram
  const shareOnTelegram = () => {
    if (!referralData) return;

    const fullLink = `${window.location.origin}/convite/${referralData.referral_code}`;
    const message = `🎰 Venha jogar comigo! Cadastre-se usando meu link de convite: ${fullLink}`;
    const telegramUrl = `https://telegram.me/share/url?url=${encodeURIComponent(fullLink)}&text=${encodeURIComponent(message)}`;
    
    window.open(telegramUrl, '_blank');
    trackClick(referralData.referral_code, 'telegram');
  };

  // Gerar QR Code
  const generateQRCode = () => {
    if (!referralData) return '';

    const fullLink = `${window.location.origin}/convite/${referralData.referral_code}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(fullLink)}`;
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([
        fetchReferralData(),
        fetchReferralStats(),
        fetchActivities(),
        fetchReferredUsers()
      ]).finally(() => setLoading(false));
    }
  }, [user]);

  return {
    referralData,
    referralStats,
    activities,
    referredUsers,
    loading,
    copyReferralLink,
    shareOnWhatsApp,
    shareOnTelegram,
    generateQRCode,
    trackClick,
    refresh: () => {
      if (user) {
        Promise.all([
          fetchReferralData(),
          fetchReferralStats(),
          fetchActivities(),
          fetchReferredUsers()
        ]);
      }
    }
  };
};