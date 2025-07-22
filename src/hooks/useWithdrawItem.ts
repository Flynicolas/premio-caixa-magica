
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
          payment_status,
          item:item_id(name, image_url),
          payments:item_withdrawal_payments(status)
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

  const resgateComCarteira = async ({
    itemId,
    inventoryId,
    fullName,
    cpf,
    address,
    userBalance
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
    userBalance: number;
  }) => {
    const deliveryFee = 25.0;

    if (!user) {
      toast({ title: 'Erro', description: 'Usuário não autenticado.', variant: 'destructive' });
      return { success: false, insufficientBalance: false };
    }

    // Verificar saldo suficiente
    if (userBalance < deliveryFee) {
      return { success: false, insufficientBalance: true };
    }
    
    try {
      const addressString = `${address.street}, ${address.number}${address.complement ? `, ${address.complement}` : ''}, ${address.neighborhood}, ${address.city} - ${address.state}, CEP: ${address.zip_code}`;
      
      // Buscar carteira do usuário
      const { data: walletData, error: walletError } = await supabase
        .from('user_wallets')
        .select('id, balance, total_spent')
        .eq('user_id', user.id)
        .single();

      if (walletError || !walletData) {
        throw new Error('Carteira não encontrada');
      }

      // Verificar saldo novamente no banco
      if (walletData.balance < deliveryFee) {
        return { success: false, insufficientBalance: true };
      }

      // Debitar da carteira
      const { error: debitError } = await supabase
        .from('user_wallets')
        .update({ 
          balance: walletData.balance - deliveryFee,
          total_spent: (walletData.total_spent || 0) + deliveryFee
        })
        .eq('user_id', user.id);

      if (debitError) throw debitError;

      // Criar transação da compra
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          wallet_id: walletData.id,
          type: 'purchase',
          amount: deliveryFee,
          status: 'completed',
          description: `Taxa de entrega - Resgate de prêmio`,
          metadata: { 
            item_id: itemId,
            inventory_id: inventoryId,
            withdrawal_type: 'wallet_payment'
          }
        });

      if (transactionError) throw transactionError;

      // Criar registro de retirada
      const { data: retirada, error: retiradaError } = await supabase
        .from('item_withdrawals')
        .insert({
          user_id: user.id,
          item_id: itemId,
          inventory_id: inventoryId,
          full_name: fullName,
          cpf,
          delivery_address: addressString,
          delivery_fee: deliveryFee,
          payment_status: 'paid',
          delivery_status: 'aguardando_envio'
        })
        .select()
        .single();
        
      if (retiradaError || !retirada) throw retiradaError;

      // Marcar item como resgatado no inventário
      const { error: inventoryError } = await supabase
        .from('user_inventory')
        .update({ 
          is_redeemed: true, 
          redeemed_at: new Date().toISOString() 
        })
        .eq('id', inventoryId);

      if (inventoryError) throw inventoryError;

      toast({
        title: 'Resgate realizado!',
        description: `Seu prêmio foi resgatado com sucesso. Acompanhe a entrega em "Minhas Entregas".`,
        variant: 'default',
      });

      return { success: true, insufficientBalance: false };
      
    } catch (err: any) {
      console.error('Erro ao resgatar com carteira:', err);
      toast({ 
        title: 'Erro', 
        description: err.message || 'Erro inesperado ao processar resgate.', 
        variant: 'destructive' 
      });
      return { success: false, insufficientBalance: false };
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
      const addressString = `${address.street}, ${address.number}${address.complement ? `, ${address.complement}` : ''}, ${address.neighborhood}, ${address.city} - ${address.state}, CEP: ${address.zip_code}`;
      
      const { data: retirada, error: retiradaError } = await supabase
        .from('item_withdrawals')
        .insert({
          user_id: user.id,
          item_id: itemId,
          inventory_id: inventoryId,
          full_name: fullName,
          cpf,
          delivery_address: addressString,
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

  return { 
    solicitarRetirada, 
    resgateComCarteira,
    fetchEntregas, 
    entregas, 
    loading 
  };
};
