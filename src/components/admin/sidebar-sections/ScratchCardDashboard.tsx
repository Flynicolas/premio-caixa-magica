import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, TrendingUp, BarChart3, AlertTriangle } from 'lucide-react'

interface ScratchCardDashboardProps {
  stats: {
    totalTypes: number
    configuredTypes: number
    totalItems: number
    dangerousConfigs: number
    healthyProfit: number
  }
  scratchTypes: any[]
  probabilities: any[]
  scratchCards: any[]
}

export function ScratchCardDashboard({ stats, scratchTypes, probabilities, scratchCards }: ScratchCardDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <CardTitle className="text-sm font-medium">Configurados</CardTitle>
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
            <CardTitle className="text-sm font-medium">Alertas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.dangerousConfigs}</div>
            <p className="text-xs text-muted-foreground">requerem atenção</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
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
    </div>
  )
}