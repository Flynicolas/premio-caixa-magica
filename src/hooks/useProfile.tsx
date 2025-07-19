
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon?: string;
  rarity?: string;
  condition_type: string;
  condition_value: number;
  reward_experience?: number;
  is_active?: boolean;
}

export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: string;
  description: string;
  metadata?: any;
  experience_gained?: number;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  username?: string;
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

export const useProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null);
  const [allLevels, setAllLevels] = useState<UserLevel[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Buscar perfil do usuário
  const fetchProfile = async () => {
    if (!user) return;

    try {
      console.log('Buscando perfil para usuário:', user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        throw error;
      }
      
      console.log('Dados do perfil carregados:', data);
      
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

    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Erro ao carregar perfil",
        description: error.message || "Não foi possível carregar os dados do perfil.",
        variant: "destructive"
      });
    }
  };

  // Buscar nível atual do usuário
  const fetchUserLevel = async () => {
    if (!profile || allLevels.length === 0) return;

    try {
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

      if (error) throw error;
      
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

  // Atualizar perfil completo com validação
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error('Usuário não logado') };

    setSaving(true);
    
    try {
      console.log('Salvando atualizações do perfil:', updates);

      // Preparar dados para atualização - converter strings vazias em null
      const profileUpdates = {
        full_name: updates.full_name,
        username: updates.username === '' ? null : updates.username,
        phone: updates.phone === '' ? null : updates.phone,
        cpf: updates.cpf === '' ? null : updates.cpf,
        birth_date: updates.birth_date === '' ? null : updates.birth_date,
        zip_code: updates.zip_code === '' ? null : updates.zip_code,
        street: updates.street === '' ? null : updates.street,
        number: updates.number === '' ? null : updates.number,
        complement: updates.complement === '' ? null : updates.complement,
        neighborhood: updates.neighborhood === '' ? null : updates.neighborhood,
        city: updates.city === '' ? null : updates.city,
        state: updates.state === '' ? null : updates.state,
        email_notifications: updates.email_notifications,
        push_notifications: updates.push_notifications,
        prize_notifications: updates.prize_notifications,
        delivery_updates: updates.delivery_updates,
        promo_emails: updates.promo_emails,
        updated_at: new Date().toISOString()
      };

      // Remover campos undefined
      Object.keys(profileUpdates).forEach(key => {
        if (profileUpdates[key as keyof typeof profileUpdates] === undefined) {
          delete profileUpdates[key as keyof typeof profileUpdates];
        }
      });

      console.log('Dados a serem salvos:', profileUpdates);

      const { error } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', user.id);

      if (error) {
        console.error('Erro no Supabase:', error);
        throw error;
      }

      // Recarregar perfil após atualização
      await fetchProfile();
      
      toast({
        title: "✅ Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });

      return { error: null };
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        title: "❌ Erro ao atualizar perfil",
        description: error.message || "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      });
      return { error };
    } finally {
      setSaving(false);
    }
  };

  // Validar CPF
  const validateCPF = (cpf: string) => {
    if (!cpf) return false;
    const cleanCPF = cpf.replace(/\D/g, '');
    if (cleanCPF.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
    return true;
  };

  // Buscar endereço por CEP
  const fetchAddressByCEP = async (cep: string) => {
    try {
      const cleanCEP = cep.replace(/\D/g, '');
      if (cleanCEP.length !== 8) return null;

      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      const data = await response.json();
      
      if (data.erro) return null;
      
      return {
        street: data.logradouro,
        neighborhood: data.bairro,
        city: data.localidade,
        state: data.uf
      };
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      return null;
    }
  };

  useEffect(() => {
    if (user) {
      const loadData = async () => {
        try {
          setLoading(true);
          await fetchProfile();
          await fetchAllLevels();
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
      fetchUserLevel();
    }
  }, [profile, allLevels]);

  return {
    profile,
    userLevel,
    allLevels,
    achievements,
    userAchievements,
    loading,
    saving,
    updateProfile,
    validateCPF,
    fetchAddressByCEP
  };
};
