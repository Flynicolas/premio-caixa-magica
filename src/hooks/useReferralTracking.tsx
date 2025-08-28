import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// Utilidades para cookies
const setCookie = (name: string, value: string, days: number = 30) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

export const useReferralTracking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Capturar UTM parameters
  const getUtmParams = useCallback(() => {
    const params = new URLSearchParams(location.search);
    return {
      utm_source: params.get('utm_source'),
      utm_medium: params.get('utm_medium'),
      utm_campaign: params.get('utm_campaign'),
      utm_content: params.get('utm_content'),
      utm_term: params.get('utm_term')
    };
  }, [location.search]);

  // Verificar se é um código de referência válido
  const isValidRefCode = (code: string): boolean => {
    return /^[A-Z0-9]{4,12}$/i.test(code);
  };

  // Registrar clique de afiliado
  const trackClick = useCallback(async (refCode: string, utmParams: any) => {
    try {
      const { error } = await supabase
        .from('affiliate_clicks')
        .insert({
          ref_code: refCode.toUpperCase(),
          utm_source: utmParams.utm_source,
          utm_medium: utmParams.utm_medium,
          utm_campaign: utmParams.utm_campaign,
          utm_content: utmParams.utm_content,
          utm_term: utmParams.utm_term,
          landing_path: location.pathname + location.search,
          user_agent: navigator.userAgent
        });

      if (error) {
        console.error('Erro ao registrar clique:', error);
      } else {
        console.log('Clique registrado para:', refCode);
      }
    } catch (error) {
      console.error('Erro ao registrar clique:', error);
    }
  }, [location.pathname, location.search]);

  // Processar referência e redirecionar se necessário
  const processReferral = useCallback(async () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const utmParams = getUtmParams();
    
    // Verificar ref_code na URL path (ex: /ABC123)
    const pathRefCode = pathSegments.length === 1 && isValidRefCode(pathSegments[0]) 
      ? pathSegments[0] 
      : null;
    
    // Verificar ref_code no query parameter (ex: ?ref=ABC123)
    const queryRefCode = new URLSearchParams(location.search).get('ref');
    const validQueryRefCode = queryRefCode && isValidRefCode(queryRefCode) ? queryRefCode : null;

    const refCode = pathRefCode || validQueryRefCode;

    if (refCode) {
      const upperRefCode = refCode.toUpperCase();
      
      // Salvar referência em cookie (30 dias)
      setCookie('aff_ref', upperRefCode, 30);
      
      // Salvar UTMs em cookies também
      if (utmParams.utm_source) setCookie('aff_utm_source', utmParams.utm_source, 30);
      if (utmParams.utm_medium) setCookie('aff_utm_medium', utmParams.utm_medium, 30);
      if (utmParams.utm_campaign) setCookie('aff_utm_campaign', utmParams.utm_campaign, 30);
      if (utmParams.utm_content) setCookie('aff_utm_content', utmParams.utm_content, 30);
      if (utmParams.utm_term) setCookie('aff_utm_term', utmParams.utm_term, 30);

      // Registrar clique
      await trackClick(upperRefCode, utmParams);

      // Se veio de /{ref_code}, redirecionar para home
      if (pathRefCode) {
        navigate('/', { replace: true });
      }
    }
  }, [location.pathname, location.search, getUtmParams, trackClick, navigate]);

  // Processar atribuição quando usuário faz login/cadastro
  const processAttribution = useCallback(async (userId: string) => {
    const refCode = getCookie('aff_ref');
    if (!refCode) return;

    try {
      // Buscar IDs de cliques para esta referência
      const { data: clicks } = await supabase
        .from('affiliate_clicks')
        .select('id')
        .eq('ref_code', refCode)
        .order('created_at', { ascending: false })
        .limit(10);

      const firstClickId = clicks?.[clicks.length - 1]?.id || null;
      const lastClickId = clicks?.[0]?.id || null;

      // Chamar edge function para processar atribuição
      const { error } = await supabase.functions.invoke('process-attribution', {
        body: {
          user_id: userId,
          ref_code: refCode,
          first_click_id: firstClickId,
          last_click_id: lastClickId
        }
      });

      if (error) {
        console.error('Erro ao processar atribuição:', error);
      } else {
        console.log('Atribuição processada para usuário:', userId);
        
        // Limpar cookies de referência após atribuição bem-sucedida
        document.cookie = 'aff_ref=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'aff_utm_source=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'aff_utm_medium=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'aff_utm_campaign=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'aff_utm_content=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'aff_utm_term=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }
    } catch (error) {
      console.error('Erro ao processar atribuição:', error);
    }
  }, []);

  // Obter dados de referência dos cookies
  const getReferralData = useCallback(() => {
    return {
      ref_code: getCookie('aff_ref'),
      utm_source: getCookie('aff_utm_source'),
      utm_medium: getCookie('aff_utm_medium'),
      utm_campaign: getCookie('aff_utm_campaign'),
      utm_content: getCookie('aff_utm_content'),
      utm_term: getCookie('aff_utm_term')
    };
  }, []);

  // Processar referência quando a página carrega
  useEffect(() => {
    processReferral();
  }, [processReferral]);

  // Processar atribuição quando usuário faz login
  useEffect(() => {
    if (user && getCookie('aff_ref')) {
      processAttribution(user.id);
    }
  }, [user, processAttribution]);

  return {
    processReferral,
    processAttribution,
    getReferralData,
    trackClick
  };
};