import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ErrorData {
  error_type: string;
  error_message: string;
  error_stack?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  url?: string;
  metadata?: Record<string, any>;
}

export const useErrorTracking = () => {
  const { user } = useAuth();

  const logError = async (errorData: ErrorData) => {
    try {
      const { error } = await supabase
        .from('admin_error_logs')
        .insert({
          ...errorData,
          user_id: user?.id,
          user_agent: navigator.userAgent,
          url: window.location.href,
        });

      if (error) {
        console.error('Error logging to database:', error);
      }
    } catch (err) {
      console.error('Failed to log error:', err);
    }
  };

  // Capturar erros globais do JavaScript
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      logError({
        error_type: 'javascript_error',
        error_message: event.message,
        error_stack: event.error?.stack,
        severity: 'high',
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logError({
        error_type: 'unhandled_promise_rejection',
        error_message: event.reason?.message || String(event.reason),
        error_stack: event.reason?.stack,
        severity: 'critical',
        metadata: {
          reason: event.reason,
        },
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [user]);

  return { logError };
};