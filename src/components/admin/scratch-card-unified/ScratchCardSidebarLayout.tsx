import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar'
import { ScratchCardSidebar } from './ScratchCardSidebar'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { useSearchParams } from 'react-router-dom'
import { Sparkles } from 'lucide-react'

interface ScratchCardSidebarLayoutProps {
  children: React.ReactNode
}

const sectionTitles = {
  'scratch-dashboard': 'Dashboard',
  'scratch-items': 'Itens & Probabilidades', 
  'scratch-rtp': 'RTP & Win Control',
  'scratch-reports': 'Relatórios',
  'scratch-security': 'Auditoria'
}

export function ScratchCardSidebarLayout({ children }: ScratchCardSidebarLayoutProps) {
  const [searchParams] = useSearchParams()
  const section = searchParams.get('section') || 'scratch-dashboard'
  const currentTitle = sectionTitles[section as keyof typeof sectionTitles] || 'Dashboard'

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <ScratchCardSidebar />
        <SidebarInset className="flex-1">
          {/* Header global com trigger sempre visível */}
          <header className="flex h-12 shrink-0 items-center gap-4 border-b px-4">
            <SidebarTrigger className="ml-0" />
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/admin?section=scratch-dashboard">
                      Sistema de Raspadinhas
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{currentTitle}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          
          {/* Conteúdo principal */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}