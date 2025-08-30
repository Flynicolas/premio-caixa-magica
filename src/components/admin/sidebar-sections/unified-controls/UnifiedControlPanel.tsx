import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Percent, DollarSign, TrendingUp, Play, AlertCircle } from 'lucide-react'
import { useState } from 'react'

interface UnifiedControlPanelProps {
  scratchType: string
  typeName: string
  typePrice: number
  settings: any
  pendingChanges: Record<string, any>
  onSettingChange: (scratchType: string, field: string, value: any) => void
}

export function UnifiedControlPanel({ 
  scratchType, 
  typeName, 
  typePrice, 
  settings, 
  pendingChanges, 
  onSettingChange 
}: UnifiedControlPanelProps) {
  const [simulationResults, setSimulationResults] = useState<any>(null)
  const [simulating, setSimulating] = useState(false)

  // Valores atuais (incluindo mudanças pendentes)
  const currentWinProb = pendingChanges.win_probability_global ?? settings?.win_probability_global ?? 15
  const currentRTP = pendingChanges.target_rtp ?? settings?.target_rtp ?? 20
  
  // Cálculos de validação
  const isWinProbSafe = currentWinProb >= 5 && currentWinProb <= 15
  const isRTPSafe = currentRTP >= 10 && currentRTP <= 20
  const isConfigSafe = isWinProbSafe && isRTPSafe

  const handleWinProbChange = (value: number[]) => {
    const newValue = value[0]
    onSettingChange(scratchType, 'win_probability_global', newValue)
    
    // Auto-ajuste do RTP baseado no Win Probability para evitar divergências
    if (newValue < 8) {
      // Win Probability baixa -> RTP pode ser mais alto
      const suggestedRTP = Math.min(25, currentRTP + 2)
      onSettingChange(scratchType, 'target_rtp', suggestedRTP)
    } else if (newValue > 20) {
      // Win Probability alta -> RTP deve ser mais baixo
      const suggestedRTP = Math.max(15, currentRTP - 3)
      onSettingChange(scratchType, 'target_rtp', suggestedRTP)
    }
  }

  const handleRTPChange = (value: number[]) => {
    onSettingChange(scratchType, 'target_rtp', value[0])
  }

  const simulateScenario = async () => {
    setSimulating(true)
    try {
      // Simulate 1000 games with current settings
      const games = 1000
      const wins = Math.floor(games * (currentWinProb / 100))
      const totalPaid = games * typePrice
      const expectedReturn = totalPaid * (currentRTP / 100)
      const profit = totalPaid - expectedReturn
      const profitMargin = (profit / totalPaid) * 100

      setSimulationResults({
        games,
        wins,
        winRate: currentWinProb,
        totalPaid,
        expectedReturn,
        profit,
        profitMargin
      })
    } finally {
      setSimulating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{typeName}</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline">R$ {typePrice}</Badge>
              <Badge variant={isConfigSafe ? "default" : "destructive"}>
                {isConfigSafe ? "Seguro" : "Risco"}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Win Probability Control */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="w-4 h-4" />
              Probabilidade de Vitória
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Win Probability (%)</Label>
                <Input
                  type="number"
                  value={currentWinProb}
                  onChange={(e) => onSettingChange(scratchType, 'win_probability_global', parseFloat(e.target.value) || 0)}
                  className="w-20"
                  min="1"
                  max="50"
                />
              </div>
              <Slider
                value={[currentWinProb]}
                onValueChange={handleWinProbChange}
                max={50}
                min={1}
                step={0.5}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1%</span>
                <span className="font-medium">
                  {currentWinProb}% (A cada 100 jogos, {Math.round(currentWinProb)} vitórias)
                </span>
                <span>50%</span>
              </div>
            </div>

            {!isWinProbSafe && (
              <Alert>
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  {currentWinProb < 5 
                    ? "Win Probability muito baixa pode frustrar jogadores"
                    : "Win Probability muito alta pode causar prejuízos"
                  }
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* RTP Control */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Return To Player (RTP)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>RTP (%)</Label>
                <Input
                  type="number"
                  value={currentRTP}
                  onChange={(e) => onSettingChange(scratchType, 'target_rtp', parseFloat(e.target.value) || 0)}
                  className="w-20"
                  min="5"
                  max="95"
                />
              </div>
              <Slider
                value={[currentRTP]}
                onValueChange={handleRTPChange}
                max={95}
                min={5}
                step={1}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5%</span>
                <span className="font-medium">
                  {currentRTP}% (De R$ 100 apostados, retorna R$ {currentRTP})
                </span>
                <span>95%</span>
              </div>
            </div>

            {!isRTPSafe && (
              <Alert>
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  {currentRTP < 10 
                    ? "RTP muito baixo pode afastar jogadores"
                    : "RTP muito alto reduz a lucratividade"
                  }
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Synchronization Info */}
      <Alert className="border-blue-500/50 bg-blue-50">
        <TrendingUp className="w-4 h-4 text-blue-600" />
        <AlertDescription>
          <strong>Sincronização Automática:</strong> Ajustar Win Probability automaticamente sugere mudanças no RTP para manter equilíbrio.
          Win Probability: <strong>frequência</strong> | RTP: <strong>valor retornado</strong>
        </AlertDescription>
      </Alert>

      {/* Simulation Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Simulação de Cenário
            </span>
            <Button onClick={simulateScenario} disabled={simulating} size="sm">
              {simulating ? "Simulando..." : "Simular 1000 Jogos"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {simulationResults ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{simulationResults.wins}</div>
                <div className="text-sm text-muted-foreground">Vitórias</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  R$ {simulationResults.totalPaid.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Arrecadado</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  R$ {simulationResults.expectedReturn.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Prêmios Pagos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {simulationResults.profitMargin.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Margem</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              Clique em "Simular" para ver projeções baseadas nas configurações atuais
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}