import React, { useState, lazy, Suspense, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminData } from '@/hooks/useAdminData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Shield, Package, Settings, Users, Wallet, Target, Truck, AlertTriangle, Gamepad2, TestTube, DollarSign, Palette } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
// Lazy-load heavy admin modules to improve performance without changing logic
const CollaboratorManagement = lazy(() => import('@/components/admin/CollaboratorManagement'));
const WalletControlPanel = lazy(() => import('@/components/admin/WalletControlPanel'));
const ItemManagementTab = lazy(() => import('@/components/admin/ItemManagementTab'));
const EnhancedChestProbabilityManager = lazy(() => import('@/components/admin/EnhancedChestProbabilityManager'));
const DeliveryManagementTab = lazy(() => import('@/components/admin/DeliveryManagementTab'));
const UsersManagement = lazy(() => import('@/components/admin/UsersManagement'));
const ChestGoalsManager = lazy(() => import('@/components/admin/ChestGoalsManager'));
const AdminErrorDashboard = lazy(() => import('@/components/admin/AdminErrorDashboard').then(m => ({ default: m.AdminErrorDashboard })));
const ScratchCardManager = lazy(() => import('@/components/admin/ScratchCardManager'));

const DemoItemsManager = lazy(() => import('@/components/admin/DemoItemsManager'));
const CaixaGeralDashboard = lazy(() => import('@/components/admin/CaixaGeralDashboard'));
const VisualCustomizationPanel = lazy(() => import('@/components/admin/VisualCustomizationPanel'));
const CashControlDashboard = lazy(() => import('@/components/admin/CashControlDashboard').then(m => ({ default: (m as any).default || (m as any).CashControlDashboard })));
const FinancialReconciliation = lazy(() => import('@/components/admin/FinancialReconciliation').then(m => ({ default: (m as any).default || (m as any).FinancialReconciliation })));
const AffiliateManagement = lazy(() => import('@/components/admin/AffiliateManagement').then(m => ({ default: m.AffiliateManagement })));



const Admin = () => {
  const { user } = useAuth();
  const { items, loading, isAdmin, refreshItems } = useAdminData();
const [showGoalsDialog, setShowGoalsDialog] = useState(false);

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

  // Sync active tab with URL (?tab=)
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'items';
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  useEffect(() => {
    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      p.set('tab', activeTab);
      return p;
    }, { replace: true });
  }, [activeTab, setSearchParams]);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
<div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Painel Administrativo</h1>
          <p className="text-muted-foreground">Gerencie o sistema de baús, itens, entregas e usuários</p>
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
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-10">
          <TabsTrigger value="items" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Itens
          </TabsTrigger>
          <TabsTrigger value="chests" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Baús
          </TabsTrigger>
          <TabsTrigger value="scratch" className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4" />
            Raspadinha
          </TabsTrigger>
          <TabsTrigger value="deliveries" className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            Entregas
          </TabsTrigger>
          <TabsTrigger value="caixa-geral" className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Caixa Geral
          </TabsTrigger>
          {financeV2 && precheck.ok && (
            <TabsTrigger value="finance" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Financeiro
            </TabsTrigger>
          )}
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="affiliates" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Afiliados
            </TabsTrigger>
          <TabsTrigger value="collaborators" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Colaboradores
          </TabsTrigger>
          <TabsTrigger value="errors" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Erros
          </TabsTrigger>
          <TabsTrigger value="demo" className="flex items-center gap-2">
            <TestTube className="w-4 h-4" />
            Demo
          </TabsTrigger>
          <TabsTrigger value="visual" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Visual
          </TabsTrigger>
        </TabsList>

<TabsContent value="items">
          <Suspense fallback={<div className="p-6 text-muted-foreground">Carregando itens...</div>}>
            <ItemManagementTab />
          </Suspense>
        </TabsContent>

        <TabsContent value="chests">
          <Suspense fallback={<div className="p-6 text-muted-foreground">Carregando gerenciador de baús...</div>}>
            <EnhancedChestProbabilityManager 
              items={items.filter(item => item.is_active)} 
              onRefresh={refreshItems} 
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="scratch">
          <Suspense fallback={<div className="p-6 text-muted-foreground">Carregando sistema RTP...</div>}>
            <ScratchCardManager />
          </Suspense>
        </TabsContent>

        <TabsContent value="deliveries">
          <Suspense fallback={<div className="p-6 text-muted-foreground">Carregando entregas...</div>}>
            <DeliveryManagementTab />
          </Suspense>
        </TabsContent>

        <TabsContent value="caixa-geral">
          <Suspense fallback={<div className="p-6 text-muted-foreground">Carregando caixa geral...</div>}>
            <CaixaGeralDashboard />
          </Suspense>
        </TabsContent>

          <TabsContent value="affiliates">
            <Suspense fallback={<div>Carregando gerenciamento de afiliados...</div>}>
              <AffiliateManagement />
            </Suspense>
          </TabsContent>

          <TabsContent value="users">
          <Suspense fallback={<div className="p-6 text-muted-foreground">Carregando usuários...</div>}>
            <UsersManagement />
          </Suspense>
        </TabsContent>

        <TabsContent value="collaborators">
          <Suspense fallback={<div className="p-6 text-muted-foreground">Carregando colaboradores...</div>}>
            <CollaboratorManagement />
          </Suspense>
        </TabsContent>

        <TabsContent value="errors">
          <Suspense fallback={<div className="p-6 text-muted-foreground">Carregando relatórios de erro...</div>}>
            <AdminErrorDashboard />
          </Suspense>
        </TabsContent>

        <TabsContent value="demo">
          <Suspense fallback={<div className="p-6 text-muted-foreground">Carregando itens demo...</div>}>
            <DemoItemsManager />
          </Suspense>
        </TabsContent>

        <TabsContent value="visual">
          <Suspense fallback={<div className="p-6 text-muted-foreground">Carregando personalização visual...</div>}>
            <VisualCustomizationPanel />
          </Suspense>
        </TabsContent>

        {financeV2 && precheck.ok && (
          <TabsContent value="finance">
            <div className="space-y-6">
              <Suspense fallback={<div className="p-6 text-muted-foreground">Carregando financeiro...</div>}>
                <CashControlDashboard />
              </Suspense>
              <Suspense fallback={<div className="p-6 text-muted-foreground">Carregando reconciliação...</div>}>
                <FinancialReconciliation />
              </Suspense>
            </div>
          </TabsContent>
        )}

      </Tabs>
      </div>
    </div>
  );
};

export default Admin;