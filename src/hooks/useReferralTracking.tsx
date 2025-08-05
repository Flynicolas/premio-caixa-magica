import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useReferralTracking = () => {
  const { user } = useAuth();

  // Processar referral no cadastro
  const processReferralSignup = async (referralCode: string) => {
    if (!user || !referralCode) return;

    try {
      const { data, error } = await supabase.rpc('process_referral_signup', {
        p_referred_user_id: user.id,
        p_referral_code: referralCode,
        p_referral_source: getStoredReferralSource(),
        p_ip_address: await getClientIP(),
        p_user_agent: navigator.userAgent
      });

      if (error) {
        console.error('Erro ao processar referral:', error);
        return false;
      }

      // Limpar dados do localStorage após processar
      localStorage.removeItem('referral_code');
      localStorage.removeItem('referral_source');
      localStorage.removeItem('referral_timestamp');

      return data;
    } catch (error) {
      console.error('Erro ao processar referral:', error);
      return false;
    }
  };

  // Rastrear clique no link
  const trackReferralClick = async (referralCode: string, source: string = 'direct') => {
    try {
      // Armazenar no localStorage para persistir entre sessões
      localStorage.setItem('referral_code', referralCode);
      localStorage.setItem('referral_source', source);
      localStorage.setItem('referral_timestamp', new Date().toISOString());

      // Se usuário estiver logado, registrar atividade imediatamente
      if (user) {
        const { error } = await supabase
          .from('referral_activities')
          .insert({
            referrer_id: await getReferrerIdByCode(referralCode),
            activity_type: 'click',
            activity_data: { referral_code: referralCode },
            ip_address: await getClientIP(),
            user_agent: navigator.userAgent,
            referral_source: source
          });

        if (error) {
          console.error('Erro ao registrar clique:', error);
        }
      }
    } catch (error) {
      console.error('Erro ao rastrear clique:', error);
    }
  };

  // Verificar se há referral pendente ao fazer login
  useEffect(() => {
    if (user) {
      const storedReferralCode = localStorage.getItem('referral_code');
      if (storedReferralCode) {
        // Processar referral com delay para garantir que o usuário foi criado
        setTimeout(() => {
          processReferralSignup(storedReferralCode);
        }, 2000);
      }
    }
  }, [user]);

  // Função auxiliar para obter IP do cliente
  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Erro ao obter IP:', error);
      return 'unknown';
    }
  };

  // Função auxiliar para obter ID do referenciador
  const getReferrerIdByCode = async (referralCode: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('user_referrals')
        .select('user_id')
        .eq('referral_code', referralCode)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Erro ao buscar referenciador:', error);
        return null;
      }

      return data?.user_id || null;
    } catch (error) {
      console.error('Erro ao buscar referenciador:', error);
      return null;
    }
  };

  // Função auxiliar para obter fonte do referral armazenada
  const getStoredReferralSource = (): string => {
    return localStorage.getItem('referral_source') || 'direct';
  };

  return {
    trackReferralClick,
    processReferralSignup
  };
};