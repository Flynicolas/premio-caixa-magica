import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useDeviceFingerprint } from './useDeviceFingerprint';

interface SignUpData {
  fullName: string;
  cpf: string;
  birthDate: string;
  email: string;
  phone: string;
  password: string;
  referralCode?: string;
  rememberMe?: boolean;
}

interface SignInData {
  identifier: string; // email, CPF ou telefone
  password: string;
  rememberMe?: boolean;
}

export const useAdvancedAuth = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { fingerprint, deviceInfo } = useDeviceFingerprint();

  const normalizeIdentifier = (identifier: string) => {
    // Remove formatação do CPF e telefone
    return identifier.replace(/\D/g, '');
  };

  const detectIdentifierType = (identifier: string): 'email' | 'cpf' | 'phone' => {
    if (identifier.includes('@')) {
      return 'email';
    }
    
    const clean = normalizeIdentifier(identifier);
    if (clean.length === 11 && !clean.startsWith('1')) {
      return 'cpf'; // CPF tem 11 dígitos e não começa com 1
    }
    
    return 'phone';
  };

  const checkDuplicates = async (email: string, cpf?: string) => {
    try {
      const { data, error } = await supabase.rpc('check_user_duplicates', {
        p_email: email,
        p_cpf: cpf || null
      });

      if (error) throw error;
      
      const result = data?.[0];
      return {
        hasDuplicate: result?.has_duplicate || false,
        duplicateType: result?.duplicate_type || '',
        message: result?.duplicate_message || ''
      };
    } catch (error: any) {
      console.error('Erro ao verificar duplicatas:', error);
      return { hasDuplicate: false, duplicateType: '', message: '' };
    }
  };

  const validateCPF = (cpf: string): boolean => {
    const cleanCPF = cpf.replace(/\D/g, '');
    
    if (cleanCPF.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF[i]) * (10 - i);
    }
    let digit = (sum * 10) % 11;
    if (digit === 10 || digit === 11) digit = 0;
    if (digit !== parseInt(cleanCPF[9])) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF[i]) * (11 - i);
    }
    digit = (sum * 10) % 11;
    if (digit === 10 || digit === 11) digit = 0;
    if (digit !== parseInt(cleanCPF[10])) return false;

    return true;
  };

  const validateAge = (birthDate: string): boolean => {
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1 >= 18;
    }
    
    return age >= 18;
  };

  const signUp = useCallback(async (data: SignUpData) => {
    setLoading(true);

    try {
      // Validações
      if (!validateCPF(data.cpf)) {
        throw new Error('CPF inválido');
      }

      if (!validateAge(data.birthDate)) {
        throw new Error('Você deve ter pelo menos 18 anos para se cadastrar');
      }

      // Verificar duplicatas
      const duplicateCheck = await checkDuplicates(data.email, data.cpf);
      if (duplicateCheck.hasDuplicate) {
        throw new Error(duplicateCheck.message);
      }

      // Registrar tentativa de cadastro
      const clientIP = await fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => data.ip)
        .catch(() => 'unknown');

      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: data.fullName,
            phone: data.phone,
            cpf: data.cpf,
            birth_date: data.birthDate,
            referral_code: data.referralCode,
            device_fingerprint: fingerprint,
            remember_login: data.rememberMe || false
          }
        }
      });

      if (authError) throw authError;

      // Registrar tentativa de cadastro (simplificado por enquanto)
      console.log('Registrando cadastro para:', data.email);

      toast({
        title: "✅ Cadastro realizado!",
        description: "Bem-vindo ao Baú Premiado! Login automático realizado.",
      });

      // Auto login após cadastro bem-sucedido
      return { success: true, user: authData.user };

    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      
      // Registrar tentativa de falha (simplificado por enquanto)
      if (data.email) {
        console.log('Erro no cadastro para:', data.email, error.message);
      }

      toast({
        title: "❌ Erro no cadastro",
        description: error.message,
        variant: "destructive"
      });

      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [fingerprint, toast]);

  const signIn = useCallback(async (data: SignInData) => {
    setLoading(true);

    try {
      const identifierType = detectIdentifierType(data.identifier);
      let email = data.identifier;

      // Se não for email, buscar email pelo CPF ou telefone
      if (identifierType !== 'email') {
        const cleanIdentifier = normalizeIdentifier(data.identifier);
        
        const searchField = identifierType === 'cpf' ? 'cpf' : 'phone';
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq(searchField, cleanIdentifier)
          .single();

        if (profileError || !profileData) {
          throw new Error(`${identifierType === 'cpf' ? 'CPF' : 'Telefone'} não encontrado`);
        }

        email = profileData.email;
      }

      // Fazer login
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: data.password
      });

      if (authError) throw authError;

      // Atualizar informações do dispositivo se remember_me estiver ativo
      if (data.rememberMe && authData.user) {
        await supabase
          .from('profiles')
          .update({
            device_fingerprint: fingerprint,
            remember_login: true
          })
          .eq('id', authData.user.id);
      }

      // Registrar login bem-sucedido (simplificado por enquanto)
      console.log('Login bem-sucedido para:', email);

      toast({
        title: "✅ Login realizado!",
        description: "Bem-vindo de volta!",
      });

      return { success: true, user: authData.user };

    } catch (error: any) {
      console.error('Erro no login:', error);

      // Registrar tentativa de falha (simplificado por enquanto)
      console.log('Erro no login:', error.message);

      toast({
        title: "❌ Erro no login",
        description: error.message,
        variant: "destructive"
      });

      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [fingerprint, deviceInfo, toast]);

  return {
    signUp,
    signIn,
    loading,
    validateCPF,
    validateAge,
    checkDuplicates
  };
};