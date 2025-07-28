
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import PaymentModal from '@/components/PaymentModal';
import { useDemoWallet } from '@/hooks/useDemoWallet';

interface WalletData {
  balance: number;
  total_deposited: number;
  total_withdrawn: number;
  total_spent: number;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'prize' | 'purchase';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  created_at: string;
}

export const useWallet = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { walletData: demoWalletData, loading: demoLoading, purchaseChestDemo } = useDemoWallet();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [requiredAmount, setRequiredAmount] = useState<number | undefined>();
  
  // Se usuário está em modo demo, usar dados demo
  const effectiveWalletData = demoWalletData.is_demo ? {
    balance: demoWalletData.balance,
    total_deposited: demoWalletData.total_deposited,
    total_withdrawn: demoWalletData.total_withdrawn,
    total_spent: demoWalletData.total_spent
  } : walletData;
  
  const effectiveLoading = demoWalletData.is_demo ? demoLoading : loading;

  const fetchWalletData = async () => {
    if (!user) {
      console.log('🔍 [useWallet] Usuário não logado, resetando carteira');
      setWalletData(null);
      return;
    }

    try {
      console.log('🔍 [useWallet] Iniciando carregamento da carteira para usuário:', user.id);
      
      // Verificar se é admin para usar saldo de teste
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('simulate_actions')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('❌ [useWallet] Erro ao buscar perfil:', profileError);
        throw profileError;
      }

      console.log('✅ [useWallet] Perfil carregado:', profileData);

      const { data, error } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('❌ [useWallet] Erro ao buscar carteira:', error);
        throw error;
      }

      if (!data) {
        console.log('🔧 [useWallet] Carteira não existe, criando nova...');
        // Se não existir carteira, criar uma
        const { data: newWallet, error: createError } = await supabase
          .from('user_wallets')
          .insert({
            user_id: user.id,
            balance: 0.00,
            total_deposited: 0.00,
            total_withdrawn: 0.00,
            total_spent: 0.00
          })
          .select()
          .maybeSingle();

        if (createError) {
          console.error('❌ [useWallet] Erro ao criar carteira:', createError);
          throw createError;
        }

        console.log('✅ [useWallet] Nova carteira criada:', newWallet);
        setWalletData({
          balance: 0,
          total_deposited: 0,
          total_withdrawn: 0,
          total_spent: 0
        });
        return;
      }

      console.log('💰 [useWallet] Carteira encontrada:', data);
      
      // Calcular totais baseado nas transações
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('type, amount, status')
        .eq('user_id', user.id)
        .eq('status', 'completed');

      if (transactionsError) {
        console.error('⚠️ [useWallet] Erro ao buscar transações:', transactionsError);
      }

      let totalDeposited = 0;
      let totalWithdrawn = 0;
      let totalSpent = 0;

      transactionsData?.forEach(transaction => {
        if (transaction.type === 'deposit') {
          totalDeposited += Number(transaction.amount);
        } else if (transaction.type === 'withdrawal') {
          totalWithdrawn += Number(transaction.amount);
        } else if (transaction.type === 'purchase') {
          totalSpent += Number(transaction.amount);
        }
      });

      // Se for admin com simulate_actions, usar test_balance ao invés do balance real
      const isTestUser = profileData?.simulate_actions;
      const effectiveBalance = isTestUser ? Number(data.test_balance || 0) : Number(data.balance);

      console.log('📊 [useWallet] Dados calculados - Balance:', effectiveBalance, 'isTestUser:', isTestUser);

      setWalletData({
        balance: effectiveBalance,
        total_deposited: totalDeposited,
        total_withdrawn: totalWithdrawn,
        total_spent: totalSpent
      });
      
      console.log('✅ [useWallet] Carteira carregada com sucesso');
    } catch (error) {
      console.error('❌ [useWallet] Erro crítico ao carregar carteira:', error);
      toast({
        title: "Erro ao carregar carteira",
        description: "Não foi possível carregar os dados da carteira.",
        variant: "destructive"
      });
      
      // Fallback: definir dados vazios para evitar crash
      setWalletData({
        balance: 0,
        total_deposited: 0,
        total_withdrawn: 0,
        total_spent: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      // Cast the data to match our Transaction interface
      const typedTransactions: Transaction[] = (data || []).map(transaction => ({
        id: transaction.id,
        type: transaction.type as 'deposit' | 'withdrawal' | 'prize' | 'purchase',
        amount: Number(transaction.amount),
        status: transaction.status as 'pending' | 'completed' | 'failed' | 'cancelled',
        description: transaction.description || '',
        created_at: transaction.created_at
      }));
      
      setTransactions(typedTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const purchaseChest = async (chestType: string, amount: number) => {
    if (!user || !effectiveWalletData) {
      toast({
        title: "Erro",
        description: "Usuário não logado ou carteira não carregada.",
        variant: "destructive"
      });
      return { error: 'Usuário não logado' };
    }

    // Se for modo demo, usar função específica
    if (demoWalletData.is_demo) {
      return await purchaseChestDemo(chestType, amount);
    }

    if (effectiveWalletData.balance < amount) {
      // Calcular valor faltante e mostrar modal de pagamento
      const missingAmount = amount - effectiveWalletData.balance;
      setRequiredAmount(missingAmount);
      setShowPaymentModal(true);
      
      toast({
        title: "Saldo insuficiente",
        description: `Você precisa de R$ ${missingAmount.toFixed(2)} a mais para comprar este baú.`,
        variant: "destructive"
      });
      return { error: 'Saldo insuficiente' };
    }

    try {
      // Verificar se é admin com saldo de teste
      const { data: profileData } = await supabase
        .from('profiles')
        .select('simulate_actions')
        .eq('id', user.id)
        .single();

      const isTestUser = profileData?.simulate_actions;

      // Buscar wallet_id
      const { data: walletInfo } = await supabase
        .from('user_wallets')
        .select('id, test_balance')
        .eq('user_id', user.id)
        .single();

      if (!walletInfo) throw new Error('Carteira não encontrada');

      // Para usuários de teste (admins), não criar transação real
      if (!isTestUser) {
        // Criar transação de compra apenas para usuários reais
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            wallet_id: walletInfo.id,
            type: 'purchase',
            amount,
            status: 'completed',
            description: `Compra de baú ${chestType}`,
            metadata: { chest_type: chestType }
          });

        if (transactionError) throw transactionError;

        // Atualizar saldo real da carteira
        const newBalance = walletData.balance - amount;
        const { error: updateError } = await supabase
          .from('user_wallets')
          .update({ 
            balance: newBalance,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (updateError) throw updateError;
      } else {
        // Para admins, atualizar apenas o test_balance
        const newTestBalance = (walletInfo.test_balance || 0) - amount;
        const { error: updateError } = await supabase
          .from('user_wallets')
          .update({ 
            test_balance: Math.max(0, newTestBalance), // Não deixar negativo
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (updateError) throw updateError;
      }

      toast({
        title: "Baú comprado!",
        description: `Você comprou um baú ${chestType} por R$ ${amount.toFixed(2)}`,
        variant: "default"
      });

      await fetchWalletData();
      await fetchTransactions();

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao comprar baú",
        description: error.message,
        variant: "destructive"
      });
      return { error: error.message };
    }
  };

  const showPaymentModalForAmount = (amount?: number) => {
    setRequiredAmount(amount);
    setShowPaymentModal(true);
  };

  const PaymentModalComponent = () => (
    <PaymentModal
      isOpen={showPaymentModal}
      onClose={() => {
        setShowPaymentModal(false);
        setRequiredAmount(undefined);
      }}
      requiredAmount={requiredAmount}
      title={requiredAmount ? "Saldo Insuficiente" : "Adicionar Saldo"}
      description={requiredAmount 
        ? `Você precisa de pelo menos R$ ${requiredAmount.toFixed(2)} para continuar.`
        : "Escolha o valor para adicionar à sua carteira"
      }
    />
  );

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await fetchWalletData();
        if (user) {
          await fetchTransactions();
        }
      } catch (error) {
        console.error('❌ [useWallet] Erro no useEffect:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  return {
    walletData: effectiveWalletData,
    transactions,
    loading: effectiveLoading,
    purchaseChest,
    showPaymentModalForAmount,
    PaymentModalComponent,
    refreshData: async () => {
      await fetchWalletData();
      if (user) {
        await fetchTransactions();
      }
    },
  };
};
