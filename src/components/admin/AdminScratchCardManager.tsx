import { ScratchCardSidebarAdmin } from './ScratchCardSidebarAdmin'

interface AdminScratchCardManagerProps {
  activeTab: string
}

export function AdminScratchCardManager({ activeTab }: AdminScratchCardManagerProps) {
  return <ScratchCardSidebarAdmin />
}