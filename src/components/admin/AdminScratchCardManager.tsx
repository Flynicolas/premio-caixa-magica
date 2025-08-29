import { RTPControlPanel } from './RTPControlPanel'
import SmartItemConfiguration from './SmartItemConfiguration'
import ScratchCardManualReleaseSystem from './scratch-card-probability/ScratchCardManualReleaseSystem'
import AnalyticsReports from './AnalyticsReports'
import { useItemManagement } from '@/hooks/useItemManagement'

interface AdminScratchCardManagerProps {
  activeTab: string
}

export function AdminScratchCardManager({ activeTab }: AdminScratchCardManagerProps) {
  const { items, refetchItems } = useItemManagement()

  const renderContent = () => {
    switch (activeTab) {
      case 'scratch':
      case 'scratch-rtp':
        return <RTPControlPanel />
        
      case 'scratch-items':
        return (
          <SmartItemConfiguration 
            items={items}
            onRefresh={refetchItems}
          />
        )

      case 'scratch-manual':
        return <ScratchCardManualReleaseSystem />

      case 'scratch-reports':
        return <AnalyticsReports />

      default:
        return <RTPControlPanel />
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sistema RTP - Raspadinhas</h1>
        <p className="text-muted-foreground">
          Controle completo do Return to Player (RTP) e gerenciamento de prêmios
        </p>
      </div>

      {renderContent()}
    </div>
  )
}