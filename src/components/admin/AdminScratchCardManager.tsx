import { ScratchCardUnifiedAdmin } from './ScratchCardUnifiedAdmin'

interface AdminScratchCardManagerProps {
  activeTab: string
}

export function AdminScratchCardManager({ activeTab }: AdminScratchCardManagerProps) {
  return <ScratchCardUnifiedAdmin />
}