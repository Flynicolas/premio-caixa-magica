import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { TooltipHelper } from './TooltipHelper';

interface ProfitabilityCalculatorProps {
  scratchType: string;
  settings: any;
  pendingChanges: any;
  gamePrice: number;
}

interface ProfitMetrics {
  grossRevenue: number;
  prizesPaid: number;
  netProfit: number;
  profitMargin: number;
  avgPrizeValue: number;
  expectedWins: number;
}

export function ProfitabilityCalculator({ 
  scratchType, 
  settings, 
  pendingChanges, 
  gamePrice 
}: ProfitabilityCalculatorProps) {
  const [volume, setVolume] = useState(1000);
  const [customPrizePool, setCustomPrizePool] = useState(0);

  const currentWinProb = (pendingChanges.win_probability_global ?? 
                         settings?.win_probability_global ?? 12) / 100;
  const currentRTP = (pendingChanges.target_rtp ?? 
                     settings?.target_rtp ?? 35) / 100;

  const calculateMetrics = (): ProfitMetrics => {
    const grossRevenue = volume * gamePrice;
    const expectedWins = Math.floor(volume * currentWinProb);
    
    // Calcular valor médio dos prêmios baseado no RTP
    const totalPrizePool = grossRevenue * currentRTP;
    const avgPrizeValue = expectedWins > 0 ? totalPrizePool / expectedWins : 0;
    
    const prizesPaid = customPrizePool > 0 ? customPrizePool : totalPrizePool;
    const netProfit = grossRevenue - prizesPaid;
    const profitMargin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

    return {
      grossRevenue,
      prizesPaid,
      netProfit,
      profitMargin,
      avgPrizeValue,
      expectedWins
    };
  };

  const metrics = calculateMetrics();

  const getMarginColor = (margin: number) => {
    if (margin >= 70) return 'text-green-600';
    if (margin >= 50) return 'text-blue-600';
    if (margin >= 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMarginStatus = (margin: number) => {
    if (margin >= 70) return 'Excelente';
    if (margin >= 50) return 'Bom';
    if (margin >= 30) return 'Aceitável';
    return 'Perigoso';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Calculadora de Lucratividade
          <TooltipHelper content="Simule diferentes volumes de jogo para prever receita, custos e lucro com as configurações atuais" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Inputs de Simulação */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Volume de Jogos</Label>
            <Input
              type="number"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              min={1}
              placeholder="1000"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Quantos jogos simular
            </p>
          </div>

          <div>
            <Label>Pool Personalizado de Prêmios (R$)</Label>
            <Input
              type="number"
              value={customPrizePool}
              onChange={(e) => setCustomPrizePool(Number(e.target.value))}
              min={0}
              step={0.01}
              placeholder="0 (usar RTP automático)"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Deixe 0 para usar cálculo automático do RTP
            </p>
          </div>
        </div>

        {/* Resumo das Configurações */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Preço do Jogo</p>
            <p className="font-bold text-lg">R$ {gamePrice.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Win Probability</p>
            <p className="font-bold text-lg">{(currentWinProb * 100).toFixed(1)}%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Target RTP</p>
            <p className="font-bold text-lg">{(currentRTP * 100).toFixed(1)}%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Vitórias Esperadas</p>
            <p className="font-bold text-lg">{metrics.expectedWins}</p>
          </div>
        </div>

        {/* Métricas Calculadas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Receita Bruta */}
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="font-medium">Receita Bruta</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                R$ {metrics.grossRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {volume.toLocaleString()} jogos × R$ {gamePrice.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          {/* Prêmios Pagos */}
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-red-600" />
                <span className="font-medium">Prêmios Pagos</span>
              </div>
              <p className="text-2xl font-bold text-red-600">
                R$ {metrics.prizesPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Média: R$ {metrics.avgPrizeValue.toFixed(2)} por vitória
              </p>
            </CardContent>
          </Card>

          {/* Lucro Líquido */}
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className={`w-5 h-5 ${metrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                <span className="font-medium">Lucro Líquido</span>
              </div>
              <p className={`text-2xl font-bold ${metrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {metrics.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <div className="flex items-center justify-center gap-2 mt-1">
                <Badge 
                  variant={metrics.profitMargin >= 50 ? "secondary" : "destructive"}
                  className={getMarginColor(metrics.profitMargin)}
                >
                  {metrics.profitMargin.toFixed(1)}% - {getMarginStatus(metrics.profitMargin)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cenários de Volume */}
        <div className="space-y-3">
          <h4 className="font-medium">📊 Projeções por Volume</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {[100, 500, 1000, 5000].map(vol => {
              const projRevenue = vol * gamePrice;
              const projPrizes = projRevenue * currentRTP;
              const projProfit = projRevenue - projPrizes;
              const projMargin = (projProfit / projRevenue) * 100;
              
              return (
                <div key={vol} className="p-3 border rounded text-center hover:bg-muted transition-colors">
                  <p className="font-medium">{vol} jogos</p>
                  <p className="text-xs text-green-600">R$ {projRevenue.toFixed(0)}</p>
                  <p className="text-xs text-red-600">R$ {projPrizes.toFixed(0)}</p>
                  <p className={`text-xs font-medium ${projProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    +R$ {projProfit.toFixed(0)} ({projMargin.toFixed(0)}%)
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Alertas de Lucratividade */}
        {metrics.profitMargin < 30 && (
          <div className="p-3 border border-red-200 bg-red-50 rounded-lg">
            <h4 className="font-medium text-red-900">⚠️ Margem de Lucro Baixa</h4>
            <p className="text-sm text-red-700 mt-1">
              Com {metrics.profitMargin.toFixed(1)}% de margem, considere:
              {metrics.profitMargin < 20 && ' reduzir o RTP ou Win Probability,'}
              {' aumentar o preço do jogo ou otimizar o pool de prêmios.'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}