import { useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useAffiliateTracking = () => {
  const { user } = useAuth();

  // Extrair parâmetros UTM da URL
  const extractUtmParams = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get('utm_source'),
      utm_medium: params.get('utm_medium'),
      utm_campaign: params.get('utm_campaign'),
      utm_content: params.get('utm_content'),
      utm_term: params.get('utm_term')
    };
  }, []);

  // Detectar código de referência na URL
  const detectRefCode = useCallback(() => {
    const path = window.location.pathname.split('/').filter(Boolean);
    const searchParams = new URLSearchParams(window.location.search);
    
    // Verificar se há ref_code como parâmetro ?ref=CODIGO
    const refFromQuery = searchParams.get('ref');
    if (refFromQuery) return refFromQuery;
    
    // Verificar se a URL é baupremiado.shop/CODIGO
    if (path.length === 1) {
      const potentialCode = path[0];
      // Verificar se é um código válido (6-12 caracteres alfanuméricos)
      if (/^[A-Z0-9]{4,12}$/i.test(potentialCode)) {
        return potentialCode.toUpperCase();
      }
    }
    
    return null;
  }, []);

  // Armazenar dados de referência no localStorage
  const storeReferralData = useCallback((refCode: string, utmParams: any) => {
    const referralData = {
      ref_code: refCode,
      ...utmParams,
      timestamp: new Date().toISOString(),
      landing_path: window.location.pathname + window.location.search
    };
    
    localStorage.setItem('aff_referral_data', JSON.stringify(referralData));
    
    // Definir cookie também (para compatibilidade)
    const expires = new Date();
    expires.setDate(expires.getDate() + 30); // 30 dias
    document.cookie = `aff_ref=${refCode}; expires=${expires.toUTCString()}; path=/`;
    
    console.log('📊 Dados de referência armazenados:', referralData);
  }, []);

  // Registrar clique no banco de dados
  const registerClick = useCallback(async (refCode: string, utmParams: any) => {
    try {
      const { error } = await supabase
        .from('affiliate_clicks')
        .insert({
          ref_code: refCode,
          ip: null, // O IP será capturado no backend se necessário
          user_agent: navigator.userAgent,
          utm_source: utmParams.utm_source,
          utm_medium: utmParams.utm_medium,
          utm_campaign: utmParams.utm_campaign,
          utm_content: utmParams.utm_content,
          utm_term: utmParams.utm_term,
          landing_path: window.location.pathname + window.location.search
        });

      if (error) {
        console.error('Erro ao registrar clique:', error);
      } else {
        console.log('✅ Clique registrado para ref_code:', refCode);
      }
    } catch (error) {
      console.error('Erro ao registrar clique:', error);
    }
  }, []);

  // Processar atribuição no primeiro login
  const processAttribution = useCallback(async () => {
    if (!user) return;

    const storedData = localStorage.getItem('aff_referral_data');
    if (!storedData) return;

    try {
      const referralData = JSON.parse(storedData);
      const { ref_code } = referralData;

      if (!ref_code) return;

      console.log('🎯 Processando atribuição para usuário:', user.id, 'ref_code:', ref_code);

      // Chamar função RPC para processar atribuição
      const { error } = await supabase
        .rpc('aff_assign_user', {
          p_referred_user: user.id,
          p_ref_code: ref_code,
          p_first_click_id: null, // Pode ser implementado depois
          p_last_click_id: null   // Pode ser implementado depois
        });

      if (error) {
        console.error('Erro ao processar atribuição:', error);
      } else {
        console.log('✅ Atribuição processada com sucesso');
        
        // Limpar dados do localStorage após processar
        localStorage.removeItem('aff_referral_data');
        
        // Remover cookie também
        document.cookie = 'aff_ref=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }
    } catch (error) {
      console.error('Erro ao processar atribuição:', error);
    }
  }, [user]);

  // Redirecionamento para home se necessário
  const handleRedirect = useCallback(() => {
    const path = window.location.pathname.split('/').filter(Boolean);
    
    // Se a URL é apenas /CODIGO, redirecionar para home
    if (path.length === 1 && /^[A-Z0-9]{4,12}$/i.test(path[0])) {
      window.history.replaceState({}, '', '/');
    }
  }, []);

  // Hook principal para detectar e processar tracking
  useEffect(() => {
    const refCode = detectRefCode();
    
    if (refCode) {
      console.log('🔍 Código de referência detectado:', refCode);
      
      const utmParams = extractUtmParams();
      
      // Armazenar dados de referência
      storeReferralData(refCode, utmParams);
      
      // Registrar clique
      registerClick(refCode, utmParams);
      
      // Redirecionar se necessário
      handleRedirect();
    }
  }, [detectRefCode, extractUtmParams, storeReferralData, registerClick, handleRedirect]);

  // Processar atribuição quando usuário fizer login
  useEffect(() => {
    if (user) {
      // Aguardar um pouco para garantir que o usuário foi completamente autenticado
      setTimeout(() => {
        processAttribution();
      }, 1000);
    }
  }, [user, processAttribution]);

  return {
    detectRefCode,
    extractUtmParams,
    storeReferralData,
    registerClick,
    processAttribution
  };
};