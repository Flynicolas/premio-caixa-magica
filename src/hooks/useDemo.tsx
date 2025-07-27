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
      // Verificar se usuário está em modo demo
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_demo')
          .eq('id', user.id)
          .single();
        
        setIsDemo(profile?.is_demo || false);
      }

      // Buscar configurações demo
      const { data: settings } = await supabase
        .from('demo_settings')
        .select('*')
        .limit(1)
        .single();

      if (settings) {
        setDemoSettings({
          saldo_inicial: settings.saldo_inicial,
          tempo_reset_horas: settings.tempo_reset_horas,
          probabilidades_chest: settings.probabilidades_chest as Record<string, any>,
          itens_demo: settings.itens_demo as string[]
        });
      }
    } catch (error) {
      console.error('Erro ao buscar configurações demo:', error);
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