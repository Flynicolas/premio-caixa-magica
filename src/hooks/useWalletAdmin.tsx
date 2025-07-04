
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

interface WalletStats {
  totalSystemBalance: number;
  activeUsers: number;
  lowBalanceUsers: number;
  totalTransactions: number;
}

interface DailyStats {
  totalDeposits: number;
  depositsCount: number;
  chestSales: number;
  chestsCount: number;
  netProfit: number;
}

interface MonthlyStats {
  totalDeposits: number;
  chestSales: number;
  netProfit: number;
}

interface TopUser {
  user_id: string;
  email: string;
  total_spent: number;
  current_balance: number;
  transactions_count: number;
}

interface RecentTransaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  status: string;
  created_at: string;
  user_email: string;
}

export const useWalletAdmin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [stats, setStats] = useState<WalletStats>({
    totalSystemBalance: 0,
    activeUsers: 0,
    lowBalanceUsers: 0,
    totalTransactions: 0
  });
  
  const [dailyStats, setDailyStats] = useState<DailyStats>({
    totalDeposits: 0,
    depositsCount: 0,
    chestSales: 0,
    chestsCount: 0,
    netProfit: 0
  });
  
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats>({
    totalDeposits: 0,
    chestSales: 0,
    netProfit: 0
  });
  
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWalletStats = async () => {
    try {
      // Buscar estatísticas gerais
      const { data: walletsData } = await supabase
        .from('user_wallets')
        .select('balance');
      
      const totalBalance = walletsData?.reduce((sum, wallet) => sum + Number(wallet.balance), 0) || 0;
      const activeUsers = walletsData?.length || 0;
      const lowBalanceUsers = walletsData?.filter(wallet => Number(wallet.balance) < 10).length || 0;

      // Buscar total de transações
      const { count: totalTransactions } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalSystemBalance: totalBalance,
        activeUsers,
        lowBalanceUsers,
        totalTransactions: totalTransactions || 0
      });

    } catch (error: any) {
      console.error('Erro ao buscar estatísticas:', error);
      toast({
        title: "Erro ao carregar estatísticas",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const fetchDailyStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Buscar depósitos do dia
      const { data: depositsData } = await supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'deposit')
        .eq('status', 'completed')
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`);

      // Buscar compras de baús do dia
      const { data: purchasesData } = await supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'purchase')
        .eq('status', 'completed')
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`);

      const totalDeposits = depositsData?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const chestSales = purchasesData?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      setDailyStats({
        totalDeposits,
        depositsCount: depositsData?.length || 0,
        chestSales,
        chestsCount: purchasesData?.length || 0,
        netProfit: totalDeposits - chestSales
      });

    } catch (error: any) {
      console.error('Erro ao buscar estatísticas diárias:', error);
    }
  };

  const fetchMonthlyStats = async () => {
    try {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
      
      // Buscar depósitos do mês
      const { data: depositsData } = await supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'deposit')
        .eq('status', 'completed')
        .gte('created_at', firstDay)
        .lte('created_at', lastDay);

      // Buscar compras do mês
      const { data: purchasesData } = await supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'purchase')
        .eq('status', 'completed')
        .gte('created_at', firstDay)
        .lte('created_at', lastDay);

      const totalDeposits = depositsData?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const chestSales = purchasesData?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      setMonthlyStats({
        totalDeposits,
        chestSales,
        netProfit: totalDeposits - chestSales
      });

    } catch (error: any) {
      console.error('Erro ao buscar estatísticas mensais:', error);
    }
  };

  const fetchTopUsers = async () => {
    try {
      const { data } = await supabase
        .from('transactions')
        .select(`
          user_id,
          amount
        `)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (data) {
        // Buscar perfis dos usuários separadamente
        const userIds = [...new Set(data.map(t => t.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, email')
          .in('id', userIds);

        // Buscar carteiras dos usuários
        const { data: wallets } = await supabase
          .from('user_wallets')
          .select('user_id, balance')
          .in('user_id', userIds);

        // Agrupar por usuário e calcular totais
        const userStats = data.reduce((acc: any, transaction: any) => {
          const userId = transaction.user_id;
          const userProfile = profiles?.find(p => p.id === userId);
          const userWallet = wallets?.find(w => w.user_id === userId);
          const email = userProfile?.email || 'Email não encontrado';
          const balance = Number(userWallet?.balance || 0);
          
          if (!acc[userId]) {
            acc[userId] = {
              user_id: userId,
              email,
              total_spent: 0,
              current_balance: balance,
              transactions_count: 0
            };
          }
          
          acc[userId].total_spent += Number(transaction.amount);
          acc[userId].transactions_count += 1;
          
          return acc;
        }, {});

        // Converter para array e ordenar por valor gasto
        const topUsersArray = Object.values(userStats)
          .sort((a: any, b: any) => b.total_spent - a.total_spent)
          .slice(0, 5);

        setTopUsers(topUsersArray as TopUser[]);
      }

    } catch (error: any) {
      console.error('Erro ao buscar top usuários:', error);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const { data: transactions } = await supabase
        .from('transactions')
        .select(`
          id,
          type,
          amount,
          description,
          status,
          created_at,
          user_id
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (transactions) {
        // Buscar perfis dos usuários separadamente
        const userIds = [...new Set(transactions.map(t => t.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, email')
          .in('id', userIds);

        const formattedTransactions = transactions.map(transaction => ({
          id: transaction.id,
          type: transaction.type,
          amount: Number(transaction.amount),
          description: transaction.description || `Transação ${transaction.type}`,
          status: transaction.status,
          created_at: transaction.created_at,
          user_email: profiles?.find(p => p.id === transaction.user_id)?.email || 'Email não encontrado'
        }));

        setRecentTransactions(formattedTransactions);
      }

    } catch (error: any) {
      console.error('Erro ao buscar transações recentes:', error);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchWalletStats(),
      fetchDailyStats(),
      fetchMonthlyStats(),
      fetchTopUsers(),
      fetchRecentTransactions()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchAllData();
      
      // Atualizar dados a cada 30 segundos
      const interval = setInterval(fetchAllData, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  return {
    stats,
    dailyStats,
    monthlyStats,
    topUsers,
    recentTransactions,
    loading,
    refreshData: fetchAllData
  };
};
