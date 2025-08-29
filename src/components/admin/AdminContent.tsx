import React, { Suspense, lazy } from 'react'
import { AdminScratchCardManager } from './AdminScratchCardManager'

// Lazy-load components - same as original Admin.tsx
const CollaboratorManagement = lazy(() => import('./CollaboratorManagement'))
const ItemManagementTab = lazy(() => import('./ItemManagementTab'))
const EnhancedChestProbabilityManager = lazy(() => import('./EnhancedChestProbabilityManager'))
const DeliveryManagementTab = lazy(() => import('./DeliveryManagementTab'))
const UsersManagement = lazy(() => import('./UsersManagement'))
const AdminErrorDashboard = lazy(() => import('./AdminErrorDashboard').then(m => ({ default: m.AdminErrorDashboard })))
const DemoItemsManager = lazy(() => import('./DemoItemsManager'))
const CaixaGeralDashboard = lazy(() => import('./CaixaGeralDashboard'))
const VisualCustomizationPanel = lazy(() => import('./VisualCustomizationPanel'))
const CashControlDashboard = lazy(() => import('./CashControlDashboard').then(m => ({ default: (m as any).default || (m as any).CashControlDashboard })))
const FinancialReconciliation = lazy(() => import('./FinancialReconciliation').then(m => ({ default: (m as any).default || (m as any).FinancialReconciliation })))
const AffiliateManagement = lazy(() => import('./AffiliateManagement').then(m => ({ default: m.AffiliateManagement })))

interface AdminContentProps {
  activeSection: string
  items: any[]
  refreshItems: () => void
  financeV2Enabled: boolean
  precheckOk: boolean
}

export function AdminContent({ activeSection, items, refreshItems, financeV2Enabled, precheckOk }: AdminContentProps) {
  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Painel Administrativo</h1>
              <p className="text-muted-foreground">Visão geral do sistema de gestão</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Quick stats cards here */}
            </div>
          </div>
        )

      case 'items':
        return (
          <Suspense fallback={<div className="p-6 text-muted-foreground">Carregando itens...</div>}>
            <ItemManagementTab />
          </Suspense>
        )

      case 'chests':
        return (
          <Suspense fallback={<div className="p-6 text-muted-foreground">Carregando gerenciador de baús...</div>}>
            <EnhancedChestProbabilityManager 
              items={items.filter(item => item.is_active)} 
              onRefresh={refreshItems} 
            />
          </Suspense>
        )

      case 'scratch':
      case 'scratch-rtp':
      case 'scratch-items':
      case 'scratch-manual':
      case 'scratch-reports':
        return (
          <Suspense fallback={<div className="p-6 text-muted-foreground">Carregando sistema RTP...</div>}>
            <AdminScratchCardManager activeTab={activeSection} />
          </Suspense>
        )

      case 'deliveries':
        return (
          <Suspense fallback={<div className="p-6 text-muted-foreground">Carregando entregas...</div>}>
            <DeliveryManagementTab />
          </Suspense>
        )

      case 'caixa-geral':
        return (
          <Suspense fallback={<div className="p-6 text-muted-foreground">Carregando caixa geral...</div>}>
            <CaixaGeralDashboard />
          </Suspense>
        )

      case 'finance':
        if (!financeV2Enabled || !precheckOk) return null
        return (
          <div className="space-y-6">
            <Suspense fallback={<div className="p-6 text-muted-foreground">Carregando financeiro...</div>}>
              <CashControlDashboard />
            </Suspense>
            <Suspense fallback={<div className="p-6 text-muted-foreground">Carregando reconciliação...</div>}>
              <FinancialReconciliation />
            </Suspense>
          </div>
        )

      case 'users':
        return (
          <Suspense fallback={<div className="p-6 text-muted-foreground">Carregando usuários...</div>}>
            <UsersManagement />
          </Suspense>
        )

      case 'affiliates':
        return (
          <Suspense fallback={<div>Carregando gerenciamento de afiliados...</div>}>
            <AffiliateManagement />
          </Suspense>
        )

      case 'collaborators':
        return (
          <Suspense fallback={<div className="p-6 text-muted-foreground">Carregando colaboradores...</div>}>
            <CollaboratorManagement />
          </Suspense>
        )

      case 'errors':
        return (
          <Suspense fallback={<div className="p-6 text-muted-foreground">Carregando relatórios de erro...</div>}>
            <AdminErrorDashboard />
          </Suspense>
        )

      case 'demo':
        return (
          <Suspense fallback={<div className="p-6 text-muted-foreground">Carregando itens demo...</div>}>
            <DemoItemsManager />
          </Suspense>
        )

      case 'visual':
        return (
          <Suspense fallback={<div className="p-6 text-muted-foreground">Carregando personalização visual...</div>}>
            <VisualCustomizationPanel />
          </Suspense>
        )

      default:
        return (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Seção não encontrada</p>
          </div>
        )
    }
  }

  return (
    <div className="flex-1 p-6">
      {renderContent()}
    </div>
  )
}