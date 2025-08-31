import { NavLink, useLocation } from "react-router-dom"
import { Package, Settings, TrendingUp, BarChart3, Shield, Home } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

const navigationItems = [
  { 
    title: "Dashboard", 
    url: "/admin?section=scratch-dashboard", 
    icon: Home,
    description: "Visão geral do sistema"
  },
  { 
    title: "Itens & Probabilidades", 
    url: "/admin?section=scratch-items", 
    icon: Package,
    description: "Gestão unificada de itens"
  },
  { 
    title: "RTP & Win Control", 
    url: "/admin?section=scratch-rtp", 
    icon: Settings,
    description: "Controles avançados de RTP"
  },
  { 
    title: "Relatórios", 
    url: "/admin?section=scratch-reports", 
    icon: BarChart3,
    description: "Analytics e performance"
  },
  { 
    title: "Auditoria", 
    url: "/admin?section=scratch-security", 
    icon: Shield,
    description: "Segurança e conformidade"
  },
]

export function ScratchCardSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentParams = new URLSearchParams(location.search)
  const currentSection = currentParams.get('section')

  const isCollapsed = state === "collapsed"

  const isActive = (url: string) => {
    const urlParams = new URLSearchParams(url.split('?')[1])
    const urlSection = urlParams.get('section')
    return currentSection === urlSection
  }

  const getNavCls = (url: string) => {
    const active = isActive(url)
    return active 
      ? "bg-primary text-primary-foreground font-medium" 
      : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
  }

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/90 font-semibold">
            {!isCollapsed && "Sistema de Raspadinhas"}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavCls(item.url)}
                      title={isCollapsed ? `${item.title} - ${item.description}` : undefined}
                    >
                      <item.icon className="mr-2 h-4 w-4 shrink-0" />
                      {!isCollapsed && (
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{item.title}</span>
                          <span className="text-xs opacity-70">{item.description}</span>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}