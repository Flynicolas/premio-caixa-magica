import { useEffect, useMemo, useState } from 'react';
import { useAdminCheck } from '@/hooks/useAdminCheck';

/**
 * Admin Test Mode helper
 * - Enabled only for admins
 * - Controlled by localStorage key: "admin_test_mode" (default: "true")
 * - Does NOT affect real users or backend data
 */
export const useAdminTestMode = () => {
  const { isAdmin } = useAdminCheck();
  const [flag, setFlag] = useState<boolean>(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('admin_test_mode');
      if (raw === null) {
        // default ON for admins
        setFlag(true);
      } else {
        setFlag(raw !== 'false');
      }
    } catch {
      setFlag(true);
    }
  }, []);

  return useMemo(() => ({ isEnabled: isAdmin && flag, isAdmin }), [isAdmin, flag]);
};
