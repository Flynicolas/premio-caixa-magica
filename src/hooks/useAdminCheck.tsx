
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useAdminCheck = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState<any>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setAdminData(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
          setAdminData(null);
        } else if (data) {
          setIsAdmin(true);
          setAdminData(data);
        } else {
          setIsAdmin(false);
          setAdminData(null);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        setAdminData(null);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  return { isAdmin, adminData, loading };
};
