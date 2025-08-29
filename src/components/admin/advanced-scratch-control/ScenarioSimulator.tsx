import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, RotateCcw, Target } from 'lucide-react';
import { TooltipHelper } from './TooltipHelper';

interface ScenarioSimulatorProps {
  scratchType: string;
  settings: any;
  pendingChanges: any;
  gamePrice: number;
}

interface SimulationResult {
  totalGames: number;
  wins: number;
  losses: number;
  totalRevenue: number;
  totalPrizes: number;
  netProfit: number;
  actualWinRate: number;
  actualRTP: number;
  profitMargin: number;
}

export function ScenarioSimulator({ 
  scratchType, 
  settings, 
  pendingChanges, 
  gamePrice 
}: ScenarioSimulatorProps) {
  const [simulations, setSimulations] = useState<SimulationResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const currentWinProb = (pendingChanges.win_probability_global ?? 
                         settings?.win_probability_global ?? 12) / 100;
  const currentRTP = (pendingChanges.target_rtp ?? 
                     settings?.target_rtp ?? 35) / 100;

  const runSimulation = async (gameCount: number) => {
    setIsRunning(true);
    
    // Simular jogos
    let wins = 0;
    let totalPrizes = 0;
    
    for (let i = 0; i < gameCount; i++) {
      if (Math.random() < currentWinProb) {
        wins++;
        // Calcular prêmio baseado no RTP e variação
        const basePrice = gamePrice * (currentRTP / currentWinProb);
        const variance = 0.3; // 30% de variação
        const prizeValue = basePrice * (1 + (Math.random() - 0.5) * variance);
        totalPrizes += Math.max(prizeValue, 0.01); // Mínimo R$ 0,01
      }
    }
    
    const losses = gameCount - wins;
    const totalRevenue = gameCount * gamePrice;
    const netProfit = totalRevenue - totalPrizes;
    const actualWinRate = (wins / gameCount) * 100;
    const actualRTP = (totalPrizes / totalRevenue) * 100;
    const profitMargin = (netProfit / totalRevenue) * 100;

    const result: SimulationResult = {
      totalGames: gameCount,
      wins,
      losses,
      totalRevenue,
      totalPrizes,
      netProfit,
      actualWinRate,
      actualRTP,
      profitMargin
    };

    setSimulations(prev => [result, ...prev.slice(0, 4)]); // Keep last 5 simulations
    setIsRunning(false);
  };

  const clearSimulations = () => {
    setSimulations([]);
  };

  const getMarginColor = (margin: number) => {
    if (margin >= 60) return 'text-green-600';
    if (margin >= 40) return 'text-blue-600';
    if (margin >= 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getVarianceColor = (actual: number, target: number) => {
    const variance = Math.abs(actual - target);
    if (variance <= 2) return 'text-green-600';
    if (variance <= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Simulador de Cenários
          <TooltipHelper content="Execute simulações reais para testar como as configurações se comportam na prática antes de aplicar" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configurações Atuais */}
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-3">📋 Configurações para Simulação</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Win Probability</p>
              <p className="font-bold">{(currentWinProb * 100).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Target RTP</p>
              <p className="font-bold">{(currentRTP * 100).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Preço do Jogo</p>
              <p className="font-bold">R$ {gamePrice.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Prêmio Médio</p>
              <p className="font-bold">R$ {(gamePrice * currentRTP / currentWinProb).toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Controles de Simulação */}
        <div className="space-y-3">
          <h4 className="font-medium">🎮 Executar Simulações</h4>
          <div className="flex flex-wrap gap-2">
            {[100, 500, 1000, 5000, 10000].map(count => (
              <Button
                key={count}
                variant="outline"
                size="sm"
                onClick={() => runSimulation(count)}
                disabled={isRunning}
                className="gap-2"
              >
                <Play className="w-3 h-3" />
                {count.toLocaleString()} jogos
              </Button>
            ))}
            
            {simulations.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSimulations}
                className="gap-2"
              >
                <RotateCcw className="w-3 h-3" />
                Limpar
              </Button>
            )}
          </div>
        </div>

        {/* Progress bar while running */}
        {isRunning && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
              <span className="text-sm">Executando simulação...</span>
            </div>
            <Progress value={undefined} className="w-full" />
          </div>
        )}

        {/* Resultados das Simulações */}
        {simulations.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">📊 Resultados das Simulações</h4>
            <div className="space-y-3">
              {simulations.map((sim, index) => (
                <Card key={index} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline">
                        {sim.totalGames.toLocaleString()} jogos simulados
                      </Badge>
                      <Badge className={getMarginColor(sim.profitMargin)}>
                        Margem: {sim.profitMargin.toFixed(1)}%
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Vitórias</p>
                        <p className="font-bold text-green-600">{sim.wins}</p>
                        <p className={`text-xs ${getVarianceColor(sim.actualWinRate, currentWinProb * 100)}`}>
                          {sim.actualWinRate.toFixed(1)}%
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-muted-foreground">Derrotas</p>
                        <p className="font-bold text-red-600">{sim.losses}</p>
                        <p className="text-xs text-muted-foreground">
                          {((sim.losses / sim.totalGames) * 100).toFixed(1)}%
                        </p>
                      </div>

                      <div>
                        <p className="text-muted-foreground">Receita</p>
                        <p className="font-bold text-green-600">
                          R$ {sim.totalRevenue.toLocaleString('pt-BR')}
                        </p>
                      </div>

                      <div>
                        <p className="text-muted-foreground">Prêmios</p>
                        <p className="font-bold text-red-600">
                          R$ {sim.totalPrizes.toLocaleString('pt-BR')}
                        </p>
                        <p className={`text-xs ${getVarianceColor(sim.actualRTP, currentRTP * 100)}`}>
                          RTP: {sim.actualRTP.toFixed(1)}%
                        </p>
                      </div>

                      <div>
                        <p className="text-muted-foreground">Lucro</p>
                        <p className={`font-bold ${sim.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          R$ {sim.netProfit.toLocaleString('pt-BR')}
                        </p>
                      </div>

                      <div>
                        <p className="text-muted-foreground">Precisão</p>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${
                              Math.abs(sim.actualWinRate - currentWinProb * 100) <= 2 ? 'bg-green-500' : 'bg-red-500'
                            }`} />
                            <span className="text-xs">Win Rate</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${
                              Math.abs(sim.actualRTP - currentRTP * 100) <= 5 ? 'bg-green-500' : 'bg-red-500'
                            }`} />
                            <span className="text-xs">RTP</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Análise das Simulações */}
            {simulations.length >= 2 && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <h5 className="font-medium text-blue-900 mb-2">📈 Análise das Simulações</h5>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p>
                      <strong>Margem média:</strong> {
                        (simulations.reduce((sum, sim) => sum + sim.profitMargin, 0) / simulations.length).toFixed(1)
                      }%
                    </p>
                    <p>
                      <strong>RTP médio:</strong> {
                        (simulations.reduce((sum, sim) => sum + sim.actualRTP, 0) / simulations.length).toFixed(1)
                      }% (target: {(currentRTP * 100).toFixed(1)}%)
                    </p>
                    <p>
                      <strong>Win Rate médio:</strong> {
                        (simulations.reduce((sum, sim) => sum + sim.actualWinRate, 0) / simulations.length).toFixed(1)
                      }% (target: {(currentWinProb * 100).toFixed(1)}%)
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}