import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Settings2, Save, AlertTriangle, TrendingUp, Percent } from 'lucide-react'
import { useScratchCardManagement } from '@/hooks/useScratchCardManagement'
import { useAdvancedScratchCard } from '@/hooks/useAdvancedScratchCard'
import { scratchCardTypes } from '@/types/scratchCard'
import { UnifiedControlPanel } from './unified-controls/UnifiedControlPanel'

export function ScratchCardUnifiedControls() {
  const { 
    scratchTypes,
    loading: scratchLoading
  } = useScratchCardManagement()
  
  const {
    scratchCards,
    loading: advancedLoading,
    updateScratchCard
  } = useAdvancedScratchCard()
  
  const [activeTab, setActiveTab] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [changes, setChanges] = useState<Record<string, any>>({})

  const loading = scratchLoading || advancedLoading

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando configurações...</p>
        </CardContent>
      </Card>
    )
  }

  // Usar os tipos do banco de dados quando disponíveis
  const availableTypes = scratchTypes.length > 0 
    ? scratchTypes.map(st => ({
        value: st.scratch_type,
        label: st.name,
        price: st.price,
        color: scratchCardTypes[st.scratch_type as keyof typeof scratchCardTypes]?.bgColor || 'bg-gray-500'
      }))
    : Object.entries(scratchCardTypes).map(([key, config]) => ({
        value: key,
        label: config.name,
        price: config.price,
        color: config.bgColor
      }))

  if (!activeTab && availableTypes.length > 0) {
    setActiveTab(availableTypes[0].value)
  }

  const handleSettingChange = (scratchType: string, field: string, value: any) => {
    setChanges(prev => ({
      ...prev,
      [scratchType]: {
        ...prev[scratchType],
        [field]: value
      }
    }))
  }

  const saveChanges = async () => {
    try {
      setSaving(true)
      
      for (const [scratchType, updates] of Object.entries(changes)) {
        if (Object.keys(updates).length > 0) {
          await updateScratchCard(scratchType, updates)
        }
      }
      
      setChanges({})
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = Object.keys(changes).length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings2 className="w-6 h-6" />
            Configurações Unificadas
          </h2>
          <p className="text-muted-foreground">
            Controle Win Probability e RTP de forma sincronizada
          </p>
        </div>
        
        {hasChanges && (
          <Button 
            onClick={saveChanges}
            disabled={saving}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            Salvar ({Object.keys(changes).length})
          </Button>
        )}
      </div>

      {/* Critical Fix Alert */}
      <Alert className="border-green-500/50 bg-green-50">
        <TrendingUp className="w-5 h-5 text-green-600" />
        <AlertDescription>
          <strong>✅ Sistema Unificado:</strong> Win Probability e RTP agora são controlados em sincronização. 
          Win Probability controla <strong>frequência de vitórias</strong> (5-30%), 
          RTP controla <strong>valor retornado</strong> (10-80%).
        </AlertDescription>
      </Alert>

      {/* Tabs por tipo de raspadinha */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          {availableTypes.map((type) => (
            <TabsTrigger key={type.value} value={type.value} className="gap-2">
              <div className={`w-3 h-3 rounded-full ${type.color}`} />
              <span className="hidden sm:inline">{type.label}</span>
              <span className="sm:hidden">{type.value.toUpperCase()}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {availableTypes.map((type) => {
          const currentSettings = scratchCards.find(sc => sc.scratch_type === type.value)
          const pendingChanges = changes[type.value] || {}
          
          return (
            <TabsContent key={type.value} value={type.value} className="mt-6">
              <UnifiedControlPanel
                scratchType={type.value}
                typeName={type.label}
                typePrice={type.price}
                settings={currentSettings}
                pendingChanges={pendingChanges}
                onSettingChange={handleSettingChange}
              />
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}