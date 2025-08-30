import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useScratchCardManagement } from '@/hooks/useScratchCardManagement'
import { useScratchCardAdministration } from '@/hooks/useScratchCardAdministration'
import { useAdvancedScratchCard } from '@/hooks/useAdvancedScratchCard'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar
} from '@/components/ui/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  BarChart3, 
  Package, 
  Settings2, 
  Shield, 
  AlertTriangle, 
  Sparkles,
  TrendingUp,
  DollarSign
} from 'lucide-react'
import { ScratchCardDashboard } from './sidebar-sections/ScratchCardDashboard'
import { ScratchCardItemManager } from './sidebar-sections/ScratchCardItemManager'
import { ScratchCardUnifiedControls } from './sidebar-sections/ScratchCardUnifiedControls'
import { ScratchCardAnalytics } from './sidebar-sections/ScratchCardAnalytics'

interface SidebarMenuItem {
  id: string
  title: string
  icon: any
  section: string
}

const menuItems: SidebarMenuItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: BarChart3,
    section: 'scratch-dashboard'
  },
  {
    id: 'items',
    title: 'Gerenciar Itens',
    icon: Package,
    section: 'scratch-items'
  },
  {
    id: 'controls',
    title: 'Configurações',
    icon: Settings2,
    section: 'scratch-controls'
  },
  {
    id: 'analytics',
    title: 'Análises',
    icon: TrendingUp,
    section: 'scratch-analytics'
  }
]

function ScratchCardSidebar() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { state } = useSidebar()
  
  const currentSection = searchParams.get('section') || 'scratch-dashboard'
  
  const handleSectionChange = (section: string) => {
    navigate(`/admin?section=${section}`)
  }

  const isCollapsed = state === 'collapsed'

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 py-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              {!isCollapsed && "Raspadinhas"}
            </div>
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = currentSection === item.section
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => handleSectionChange(item.section)}
                      className={isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50"}
                    >
                      <item.icon className="w-4 h-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

export function ScratchCardSidebarAdmin() {
  const [searchParams] = useSearchParams()
  const currentSection = searchParams.get('section') || 'scratch-dashboard'
  
  const { scratchTypes, probabilities, loading: managementLoading } = useScratchCardManagement()
  const { settings, loading: adminLoading } = useScratchCardAdministration()
  const { scratchCards, loading: advancedLoading } = useAdvancedScratchCard()

  const loading = managementLoading || adminLoading || advancedLoading

  // Calculate dashboard statistics
  const stats = {
    totalTypes: scratchTypes?.length || settings?.length || 0,
    configuredTypes: probabilities ? new Set(probabilities.filter(p => p.is_active).map(p => p.scratch_type)).size : 0,
    totalItems: probabilities?.filter(p => p.is_active)?.length || 0,
    dangerousConfigs: scratchCards?.filter(sc => 
      (sc.win_probability_global || 0) > 15 || ((sc as any).target_rtp || 0) > 20
    ).length || 0,
    healthyProfit: scratchCards?.filter(sc => {
      const winProb = sc.win_probability_global || 0
      const targetRtp = (sc as any).target_rtp || 0
      return winProb >= 5 && winProb <= 10 && targetRtp >= 10 && targetRtp <= 15
    }).length || 0
  }

  const renderContent = () => {
    switch (currentSection) {
      case 'scratch-dashboard':
        return <ScratchCardDashboard stats={stats} scratchTypes={scratchTypes} probabilities={probabilities} scratchCards={scratchCards} />
      case 'scratch-items':
        return <ScratchCardItemManager />
      case 'scratch-controls':
        return <ScratchCardUnifiedControls />
      case 'scratch-analytics':
        return <ScratchCardAnalytics />
      default:
        return <ScratchCardDashboard stats={stats} scratchTypes={scratchTypes} probabilities={probabilities} scratchCards={scratchCards} />
    }
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <ScratchCardSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-14 flex items-center border-b px-4 gap-4">
            <SidebarTrigger />
            <div className="flex items-center gap-3 flex-1">
              <h1 className="text-xl font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Sistema Unificado - Raspadinhas
              </h1>
              
              <div className="ml-auto flex items-center gap-3">
                <Badge variant={stats.dangerousConfigs > 0 ? "destructive" : "default"} className="gap-2">
                  <Shield className="w-3 h-3" />
                  {stats.dangerousConfigs === 0 ? 'Seguro' : `${stats.dangerousConfigs} Alertas`}
                </Badge>
              </div>
            </div>
          </header>

          {/* Security Alert */}
          {stats.dangerousConfigs > 0 && (
            <div className="p-4 border-b bg-destructive/5">
              <Alert className="border-destructive/50">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <AlertDescription>
                  <strong>Atenção:</strong> {stats.dangerousConfigs} configurações perigosas detectadas. 
                  Acesse "Configurações" para corrigir.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Main Content */}
          <main className="flex-1 p-6">
            {loading ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p>Carregando sistema unificado...</p>
                </CardContent>
              </Card>
            ) : (
              renderContent()
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}