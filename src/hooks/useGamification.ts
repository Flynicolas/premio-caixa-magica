import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useGamification = () => {
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  const addXP = async (userId: string, xp: number) => {
    const { error } = await supabase.rpc('add_experience_and_level', {
      user_id_input: userId,
      xp_to_add: xp,
    });

    if (error) console.error('Erro ao adicionar XP:', error);
  };

  const unlockAchievement = async (userId: string, identifier: string) => {
    const { data: achievement } = await supabase
      .from("achievements")
      .select("id")
      .eq("identifier", identifier)
      .single();

    if (!achievement) return;

    const { error } = await supabase
      .from("user_achievements")
      .insert({ user_id: userId, achievement_id: achievement.id });

    if (error) console.error("Erro ao desbloquear conquista:", error);
  };

  const checkAchievements = async (
    userId: string,
    chestPrice: number,
    itemId: string,
    itemRarity: string
  ) => {
    setIsChecking(true);
    try {
      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;

      if (!accessToken) {
        console.error('Token de acesso não encontrado.');
        return;
      }

      console.log("itemRarity", itemRarity)

      const { data, error } = await supabase.functions.invoke('check-achievements', {
        body: {
         item_rarity: itemRarity,
        }
      });


      if (error) throw error;

      if (data.unlocked?.length) {
        data.unlocked.forEach((id: string) => {
          toast({
            title: '🏆 Conquista desbloqueada!',
            description: `Você desbloqueou: ${formatAchievementName(id)}`,
          });
        });
      }
    } catch (err: any) {
      console.error('Erro ao verificar conquistas:', err);
      toast({
        title: 'Erro',
        description: 'Erro ao verificar conquistas.',
        variant: 'destructive',
      });
    } finally {
      setIsChecking(false);
    }
  };

  const processGamification = async (
    userId: string,
    item: any,
    chestPrice: number
  ) => {
    const xpGained = calculateXP(chestPrice, item.rarity);
    await addXP(userId, xpGained);
    await checkAchievements(userId, chestPrice, item.id, item.rarity);
  };

  const calculateXP = (price: number, rarity?: string): number => {
    const rarityBonus = {
      common: 1,
      uncommon: 2,
      rare: 5,
      epic: 10,
      legendary: 20,
      special: 15,
    };
    const baseXP = Math.floor(price); // 1 XP por real
    const rarityXP = rarityBonus[rarity || 'common'] || 0;
    return baseXP + rarityXP;
  };

  const formatAchievementName = (id: string): string => {
    switch (id) {
      case 'primeiro_bau': return 'Primeira Abertura de Baú';
      case '10_baus': return 'Abrir 10 Baús';
      case '100_baus': return 'Abrir 100 Baús';
      case 'todos_os_baus': return 'Abrir todos os tipos de Baú';
      case 'gasto_10': return 'Gastar R$ 10,00';
      case 'gasto_100': return 'Gastar R$ 100,00';
      case 'gasto_1000': return 'Gastar R$ 1.000,00';
      case 'item_epico': return 'Obter item épico';
      case '5_lendarios': return 'Obter 5 itens lendários';
      case '20_diferentes': return 'Coletar 20 itens diferentes';
      case 'primeiro_resgate': return 'Primeira Retirada';
      case '5_resgates': return '5 Retiradas';
      case 'resgate_lendario': return 'Retirada de item lendário';
      default: return id;
    }
  };

  return {
    addXP,
    unlockAchievement,
    checkAchievements,
    processGamification,
    isChecking,
  };
};
