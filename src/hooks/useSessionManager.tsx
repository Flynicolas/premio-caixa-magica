import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDeviceFingerprint } from './useDeviceFingerprint';

interface SessionConfig {
  rememberMe: boolean;
  deviceTrusted: boolean;
  lastActivity: number;
}

export const useSessionManager = () => {
  const [sessionConfig, setSessionConfig] = useState<SessionConfig>({
    rememberMe: false,
    deviceTrusted: false,
    lastActivity: Date.now()
  });
  
  const { fingerprint } = useDeviceFingerprint();

  // Verificar se o dispositivo é confiável
  const checkDeviceTrust = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('device_fingerprint, remember_login')
        .eq('id', userId)
        .single();

      if (!error && data) {
        const deviceTrusted = data.device_fingerprint === fingerprint;
        setSessionConfig(prev => ({
          ...prev,
          rememberMe: data.remember_login || false,
          deviceTrusted
        }));
        return deviceTrusted;
      }
    } catch (error) {
      console.error('Erro ao verificar dispositivo:', error);
    }
    return false;
  };

  // Atualizar atividade da sessão
  const updateActivity = () => {
    setSessionConfig(prev => ({
      ...prev,
      lastActivity: Date.now()
    }));
  };

  // Configurar sessão lembrada
  const setRememberSession = async (userId: string, remember: boolean) => {
    try {
      await supabase
        .from('profiles')
        .update({
          device_fingerprint: remember ? fingerprint : null,
          remember_login: remember
        })
        .eq('id', userId);

      setSessionConfig(prev => ({
        ...prev,
        rememberMe: remember,
        deviceTrusted: remember
      }));
    } catch (error) {
      console.error('Erro ao configurar sessão:', error);
    }
  };

  // Limpar sessão
  const clearSession = async (userId: string) => {
    try {
      await supabase
        .from('profiles')
        .update({
          device_fingerprint: null,
          remember_login: false
        })
        .eq('id', userId);

      setSessionConfig({
        rememberMe: false,
        deviceTrusted: false,
        lastActivity: Date.now()
      });
    } catch (error) {
      console.error('Erro ao limpar sessão:', error);
    }
  };

  // Monitorar atividade do usuário
  useEffect(() => {
    const handleActivity = () => updateActivity();
    
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, []);

  return {
    sessionConfig,
    checkDeviceTrust,
    updateActivity,
    setRememberSession,
    clearSession
  };
};