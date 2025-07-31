import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface ConversionResult {
  conversion_id: string;
  status: string;
  message: string;
}

interface ValidationResult {
  is_valid: boolean;
  requires_approval: boolean;
  error_message: string;
  daily_total: number;
  conversion_count: number;
}

interface ConversionData {
  id: string;
  user_id: string;
  item_id: string;
  inventory_id: string;
  conversion_amount: number;
  conversion_status: string;
  approval_status: string;
  approved_by?: string;
  approved_at?: string;
  metadata: any;
  created_at: string;
  processed_at?: string;
}

interface DailyLimitData {
  total_converted: number;
  conversion_count: number;
  last_conversion_at?: string;
}

export const useMonetaryConversion = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);

  // Validar se uma conversão é possível
  const validateConversion = async (itemId: string, conversionAmount: number): Promise<ValidationResult | null> => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return null;
    }

    setValidating(true);
    try {
      const { data, error } = await supabase.rpc('validate_monetary_conversion', {
        p_user_id: user.id,
        p_item_id: itemId,
        p_conversion_amount: conversionAmount
      });

      if (error) {
        console.error('Erro na validação:', error);
        toast({
          title: "Erro na validação",
          description: "Não foi possível validar a conversão",
          variant: "destructive"
        });
        return null;
      }

      return data[0] as ValidationResult;
    } catch (error) {
      console.error('Erro na validação:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado na validação",
        variant: "destructive"
      });
      return null;
    } finally {
      setValidating(false);
    }
  };

  // Processar uma conversão monetária
  const processConversion = async (
    itemId: string,
    inventoryId: string,
    conversionAmount: number
  ): Promise<ConversionResult | null> => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return null;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('process_monetary_conversion', {
        p_user_id: user.id,
        p_item_id: itemId,
        p_inventory_id: inventoryId,
        p_conversion_amount: conversionAmount
      });

      if (error) {
        console.error('Erro na conversão:', error);
        toast({
          title: "Erro na conversão",
          description: "Não foi possível processar a conversão",
          variant: "destructive"
        });
        return null;
      }

      const result = data[0] as ConversionResult;

      if (result.status === 'error') {
        toast({
          title: "Erro",
          description: result.message,
          variant: "destructive"
        });
        return result;
      }

      if (result.status === 'completed') {
        toast({
          title: "Conversão realizada!",
          description: `R$ ${conversionAmount.toFixed(2)} foi adicionado à sua carteira`,
          variant: "default"
        });
      } else if (result.status === 'pending_approval') {
        toast({
          title: "Conversão pendente",
          description: "Sua conversão está aguardando aprovação manual devido ao valor alto",
          variant: "default"
        });
      }

      return result;
    } catch (error) {
      console.error('Erro na conversão:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado na conversão",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Buscar conversões do usuário
  const fetchUserConversions = async (): Promise<ConversionData[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('monetary_conversions')
        .select(`
          *,
          items:item_id (
            name,
            category,
            base_value
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar conversões:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar conversões:', error);
      return [];
    }
  };

  // Buscar limite diário atual
  const fetchDailyLimit = async (): Promise<DailyLimitData | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('daily_conversion_limits')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', new Date().toISOString().split('T')[0])
        .single();

      if (error) {
        // Se não existe registro para hoje, retornar valores zerados
        if (error.code === 'PGRST116') {
          return {
            total_converted: 0,
            conversion_count: 0
          };
        }
        console.error('Erro ao buscar limite diário:', error);
        return null;
      }

      return {
        total_converted: data.total_converted,
        conversion_count: data.conversion_count,
        last_conversion_at: data.last_conversion_at
      };
    } catch (error) {
      console.error('Erro ao buscar limite diário:', error);
      return null;
    }
  };

  // Verificar se um item pode ser convertido
  const canConvertItem = (item: any): boolean => {
    return item.category === 'dinheiro' && item.delivery_type === 'digital';
  };

  // Calcular valor de conversão baseado no item
  const getConversionAmount = (item: any): number => {
    return parseFloat(item.base_value) || 0;
  };

  return {
    loading,
    validating,
    validateConversion,
    processConversion,
    fetchUserConversions,
    fetchDailyLimit,
    canConvertItem,
    getConversionAmount
  };
};