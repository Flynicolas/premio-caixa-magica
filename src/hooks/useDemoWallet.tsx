import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface DemoWalletData {
  balance: number;
  total_deposited: number;
  total_withdrawn: number;
  total_spent: number;
  is_demo: boolean;
}

export const useDemoWallet = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [walletData, setWalletData] = useState<DemoWalletData>({
    balance: 0,
    total_deposited: 0,
    total_withdrawn: 0,
    total_spent: 0,
    is_demo: false,
  });
  const [loading, setLoading] = useState(true);

  const fetchDemoWallet = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Primeiro reseta créditos demo se necessário
      await supabase.rpc('reset_demo_credits');

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_demo, credito_demo, total_spent')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Erro ao buscar dados demo:', error);
        return;
      }

      if (profile?.is_demo) {
        setWalletData({
          balance: profile.credito_demo || 0,
          total_deposited: profile.credito_demo || 0,
          total_withdrawn: 0,
          total_spent: profile.total_spent || 0,
          is_demo: true,
        });
      } else {
        setWalletData({
          balance: 0,
          total_deposited: 0,
          total_withdrawn: 0,
          total_spent: 0,
          is_demo: false,
        });
      }
    } catch (error) {
      console.error('Erro ao buscar carteira demo:', error);
    } finally {
      setLoading(false);
    }
  };

  const purchaseChestDemo = async (chestType: string, amount: number) => {
    if (!user || !walletData.is_demo) {
      return { error: 'Usuário não está em modo demo' };
    }

    if (walletData.balance < amount) {
      return { error: 'Saldo insuficiente' };
    }

    try {
      const newBalance = walletData.balance - amount;
      const newSpent = walletData.total_spent + amount;

      // Atualizar apenas o crédito demo
      const { error } = await supabase
        .from('profiles')
        .update({ 
          credito_demo: newBalance,
          total_spent: newSpent
        })
        .eq('id', user.id);

      if (error) {
        console.error('Erro ao atualizar crédito demo:', error);
        return { error: 'Erro ao processar compra' };
      }

      setWalletData(prev => ({
        ...prev,
        balance: newBalance,
        total_spent: newSpent
      }));

      return { error: null };
    } catch (error) {
      console.error('Erro na compra demo:', error);
      return { error: 'Erro interno' };
    }
  };

  const withdrawDemo = async (amount: number) => {
    if (!user || !walletData.is_demo) {
      return { error: 'Usuário não está em modo demo' };
    }

    if (walletData.balance < amount) {
      return { error: 'Saldo insuficiente' };
    }

    try {
      const newBalance = walletData.balance - amount;
      const newWithdrawn = walletData.total_withdrawn + amount;

      const { error } = await supabase
        .from('profiles')
        .update({ credito_demo: newBalance })
        .eq('id', user.id);

      if (error) {
        console.error('Erro ao atualizar crédito demo:', error);
        return { error: 'Erro ao processar retirada' };
      }

      setWalletData(prev => ({
        ...prev,
        balance: newBalance,
        total_withdrawn: newWithdrawn
      }));

      return { error: null };
    } catch (error) {
      console.error('Erro na retirada demo:', error);
      return { error: 'Erro interno' };
    }
  };

  useEffect(() => {
    fetchDemoWallet();
  }, [user]);

  return {
    walletData,
    loading,
    purchaseChestDemo,
    withdrawDemo,
    refreshData: fetchDemoWallet
  };
};