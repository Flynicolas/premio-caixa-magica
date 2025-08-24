import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RTPSettings {
  id: string;
  scratch_type: string;
  name: string;
  price: number;
  target_rtp: number;
  rtp_enabled: boolean;
  is_active: boolean;
}

interface RTPMetrics {
  scratch_type: string;
  current_rtp: number;
  total_games: number;
  total_sales: number;
  total_prizes: number;
  last_updated: string;
}

export const useRTPControl = () => {
  const [rtpSettings, setRtpSettings] = useState<RTPSettings[]>([]);
  const [rtpMetrics, setRtpMetrics] = useState<RTPMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar configurações RTP
  const loadRTPSettings = async () => {
    try {
      setLoading(true);
      
      const { data: settings, error } = await supabase
        .from('scratch_card_settings')
        .select('*')
        .eq('is_active', true)
        .order('price');

      if (error) throw error;

      setRtpSettings(settings || []);
    } catch (error) {
      console.error('Erro ao carregar configurações RTP:', error);
      toast.error('Erro ao carregar configurações RTP');
    }
  };

  // Carregar métricas RTP atuais
  const loadRTPMetrics = async () => {
    try {
      const { data: metrics, error } = await supabase
        .from('game_rounds')
        .select(`
          game_type,
          bet,
          prize,
          decided_at
        `)
        .gte('decided_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      // Calcular métricas por tipo
      const metricsMap: Record<string, RTPMetrics> = {};
      
      metrics?.forEach(game => {
        if (!metricsMap[game.game_type]) {
          metricsMap[game.game_type] = {
            scratch_type: game.game_type,
            current_rtp: 0,
            total_games: 0,
            total_sales: 0,
            total_prizes: 0,
            last_updated: new Date().toISOString()
          };
        }

        const metric = metricsMap[game.game_type];
        metric.total_games += 1;
        metric.total_sales += game.bet || 0;
        metric.total_prizes += game.prize || 0;
      });

      // Calcular RTP atual
      Object.values(metricsMap).forEach(metric => {
        metric.current_rtp = metric.total_sales > 0 
          ? (metric.total_prizes / metric.total_sales) * 100
          : 0;
      });

      setRtpMetrics(Object.values(metricsMap));
    } catch (error) {
      console.error('Erro ao carregar métricas RTP:', error);
    }
  };

  // Atualizar RTP target
  const updateTargetRTP = async (scratchType: string, targetRtp: number) => {
    try {
      const { error } = await supabase
        .from('scratch_card_settings')
        .update({ 
          target_rtp: targetRtp,
          updated_at: new Date().toISOString()
        })
        .eq('scratch_type', scratchType);

      if (error) throw error;

      // Atualizar também na tabela rtp_pots se existir
      const { error: potError } = await supabase
        .from('rtp_pots')
        .update({ target_rtp: targetRtp / 100 })
        .eq('scratch_type', scratchType);

      // Ignorar erro se a tabela não existir
      if (potError && !potError.message.includes('does not exist')) {
        console.warn('Erro ao atualizar rtp_pots:', potError);
      }

      toast.success(`RTP target atualizado para ${targetRtp}%`);
      await loadRTPSettings();
    } catch (error) {
      console.error('Erro ao atualizar RTP target:', error);
      toast.error('Erro ao atualizar RTP target');
    }
  };

  // Habilitar/Desabilitar RTP
  const toggleRTPEnabled = async (scratchType: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('scratch_card_settings')
        .update({ 
          rtp_enabled: enabled,
          updated_at: new Date().toISOString()
        })
        .eq('scratch_type', scratchType);

      if (error) throw error;

      toast.success(`RTP ${enabled ? 'habilitado' : 'desabilitado'} com sucesso`);
      await loadRTPSettings();
    } catch (error) {
      console.error('Erro ao alterar status RTP:', error);
      toast.error('Erro ao alterar status RTP');
    }
  };

  // Resetar métricas RTP
  const resetRTPMetrics = async (scratchType: string) => {
    try {
      // Deletar registros de game_rounds dos últimos 30 dias
      const { error } = await supabase
        .from('game_rounds')
        .delete()
        .eq('game_type', scratchType)
        .gte('decided_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      toast.success('Métricas RTP resetadas com sucesso');
      await loadRTPMetrics();
    } catch (error) {
      console.error('Erro ao resetar métricas RTP:', error);
      toast.error('Erro ao resetar métricas RTP');
    }
  };

  // Configurar listeners em tempo real
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([loadRTPSettings(), loadRTPMetrics()]);
      setLoading(false);
    };

    loadData();

    // Listeners para atualizações em tempo real
    const settingsChannel = supabase
      .channel('rtp-settings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scratch_card_settings'
        },
        () => {
          loadRTPSettings();
        }
      )
      .subscribe();

    const metricsChannel = supabase
      .channel('rtp-metrics')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'game_rounds'
        },
        () => {
          loadRTPMetrics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(settingsChannel);
      supabase.removeChannel(metricsChannel);
    };
  }, []);

  return {
    rtpSettings,
    rtpMetrics,
    loading,
    updateTargetRTP,
    toggleRTPEnabled,
    resetRTPMetrics,
    refreshData: () => Promise.all([loadRTPSettings(), loadRTPMetrics()])
  };
};