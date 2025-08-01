
/**
 * @deprecated Este hook foi unificado com useWalletProvider
 * Use: import { useWallet } from '@/hooks/useWalletProvider'
 * Este arquivo será removido em breve
 */

import { useWallet as useUnifiedWallet } from './useWalletProvider';
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

/**
 * @deprecated Hook depreciado - use useWalletProvider
 */
export const useWallet = () => {
  console.warn('⚠️ useWallet from useWallet.tsx is deprecated. Use useWalletProvider instead.');
  return useUnifiedWallet();
};
