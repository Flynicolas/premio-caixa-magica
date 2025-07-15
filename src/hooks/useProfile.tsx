
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  username?: string;
  bio?: string;
  phone?: string;
  cpf?: string;
  birth_date?: string;

  zip_code?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;

  email_notifications?: boolean;
  push_notifications?: boolean;
  prize_notifications?: boolean;
  delivery_updates?: boolean;
  promo_emails?: boolean;

  level: number;
  experience: number;
  total_spent: number;
  total_prizes_won: number;
  chests_opened: number;
  join_date: string;
  last_login: string;
  is_active: boolean;
  preferences: any;
  achievements: any[];
  created_at: string;
  updated_at: string;
}


export interface UserLevel {
  id: string;
  level: number;
  name: string;
  min_experience: number;
  max_experience?: number;
  benefits: string[];
  icon: string;
  color: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  condition_type: string;
  condition_value: number;
  reward_experience: number;
  is_active: boolean;
}

export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: string;
  description: string;
  metadata: any;
  experience_gained: number;
  created_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<any[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [allLevels, setAllLevels] = useState<UserLevel[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar perfil do usuário
  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      // Converter os dados do Supabase para o formato esperado
      const profileData: UserProfile = {
        ...data,
        achievements: Array.isArray(data.achievements) ? data.achievements : [],
        preferences: data.preferences || {}
      };
      
      setProfile(profileData);

      // Atualizar último login
      await supabase
        .from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id);

    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // Buscar nível atual do usuário
const fetchUserLevel = async () => {
    console.log("to aq")
  if (!profile || allLevels.length === 0) return;
    console.log("to aq 1")

  try {
    console.log('profile.experience', profile.experience)
    const { data, error } = await supabase.rpc('calculate_user_level', {
      experience: profile.experience
    });

    if (error) throw error;

    const levelNumber = data?.[0]?.level;

    if (!levelNumber) return;

    const fullLevelData = allLevels.find(l => l.level === levelNumber);
    if (fullLevelData) {
      setUserLevel(fullLevelData);
    }
  } catch (error) {
    console.error('Error fetching user level:', error);
  }
};


  // Buscar todos os níveis
  const fetchAllLevels = async () => {
    try {
 const { data, error } = await supabase
  .from('user_levels')
  .select('*')
  .order('level', { ascending: true });

console.log("user_levels data:", data);
console.log("user_levels error:", error);


      if (error) throw error;
      
      // Converter os dados para o formato esperado
      const levelsData: UserLevel[] = (data || []).map(level => ({
        id: level.id,
        level: level.level,
        name: level.name,
        min_experience: level.min_experience,
        max_experience: level.max_experience,
        benefits: Array.isArray(level.benefits) ? level.benefits : 
                 typeof level.benefits === 'string' ? JSON.parse(level.benefits) : [],
        icon: level.icon || '',
        color: level.color || ''
      }));
      
      setAllLevels(levelsData);
    } catch (error) {
      console.error('Error fetching levels:', error);
    }
  };

  // Buscar conquistas disponíveis
  const fetchAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true)
        .order('condition_value', { ascending: true });

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  // Buscar conquistas do usuário
  const fetchUserAchievements = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false });

      if (error) throw error;
      setUserAchievements(data || []);
    } catch (error) {
      console.error('Error fetching user achievements:', error);
    }
  };

  // Buscar atividades do usuário
  const fetchActivities = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  // Atualizar perfil
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error('Usuário não logado') };

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      await fetchProfile();
      
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }
  };

  // Registrar atividade
  const logActivity = async (
    activityType: string,
    description: string,
    metadata: any = {},
    experienceGained: number = 0
  ) => {
    if (!user) return;

    try {
      await supabase.rpc('log_user_activity', {
        p_user_id: user.id,
        p_activity_type: activityType,
        p_description: description,
        p_metadata: metadata,
        p_experience_gained: experienceGained
      });

      // Recarregar dados após registrar atividade
      await fetchProfile();
      await fetchActivities();
      
      if (experienceGained > 0) {
        toast({
          title: `+${experienceGained} XP!`,
          description: description,
        });
      }
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  // Verificar e desbloquear conquistas
  const checkAchievements = async () => {
    if (!user || !profile) return;

    for (const achievement of achievements) {
      // Verificar se já possui a conquista
      const hasAchievement = userAchievements.some(
        ua => ua.achievement_id === achievement.id
      );
      
      if (hasAchievement) continue;

      let shouldUnlock = false;

      switch (achievement.condition_type) {
        case 'chests_opened':
          shouldUnlock = profile.chests_opened >= achievement.condition_value;
          break;
        case 'total_spent':
          shouldUnlock = profile.total_spent >= achievement.condition_value;
          break;
        default:
          break;
      }

      if (shouldUnlock) {
        try {
          await supabase
            .from('user_achievements')
            .insert({
              user_id: user.id,
              achievement_id: achievement.id
            });

          await logActivity(
            'achievement_unlocked',
            `Conquista desbloqueada: ${achievement.name}`,
            { achievement_id: achievement.id },
            achievement.reward_experience
          );

          toast({
            title: "🏆 Nova Conquista!",
            description: `${achievement.icon} ${achievement.name}`,
          });
        } catch (error) {
          console.error('Error unlocking achievement:', error);
        }
      }
    }

    await fetchUserAchievements();
  };

 useEffect(() => {
  
  if (user) {
    const loadData = async () => {
      try {
        setLoading(true);
        await fetchProfile();
        await fetchAllLevels(); // precisa vir antes do fetchUserLevel
      } catch (error) {
        console.error('Error loading profile data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  } else {
    setLoading(false);
  }
}, [user]);

useEffect(() => {
  if (profile && allLevels.length > 0) {
    const loadProfileData = async () => {
      try {
        await Promise.all([
          fetchUserLevel(),
          fetchUserAchievements(),
          fetchActivities()
        ]);
        await checkAchievements();
      } catch (error) {
        console.error('Error loading profile specific data:', error);
      }
    };
    loadProfileData();
  }
}, [profile, allLevels]);

  const recentAchievements = userAchievements.slice(0, 3);

  return {
    profile,
    userLevel,
    achievements,
    userAchievements,
    recentAchievements,
    activities,
    allLevels,
    loading,
    updateProfile,
    logActivity,
    checkAchievements
  };
};
