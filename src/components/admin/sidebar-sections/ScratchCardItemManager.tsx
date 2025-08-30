import { ScratchCardItemManagement } from '../advanced-scratch/ScratchCardItemManagement'

export function ScratchCardItemManager() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Gestão de Itens</h2>
        <p className="text-muted-foreground">
          Configure quais itens podem ser sorteados em cada tipo de raspadinha
        </p>
      </div>
      
      <ScratchCardItemManagement />
    </div>
  )
}