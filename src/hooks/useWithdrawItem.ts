import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { useMercadoPago } from './useMercadoPago';
import { useEffect, useState } from 'react';

export const useWithdrawItem = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { createPayment, redirectToPayment } = useMercadoPago();
  const [entregas, setEntregas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRescue, setTotalRescue] = useState(0);
  
  const fetchEntregas = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
      .from('item_withdrawals')
      .select(`
    id,
    created_at,
    tracking_code,
    delivery_status,
    item:item_id(name, image_url),
    payments:item_withdrawal_payments(status),
    profile:profiles(
      full_name,
      cpf,
      zip_code,
      street,
      number,
      complement,
      neighborhood,
      city,
      state
    )
  `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
        
        
        if (error) throw error;
        setEntregas(data || []);
      } catch (err) {
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar suas entregas.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    const solicitarRetirada = async ({
      itemId,
      inventoryId,
      fullName,
      cpf,
      address
    }: {
      itemId: string;
      inventoryId: string;
      fullName: string;
      cpf: string;
      address: {
        zip_code: string;
        street: string;
        number: string;
        complement?: string;
        neighborhood: string;
        city: string;
        state: string;
      };
      
    }) => {
      if (!user) {
        toast({ title: 'Erro', description: 'Usuário não autenticado.', variant: 'destructive' });
        return;
      }
      
      try {
        const { data: retirada, error: retiradaError } = await supabase
        .from('item_withdrawals')
        .insert({
          user_id: user.id,
          item_id: itemId,
          inventory_id: inventoryId,
          full_name: fullName,
          cpf,
          delivery_address: address,
          delivery_fee: 25.0
        })
        .select()
        .single();
        
        if (retiradaError || !retirada) throw retiradaError;
        
        const payment = await createPayment(25.0, `Retirada do prêmio #${retirada.id}`);
        if (!payment) return;
        
        const { error: payError } = await supabase
        .from('item_withdrawal_payments')
        .insert({
          withdrawal_id: retirada.id,
          user_id: user.id,
          preference_id: payment.preference_id,
          transaction_id: payment.transaction_id,
          status: 'pending'
        });
        
        if (payError) {
          console.error('Erro ao salvar pagamento da retirada:', payError);
          toast({ title: 'Erro', description: 'Falha ao vincular pagamento à retirada.', variant: 'destructive' });
          return;
        }
        
        redirectToPayment(payment);
      } catch (err: any) {
        console.error('Erro ao solicitar retirada:', err);
        toast({ title: 'Erro', description: err.message || 'Erro inesperado.', variant: 'destructive' });
      }
    };


    

    return { solicitarRetirada, fetchEntregas, entregas, loading };
  };
  