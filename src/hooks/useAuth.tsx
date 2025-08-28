
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, phone: string, cpf?: string, birthDate?: string) => Promise<{ error: any }>;
  signInWithEmailOrPhone: (emailOrPhone: string, password: string) => Promise<{ error: any }>;
  signInWithCPF: (cpf: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (data: { full_name?: string; avatar_url?: string }) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, phone: string, cpf?: string, birthDate?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          phone: phone,
          cpf: cpf,
          birth_date: birthDate
        }
      }
    });

    if (error) {
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Cadastro realizado!",
        description: "Bem-vindo ao Baú Premiado! Você já está logado.",
        variant: "default"
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Login realizado!",
        description: "Bem-vindo de volta!",
        variant: "default"
      });
    }

    return { error };
  };

  const signInWithCPF = async (cpf: string, password: string) => {
    const cleanCPF = cpf.replace(/\D/g, '');
    
    try {
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('cpf', cleanCPF)
        .single();

      if (profileError || !profiles) {
        toast({
          title: "Erro no login",
          description: "CPF não encontrado",
          variant: "destructive"
        });
        return { error: new Error('CPF não encontrado') };
      }

      return await signIn(profiles.email, password);
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: "Erro ao buscar usuário",
        variant: "destructive"
      });
      return { error };
    }
  };

  const signInWithEmailOrPhone = async (emailOrPhone: string, password: string) => {
    // Detectar se é email, CPF ou telefone
    const isEmail = emailOrPhone.includes('@');
    const cleanInput = emailOrPhone.replace(/\D/g, '');
    
    if (isEmail) {
      return await signIn(emailOrPhone, password);
    } else if (cleanInput.length === 11 && !cleanInput.startsWith('1')) {
      // CPF tem 11 dígitos e não começa com 1
      return await signInWithCPF(emailOrPhone, password);
    } else {
      // Telefone
      try {
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('phone', cleanInput)
          .single();

        if (profileError || !profiles) {
          toast({
            title: "Erro no login",
            description: "Telefone não encontrado",
            variant: "destructive"
          });
          return { error: new Error('Telefone não encontrado') };
        }

        return await signIn(profiles.email, password);
      } catch (error: any) {
        toast({
          title: "Erro no login",
          description: "Erro ao buscar usuário",
          variant: "destructive"
        });
        return { error };
      }
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      toast({
        title: "Logout realizado",
        description: "Até logo!",
        variant: "default"
      });
    }
  };

  const updateProfile = async (data: { full_name?: string; avatar_url?: string }) => {
    if (!user) return { error: new Error('Usuário não logado') };

    try {
      const { error } = await (supabase as any)
        .from('profiles')
        .update(data)
        .eq('id', user.id);

      if (error) {
        toast({
          title: "Erro ao atualizar perfil",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Perfil atualizado!",
          description: "Suas informações foram salvas.",
          variant: "default"
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signOut,
      updateProfile,
      signInWithEmailOrPhone,
      signInWithCPF
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
