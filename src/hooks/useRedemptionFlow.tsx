import { useState } from 'react';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';
import { useWallet } from './useWalletProvider';
import { useWithdrawItem } from './useWithdrawItem';
import { useToast } from './use-toast';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

export interface RedemptionItem {
  id: string;
  item_id: string;
  item?: {
    id: string;
    name: string;
    image_url?: string;
    base_value?: number;
  };
}

export interface RedemptionResult {
  success: boolean;
  insufficientBalance?: boolean;
  requiresProfile?: boolean;
  method?: 'wallet' | 'external';
}

export const useRedemptionFlow = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { walletData } = useWallet();
  const { resgateComCarteira, solicitarRetirada } = useWithdrawItem();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const DELIVERY_FEE = 25.0;

  const validateProfile = () => {
    if (!profile?.full_name || !profile?.cpf) {
      return false;
    }

    const addressComplete = profile?.zip_code && profile?.street && profile?.number && 
                           profile?.neighborhood && profile?.city && profile?.state;
    return !!addressComplete;
  };

  const redirectToProfile = () => {
    toast({
      title: "Complete seu cadastro",
      description: "Você precisa informar nome completo, CPF e endereço para retirar prêmios.",
      variant: "destructive",
    });
    
    Cookies.set("redirected_from_retirada", "true", { path: "/" });
    navigate("/configuracoes");
  };

  const getPaymentMethod = (userBalance: number): 'wallet' | 'external' => {
    return userBalance >= DELIVERY_FEE ? 'wallet' : 'external';
  };

  const redeemItem = async (
    item: RedemptionItem,
    forceMethod?: 'wallet' | 'external'
  ): Promise<RedemptionResult> => {
    if (!user || !profile) {
      return { success: false, requiresProfile: true };
    }

    if (!validateProfile()) {
      redirectToProfile();
      return { success: false, requiresProfile: true };
    }

    // Validar dados do item
    if (!item) {
      toast({
        title: 'Erro',
        description: 'Item não encontrado.',
        variant: 'destructive',
      });
      return { success: false };
    }

    // Usar item_id diretamente ou pegar do item aninhado
    const itemId = item.item?.id || item.item_id;
    if (!itemId) {
      toast({
        title: 'Erro',
        description: 'ID do item não encontrado.',
        variant: 'destructive',
      });
      return { success: false };
    }

    const userBalance = walletData?.balance || 0;
    const method = forceMethod || getPaymentMethod(userBalance);

    setIsProcessing(true);

    try {
      const addressData = {
        zip_code: profile.zip_code!,
        street: profile.street!,
        number: profile.number!,
        complement: profile.complement || '',
        neighborhood: profile.neighborhood!,
        city: profile.city!,
        state: profile.state!,
      };

      if (method === 'wallet') {
        const result = await resgateComCarteira({
          itemId,
          inventoryId: item.id,
          fullName: profile.full_name!,
          cpf: profile.cpf!,
          address: addressData,
          userBalance,
        });

        if (result.success) {
          toast({
            title: 'Resgate realizado!',
            description: 'Seu prêmio foi resgatado com sucesso usando saldo da carteira.',
            variant: 'default',
          });
        } else if (result.insufficientBalance) {
          toast({
            title: 'Saldo insuficiente',
            description: `Você precisa de R$ ${DELIVERY_FEE.toFixed(2)} para resgatar este prêmio.`,
            variant: 'destructive',
          });
        }

        return result;
      } else {
        await solicitarRetirada({
          itemId,
          inventoryId: item.id,
          fullName: profile.full_name!,
          cpf: profile.cpf!,
          address: addressData,
        });

        toast({
          title: 'Solicitação enviada!',
          description: 'Você será redirecionado para o pagamento.',
          variant: 'default',
        });

        return { success: true, method: 'external' };
      }
    } catch (error: any) {
      console.error('Erro no resgate:', error);
      toast({
        title: 'Erro ao processar resgate',
        description: error.message || 'Tente novamente em instantes.',
        variant: 'destructive',
      });
      return { success: false };
    } finally {
      setIsProcessing(false);
    }
  };

  const canUseWallet = (userBalance: number): boolean => {
    return userBalance >= DELIVERY_FEE;
  };

  return {
    redeemItem,
    isProcessing,
    canUseWallet,
    getPaymentMethod,
    validateProfile,
    deliveryFee: DELIVERY_FEE,
    userBalance: walletData?.balance || 0,
  };
};