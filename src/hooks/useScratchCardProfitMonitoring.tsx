import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ScratchCardProfitData {
  id: string;
  scratch_type: string;
  date: string;
  total_sales: number;
  total_prizes_paid: number;
  profit_margin_percentage: number;
  target_margin_percentage: number;
  is_healthy: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfitSummary {
  totalSales: number;
  totalPrizesPaid: number;
  overallMargin: number;
  isHealthy: boolean;
  worstPerformer: string;
  bestPerformer: string;
}

export const useScratchCardProfitMonitoring = () => {
  const [profitData, setProfitData] = useState<ScratchCardProfitData[]>([]);
  const [summary, setSummary] = useState<ProfitSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadProfitData = async () => {
    try {
      const { data, error } = await supabase
        .from('scratch_card_profit_monitoring')
        .select('*')
        .order('scratch_type');

      if (error) throw error;

      const formattedData: ScratchCardProfitData[] = (data || []).map(item => ({
        ...item,
        total_sales: Number(item.total_sales),
        total_prizes_paid: Number(item.total_prizes_paid),
        profit_margin_percentage: Number(item.profit_margin_percentage),
        target_margin_percentage: Number(item.target_margin_percentage)
      }));

      setProfitData(formattedData);
      calculateSummary(formattedData);
    } catch (error) {
      console.error('Erro ao carregar dados de lucro:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar dados de monitoramento",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (data: ScratchCardProfitData[]) => {
    if (data.length === 0) {
      setSummary(null);
      return;
    }

    const totals = data.reduce((acc, item) => ({
      sales: acc.sales + item.total_sales,
      prizes: acc.prizes + item.total_prizes_paid
    }), { sales: 0, prizes: 0 });

    const overallMargin = totals.sales > 0 
      ? ((totals.sales - totals.prizes) / totals.sales) * 100 
      : 0;

    const sortedByMargin = [...data].sort((a, b) => 
      a.profit_margin_percentage - b.profit_margin_percentage
    );

    setSummary({
      totalSales: totals.sales,
      totalPrizesPaid: totals.prizes,
      overallMargin,
      isHealthy: overallMargin >= 85,
      worstPerformer: sortedByMargin[0]?.scratch_type || 'N/A',
      bestPerformer: sortedByMargin[sortedByMargin.length - 1]?.scratch_type || 'N/A'
    });
  };

  const updateProfitData = async (scratchType: string, sales: number, prizesPaid: number) => {
    try {
      const { error } = await supabase
        .from('scratch_card_profit_monitoring')
        .upsert({
          scratch_type: scratchType,
          date: new Date().toISOString().split('T')[0],
          total_sales: sales,
          total_prizes_paid: prizesPaid
        }, {
          onConflict: 'scratch_type,date'
        });

      if (error) throw error;
      await loadProfitData();
    } catch (error) {
      console.error('Erro ao atualizar dados de lucro:', error);
    }
  };

  const getMarginColor = (margin: number) => {
    if (margin >= 90) return 'text-green-600';
    if (margin >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMarginStatus = (margin: number) => {
    if (margin >= 90) return 'Excelente';
    if (margin >= 85) return 'Bom';
    if (margin >= 70) return 'Atenção';
    return 'Crítico';
  };

  useEffect(() => {
    loadProfitData();

    // Configurar atualizações em tempo real
    const channel = supabase
      .channel('profit-monitoring-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scratch_card_profit_monitoring'
        },
        () => {
          loadProfitData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    profitData,
    summary,
    loading,
    updateProfitData,
    getMarginColor,
    getMarginStatus,
    refreshData: loadProfitData
  };
};