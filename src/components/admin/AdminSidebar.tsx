import { useState } from "react"
import { 
  Package, 
  Settings, 
  Users, 
  Wallet, 
  Truck, 
  AlertTriangle, 
  Gamepad2, 
  TestTube, 
  DollarSign, 
  Palette,
  BarChart3,
  ChevronDown,
  Shield
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface AdminSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
  financeV2Enabled: boolean
}

export function AdminSidebar({ activeSection, onSectionChange, financeV2Enabled }: AdminSidebarProps) {
  const { state } = useSidebar()
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['games'])

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    )
  }

  const isActive = (section: string) => activeSection === section
  const isGroupExpanded = (groupId: string) => expandedGroups.includes(groupId)

  const menuGroups = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      items: [
        { id: 'overview', label: 'Visão Geral', icon: BarChart3, path: '/admin' }
      ]
    },
    {
      id: 'games',
      label: 'Jogos & Prêmios',
      items: [
        { id: 'items', label: 'Itens', icon: Package },
        { id: 'chests', label: 'Baús', icon: Settings },
        {
          id: 'scratch',
          label: 'Raspadinhas',
          icon: Gamepad2,
          subItems: [
            { id: 'scratch-rtp', label: 'RTP Simples' },
            { id: 'scratch-items', label: 'Configurar Itens' },
            { id: 'scratch-manual', label: 'Liberação Manual' },
            { id: 'scratch-reports', label: 'Relatórios' },
            { id: 'scratch-security', label: 'Auditoria & Segurança' }
          ]
        }
      ]
    },
    {
      id: 'financial',
      label: 'Financeiro',
      items: [
        { id: 'caixa-geral', label: 'Caixa Geral', icon: Wallet },
        ...(financeV2Enabled ? [
          { id: 'finance', label: 'Controle Financeiro v2', icon: DollarSign }
        ] : [])
      ]
    },
    {
      id: 'users',
      label: 'Usuários',
      items: [
        { id: 'users', label: 'Usuários', icon: Users },
        { id: 'affiliates', label: 'Afiliados', icon: Users },
        { id: 'collaborators', label: 'Colaboradores', icon: Users }
      ]
    },
    {
      id: 'operations',
      label: 'Operações',
      items: [
        { id: 'deliveries', label: 'Entregas', icon: Truck }
      ]
    },
    {
      id: 'system',
      label: 'Sistema',
      items: [
        { id: 'errors', label: 'Erros & Logs', icon: AlertTriangle },
        { id: 'demo', label: 'Demo', icon: TestTube },
        { id: 'visual', label: 'Personalização Visual', icon: Palette }
      ]
    }
  ]

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          {state === 'expanded' && (
            <div>
              <h2 className="text-lg font-semibold">Admin Panel</h2>
              <p className="text-xs text-muted-foreground">Sistema de gestão</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {menuGroups.map((group) => (
          <SidebarGroup key={group.id}>
            <SidebarGroupLabel>{state === 'expanded' && group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    {item.subItems ? (
                      <Collapsible
                        open={isGroupExpanded(item.id)}
                        onOpenChange={() => toggleGroup(item.id)}
                      >
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            className={`w-full justify-between ${
                              isActive(item.id) ? 'bg-accent text-accent-foreground' : ''
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <item.icon className="h-4 w-4" />
                              {state === 'expanded' && <span>{item.label}</span>}
                            </div>
                            {state === 'expanded' && (
                              <ChevronDown 
                                className={`h-4 w-4 transition-transform ${
                                  isGroupExpanded(item.id) ? 'rotate-180' : ''
                                }`} 
                              />
                            )}
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.subItems.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.id}>
                                <SidebarMenuSubButton
                                  onClick={() => onSectionChange(subItem.id)}
                                  className={
                                    isActive(subItem.id) ? 'bg-accent text-accent-foreground' : ''
                                  }
                                >
                                  {subItem.label}
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </Collapsible>
                    ) : (
                      <SidebarMenuButton
                        onClick={() => onSectionChange(item.id)}
                        className={`w-full ${
                          isActive(item.id) ? 'bg-accent text-accent-foreground' : ''
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        {state === 'expanded' && <span>{item.label}</span>}
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  )
}