import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useScratchCardManagement } from '@/hooks/useScratchCardManagement'
import { useScratchCardAdministration } from '@/hooks/useScratchCardAdministration'
import { useAdvancedScratchCard } from '@/hooks/useAdvancedScratchCard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, DollarSign, TrendingUp, Shield, BarChart3, Package, Settings2, Sparkles } from 'lucide-react'
import { AdvancedScratchControlPanel } from './advanced-scratch-control/AdvancedScratchControlPanel'
import { ScratchCardItemManagement } from './advanced-scratch/ScratchCardItemManagement'
import { ScratchCardConfigurationPanel } from './scratch-card-probability/ScratchCardConfigurationPanel'
import { scratchCardTypes } from '@/types/scratchCard'

export function ScratchCardUnifiedAdmin() {
  const [searchParams] = useSearchParams()
  const sectionParam = searchParams.get('section')
  
  // Map URL sections to tab values
  const getTabFromSection = (section: string | null) => {
    switch (section) {
      case 'scratch-items': return 'items'
      case 'scratch-rtp': return 'advanced'
      case 'scratch-probability': return 'probability'
      case 'scratch-profitability': return 'profitability'
      case 'scratch-security': return 'security'
      case 'scratch-reports': return 'reports'
      default: return 'dashboard'
    }
  }

  const [activeTab, setActiveTab] = useState(getTabFromSection(sectionParam))
  
  const { scratchTypes, probabilities, loading: managementLoading } = useScratchCardManagement()
  const { settings, loading: adminLoading } = useScratchCardAdministration()
  const { scratchCards, loading: advancedLoading } = useAdvancedScratchCard()

  useEffect(() => {
    setActiveTab(getTabFromSection(sectionParam))
  }, [sectionParam])

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

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando sistema unificado...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Principal */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
            <Sparkles className="w-8 h-8" />
            Sistema Unificado - Raspadinhas
          </h1>
          <p className="text-muted-foreground mt-1">
            Painel completo para controle de probabilidades, RTP e lucratividade
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant={stats.dangerousConfigs > 0 ? "destructive" : "default"} className="gap-2">
            <Shield className="w-4 h-4" />
            {stats.dangerousConfigs === 0 ? 'Configurações Seguras' : `${stats.dangerousConfigs} Configs. Perigosas`}
          </Badge>
        </div>
      </div>

      {/* Security Alert */}
      {stats.dangerousConfigs > 0 && (
        <Alert className="border-destructive/50 bg-destructive/10">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          <AlertDescription>
            <strong>Atenção:</strong> Foram detectadas {stats.dangerousConfigs} configurações perigosas 
            que podem causar prejuízos. Acesse a aba "Controles Avançados" para corrigir.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="items">Gerenciar Itens</TabsTrigger>
          <TabsTrigger value="probability">Probabilidades</TabsTrigger>
          <TabsTrigger value="advanced">Controles Avançados</TabsTrigger>
          <TabsTrigger value="profitability">Lucratividade</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Dashboard Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tipos Totais</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTypes}</div>
                <p className="text-xs text-muted-foreground">raspadinhas configuradas</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tipos Configurados</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.configuredTypes}</div>
                <p className="text-xs text-muted-foreground">com itens ativos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Itens Totais</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalItems}</div>
                <p className="text-xs text-muted-foreground">nos sistemas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Configurações Perigosas</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{stats.dangerousConfigs}</div>
                <p className="text-xs text-muted-foreground">requerem atenção</p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Análise por Tipo de Raspadinha</CardTitle>
              <CardDescription>
                Estado atual de cada tipo de raspadinha no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scratchTypes?.map((type) => {
                  const typeProbs = probabilities?.filter(p => p.scratch_type === type.scratch_type && p.is_active) || []
                  const totalWeight = typeProbs.reduce((sum, p) => sum + (p.probability_weight || 0), 0)
                  const hasItems = typeProbs.length > 0
                  const scratchCard = scratchCards?.find(sc => sc.scratch_type === type.scratch_type)
                  
                  const winProb = scratchCard?.win_probability_global || 0
                  const targetRTP = (scratchCard as any)?.target_rtp || 0
                  
                  // Risk assessment
                  const isHighRisk = winProb > 15 || targetRTP > 20 || !hasItems
                  const isHealthy = winProb >= 5 && winProb <= 10 && targetRTP >= 10 && targetRTP <= 15 && hasItems
                  
                  return (
                    <div key={type.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{type.name}</h3>
                          <Badge variant="outline">R$ {type.price}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{typeProbs.length} itens</span>
                          <span>Peso total: {totalWeight}</span>
                          <span>Win: {winProb}%</span>
                          <span>RTP: {targetRTP}%</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isHighRisk && (
                          <Badge variant="destructive">Alto Risco</Badge>
                        )}
                        {isHealthy && (
                          <Badge variant="default" className="bg-green-500">Saudável</Badge>
                        )}
                        {!hasItems && (
                          <Badge variant="secondary">Sem Itens</Badge>
                        )}
                      </div>
                    </div>
                  )
                }) || (
                  <div className="text-center py-4 text-muted-foreground">
                    Nenhum tipo de raspadinha encontrado
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items" className="space-y-6">
          <ScratchCardItemManagement />
        </TabsContent>

        <TabsContent value="probability" className="space-y-6">
          <ScratchCardConfigurationPanel />
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <AdvancedScratchControlPanel />
        </TabsContent>

        <TabsContent value="profitability" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Análise de Lucratividade
              </CardTitle>
              <CardDescription>
                Métricas de rentabilidade e performance financeira
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <TrendingUp className="h-4 w-4" />
                  <AlertDescription>
                    Sistema de análise de lucratividade em desenvolvimento. Use os "Controles Avançados" para simular cenários.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Análise de Segurança
              </CardTitle>
              <CardDescription>
                Verificações de segurança e conformidade do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Sistema de auditoria em desenvolvimento. Verificações automáticas serão implementadas em breve.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">Status do Sistema</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Configurações Seguras:</span>
                          <Badge variant={stats.dangerousConfigs === 0 ? "default" : "destructive"}>
                            {stats.totalTypes - stats.dangerousConfigs}/{stats.totalTypes}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Tipos Lucrativos:</span>
                          <Badge variant="default">
                            {stats.healthyProfit}/{stats.totalTypes}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">Validações Ativas</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>✓ Win Probability: 5-15%</li>
                        <li>✓ RTP: 10-20%</li>
                        <li>✓ Caps de prêmio por tipo</li>
                        <li>✓ Monitoramento automático</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}