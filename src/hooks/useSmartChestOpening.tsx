
import { useState } from 'react';
import { useInventory } from './useInventory';
import { useChestManagement } from './useChestManagement';
import { useWallet } from './useWallet';
import { useToast } from '@/hooks/use-toast';
import { DatabaseItem } from '@/types/database';

const CHEST_PRICES = {
  silver: 5.00,
  gold: 15.00,
  delas: 25.00,
  diamond: 35.00,
  ruby: 75.00,
  premium: 150.00
};

export const useSmartChestOpening = () => {
  const { openChest } = useInventory();
  const { updateFinancialData, shouldAllowExpensivePrize, createAlert } = useChestManagement();
  const { walletData, purchaseChest } = useWallet();
  const { toast } = useToast();
  const [isOpening, setIsOpening] = useState(false);

  const smartOpenChest = async (chestType: string): Promise<{ item: DatabaseItem | null, error: string | null }> => {
    setIsOpening(true);
    
    try {
      const chestPrice = CHEST_PRICES[chestType as keyof typeof CHEST_PRICES];
      
      if (!chestPrice) {
        return { item: null, error: 'Tipo de baú inválido' };
      }

      // Verificar se tem saldo suficiente
      if (!walletData || walletData.balance < chestPrice) {
        return { item: null, error: 'Saldo insuficiente' };
      }

      // Comprar o baú primeiro
      const purchaseResult = await purchaseChest(chestType, chestPrice);
      if (purchaseResult.error) {
        return { item: null, error: purchaseResult.error };
      }

      // Abrir o baú
      const result = await openChest(chestType);
      
      if (result.item) {
        const prizeValue = result.item.base_value;
        
        // Verificar se é um prêmio caro e se deve ser permitido
        if (prizeValue > chestPrice * 2) { // Prêmio vale mais que 2x o preço do baú
          const allowExpensive = shouldAllowExpensivePrize(chestType, prizeValue);
          
          if (!allowExpensive) {
            // Criar alerta de prêmio caro bloqueado
            await createAlert(
              chestType,
              'high_prize_ready',
              `Prêmio caro bloqueado: ${result.item.name} (R$ ${prizeValue.toFixed(2)}) no baú ${chestType}`,
              { item: result.item, blocked_prize_value: prizeValue }
            );
            
            // Por enquanto, vamos permitir mas criar o alerta
            // Em uma implementação mais avançada, você poderia realmente bloquear o prêmio
            console.log(`ALERTA: Prêmio caro liberado mesmo com meta não atingida: ${result.item.name}`);
          }
        }
        
        // Atualizar dados financeiros
        await updateFinancialData(chestType, chestPrice, prizeValue);
        
        toast({
          title: "Baú aberto com sucesso!",
          description: `Você ganhou: ${result.item.name} (R$ ${prizeValue.toFixed(2)})`,
          variant: "default"
        });
      }
      
      return result;
    } catch (error: any) {
      console.error('Erro ao abrir baú inteligente:', error);
      return { item: null, error: error.message || 'Erro interno' };
    } finally {
      setIsOpening(false);
    }
  };

  return {
    smartOpenChest,
    isOpening
  };
};
