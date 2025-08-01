import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface DemoSettings {
  saldo_inicial: number;
  tempo_reset_horas: number;
  probabilidades_chest: Record<string, any>;
  itens_demo: string[];
}

interface UseDemoReturn {
  isDemo: boolean;
  demoSettings: DemoSettings | null;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

export const useDemo = (): UseDemoReturn => {
  const { user } = useAuth();
  const [isDemo, setIsDemo] = useState(false);
  const [demoSettings, setDemoSettings] = useState<DemoSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDemoSettings = async () => {
    try {
      setLoading(true);
      
      // Verificar se usuário está em modo demo
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_demo')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profileError) {
          console.error('❌ [useDemo] Erro ao buscar perfil:', profileError);
        } else {
          setIsDemo(profile?.is_demo || false);
        }
      } else {
        setIsDemo(false);
      }

      // Buscar configurações demo
      const { data: settings, error: settingsError } = await supabase
        .from('demo_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (settingsError) {
        console.error('❌ [useDemo] Erro ao buscar configurações demo:', settingsError);
        // Definir configurações padrão
        setDemoSettings({
          saldo_inicial: 1000,
          tempo_reset_horas: 24,
          probabilidades_chest: {},
          itens_demo: []
        });
      } else if (settings) {
        setDemoSettings({
          saldo_inicial: settings.saldo_inicial,
          tempo_reset_horas: settings.tempo_reset_horas,
          probabilidades_chest: settings.probabilidades_chest as Record<string, any>,
          itens_demo: settings.itens_demo as string[]
        });
      }
    } catch (error) {
      console.error('❌ [useDemo] Erro crítico ao buscar configurações demo:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemoSettings();
  }, [user]);

  return {
    isDemo,
    demoSettings,
    loading,
    refreshSettings: fetchDemoSettings
  };
};