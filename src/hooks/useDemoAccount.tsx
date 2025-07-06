
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface DemoAccount {
  balance: number;
  isDemo: boolean;
  lastReset: string;
  dailyWins: number;
}

export const useDemoAccount = () => {
  const { user } = useAuth();
  const [demoAccount, setDemoAccount] = useState<DemoAccount | null>(null);

  // Verificar se é conta demo (não cadastrada)
  const isDemoAccount = !user;

  useEffect(() => {
    if (isDemoAccount) {
      initializeDemoAccount();
    }
  }, [isDemoAccount]);

  const initializeDemoAccount = () => {
    const today = new Date().toDateString();
    const savedDemo = localStorage.getItem('demoAccount');
    
    if (savedDemo) {
      const parsed = JSON.parse(savedDemo);
      
      // Resetar saldo diário
      if (parsed.lastReset !== today) {
        const newDemo: DemoAccount = {
          balance: 100.00, // Saldo diário renovável
          isDemo: true,
          lastReset: today,
          dailyWins: 0
        };
        setDemoAccount(newDemo);
        localStorage.setItem('demoAccount', JSON.stringify(newDemo));
      } else {
        setDemoAccount(parsed);
      }
    } else {
      // Primeira vez
      const newDemo: DemoAccount = {
        balance: 100.00,
        isDemo: true,
        lastReset: today,
        dailyWins: 0
      };
      setDemoAccount(newDemo);
      localStorage.setItem('demoAccount', JSON.stringify(newDemo));
    }
  };

  const updateDemoBalance = (amount: number) => {
    if (!demoAccount) return;
    
    const updated = {
      ...demoAccount,
      balance: Math.max(0, demoAccount.balance + amount)
    };
    
    setDemoAccount(updated);
    localStorage.setItem('demoAccount', JSON.stringify(updated));
  };

  const incrementDemoWins = () => {
    if (!demoAccount) return;
    
    const updated = {
      ...demoAccount,
      dailyWins: demoAccount.dailyWins + 1
    };
    
    setDemoAccount(updated);
    localStorage.setItem('demoAccount', JSON.stringify(updated));
  };

  // Algoritmo de prêmios para conta demo
  const getDemoPrizeBonus = () => {
    if (!demoAccount) return 1;
    
    // Aumentar chances de prêmios bons nas primeiras jogadas
    if (demoAccount.dailyWins < 5) {
      return 2.5; // 2.5x mais chance de prêmios raros
    } else if (demoAccount.dailyWins < 10) {
      return 1.8;
    } else {
      return 1.2; // Ainda melhor que contas normais
    }
  };

  return {
    isDemoAccount,
    demoAccount,
    updateDemoBalance,
    incrementDemoWins,
    getDemoPrizeBonus,
    resetDemoAccount: initializeDemoAccount
  };
};
