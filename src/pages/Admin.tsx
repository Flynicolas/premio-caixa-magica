import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminData } from '@/hooks/useAdminData';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Shield } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminContent } from '@/components/admin/AdminContent';

const Admin = () => {
  const { user } = useAuth();
  const { items, loading, isAdmin, refreshItems } = useAdminData();

  // Feature flag (local, read-only rollout)
  const [financeV2, setFinanceV2] = useState<boolean>(() => localStorage.getItem('admin_finance_v2') === 'true');
  const [precheck, setPrecheck] = useState<{ checked: boolean; ok: boolean; error?: string }>({ checked: false, ok: false });

  // Read-only pre-verification (tables presence) to avoid runtime errors
  useEffect(() => {
    if (!isAdmin) return;
    const run = async () => {
      try {
        const [a, b, c] = await Promise.all([
          supabase.from('cash_control_system').select('id').limit(1),
          supabase.from('financial_audit_log').select('id').limit(1),
          supabase.from('critical_financial_alerts').select('id').limit(1),
        ]);
        const ok = !a.error && !b.error && !c.error;
        setPrecheck({ checked: true, ok, error: ok ? undefined : (a.error?.message || b.error?.message || c.error?.message) });
      } catch (e: any) {
        setPrecheck({ checked: true, ok: false, error: String(e) });
      }
    };
    run();
  }, [isAdmin]);

  // Sync active section with URL (?section=)
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSection = searchParams.get('section') || 'overview';
  const [activeSection, setActiveSection] = useState<string>(initialSection);
  
  useEffect(() => {
    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      p.set('section', activeSection);
      return p;
    }, { replace: true });
  }, [activeSection, setSearchParams]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
              <p className="text-muted-foreground">Você precisa estar logado para acessar o painel administrativo.</p>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Verificando permissões...</p>
          </div>
        </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Shield className="w-12 h-12 mx-auto mb-4 text-red-500" />
              <h2 className="text-xl font-semibold mb-2">Acesso Negado</h2>
              <p className="text-muted-foreground">Você não tem permissão para acessar o painel administrativo.</p>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <AdminSidebar 
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          financeV2Enabled={financeV2 && precheck.ok}
        />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-lg font-semibold">Painel Administrativo</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Financeiro v2 (beta)</span>
              <Switch
                checked={financeV2 && precheck.ok}
                onCheckedChange={(val) => {
                  const next = Boolean(val);
                  localStorage.setItem('admin_finance_v2', String(next));
                  setFinanceV2(next);
                }}
                disabled={!precheck.checked || !precheck.ok}
              />
            </div>
          </header>

          {/* Main Content */}
          <AdminContent 
            activeSection={activeSection}
            items={items}
            refreshItems={refreshItems}
            financeV2Enabled={financeV2}
            precheckOk={precheck.ok}
          />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Admin;