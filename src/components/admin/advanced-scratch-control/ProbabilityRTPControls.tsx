import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Percent, Target, AlertTriangle } from 'lucide-react';
import { TooltipHelper } from './TooltipHelper';

interface ProbabilityRTPControlsProps {
  scratchType: string;
  settings: any;
  pendingChanges: any;
  onSettingChange: (scratchType: string, field: string, value: any) => void;
}

export function ProbabilityRTPControls({ 
  scratchType, 
  settings, 
  pendingChanges, 
  onSettingChange 
}: ProbabilityRTPControlsProps) {
  const currentWinProb = pendingChanges.win_probability_global ?? 
                        settings?.win_probability_global ?? getDefaultValues(scratchType).winProb;
  const currentRTP = pendingChanges.target_rtp ?? 
                     settings?.target_rtp ?? getDefaultValues(scratchType).rtp;
  const rtpEnabled = pendingChanges.rtp_enabled ?? 
                     settings?.rtp_enabled ?? true;

  // Fórmula de sincronização: RTP_MAX = Win_Probability * 4
  const maxAllowedRTP = Math.min(currentWinProb * 4, 70);
  const minRecommendedRTP = Math.max(currentWinProb * 2, 20);

  // Validação de configuração perigosa
  const isDangerous = currentWinProb > 15 || currentRTP > maxAllowedRTP || currentRTP > 50;
  const isRTPTooHigh = currentRTP > maxAllowedRTP;
  const isWinProbTooHigh = currentWinProb > 15;

  // Valores padrão seguros por tipo
  function getDefaultValues(type: string) {
    const defaults = {
      pix: { winProb: 8, rtp: 25, desc: 'Raspadinha barata - foco em volume e lucro' },
      sorte: { winProb: 10, rtp: 30, desc: 'Equilíbrio seguro entre frequência e valor' },
      dupla: { winProb: 12, rtp: 35, desc: 'Prêmios médios com boa margem' },
      ouro: { winProb: 8, rtp: 40, desc: 'Prêmios altos, frequência controlada' },
      diamante: { winProb: 6, rtp: 45, desc: 'Exclusividade com retorno premium' },
      premium: { winProb: 5, rtp: 50, desc: 'Ultra exclusivo - máximo retorno controlado' }
    };
    return defaults[type.toLowerCase() as keyof typeof defaults] || 
           { winProb: 8, rtp: 30, desc: 'Configuração padrão segura' };
  }

  const getRecommendation = () => getDefaultValues(scratchType);

  // Handlers sincronizados
  const handleWinProbChange = (newWinProb: number) => {
    onSettingChange(scratchType, 'win_probability_global', newWinProb);
    // Se RTP atual for maior que o novo máximo, ajustar automaticamente
    const newMaxRTP = Math.min(newWinProb * 4, 70);
    if (currentRTP > newMaxRTP) {
      onSettingChange(scratchType, 'target_rtp', Math.min(newMaxRTP, newWinProb * 3));
    }
  };

  const handleRTPChange = (newRTP: number) => {
    const maxRTP = Math.min(currentWinProb * 4, 70);
    if (newRTP <= maxRTP) {
      onSettingChange(scratchType, 'target_rtp', newRTP);
    }
  };

  const recommendation = getRecommendation();

  const applyRecommendation = () => {
    onSettingChange(scratchType, 'win_probability_global', recommendation.winProb);
    onSettingChange(scratchType, 'target_rtp', recommendation.rtp);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Controles de Probabilidade e RTP
          <TooltipHelper content="Win Probability controla QUANTAS VEZES os jogadores ganham. RTP controla QUANTO DINHEIRO retorna aos jogadores." />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Alertas de Configuração Sincronizada */}
        {isDangerous && (
          <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-900">⚠️ Configuração de Risco Detectada</h4>
                <p className="text-sm text-red-700 mt-1">
                  {isWinProbTooHigh && 'Win Probability acima de 15% pode causar prejuízos significativos. '}
                  {isRTPTooHigh && `RTP está acima do limite máximo de ${maxAllowedRTP.toFixed(1)}% para esta Win Probability. `}
                  {currentRTP > 50 && 'RTP acima de 50% reduz drasticamente a margem de lucro. '}
                </p>
                <p className="text-xs text-red-600 mt-2 font-medium">
                  💡 Fórmula: RTP Máximo = Win Probability × 4 (Limite: {maxAllowedRTP.toFixed(1)}%)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Indicador de Sincronização */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Controles Sincronizados</span>
          </div>
          <p className="text-xs text-blue-700 mt-1">
            Win Probability: {currentWinProb}% | RTP Atual: {currentRTP}% | RTP Máximo Permitido: {maxAllowedRTP.toFixed(1)}%
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Win Probability Control */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Percent className="w-4 h-4" />
                Win Probability
                <TooltipHelper content="Determina a frequência de vitórias. 12% = 12 vitórias a cada 100 jogadas. Valores recomendados: 8-18%" />
              </Label>
              <Badge variant={currentWinProb <= 18 ? "secondary" : "destructive"}>
                {currentWinProb.toFixed(1)}%
              </Badge>
            </div>
            
            <Slider
              value={[currentWinProb]}
              onValueChange={([value]) => handleWinProbChange(value)}
              min={3}
              max={20}
              step={0.5}
              className="w-full"
            />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>3% (Ultra Raro)</span>
              <span>8% (Seguro)</span>
              <span>15% (Limite)</span>
            </div>

            <Input
              type="number"
              value={currentWinProb}
              onChange={(e) => handleWinProbChange(Number(e.target.value))}
              min={3}
              max={20}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* RTP Control */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Target RTP
                <TooltipHelper content="Return to Player - percentual do valor arrecadado que retorna aos jogadores. 35% = R$35 retornam para cada R$100 arrecadados." />
              </Label>
              <div className="flex items-center gap-2">
                <Badge variant={currentRTP <= maxAllowedRTP ? "secondary" : "destructive"}>
                  {currentRTP.toFixed(1)}%
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Máx: {maxAllowedRTP.toFixed(1)}%
                </span>
              </div>
            </div>
            
            <Slider
              value={[currentRTP]}
              onValueChange={([value]) => handleRTPChange(value)}
              min={15}
              max={maxAllowedRTP}
              step={1}
              className="w-full"
            />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>15% (Alto Lucro)</span>
              <span>{minRecommendedRTP}% (Recomendado)</span>
              <span>{maxAllowedRTP.toFixed(0)}% (Limite)</span>
            </div>

            <Input
              type="number"
              value={currentRTP}
              onChange={(e) => handleRTPChange(Number(e.target.value))}
              min={15}
              max={maxAllowedRTP}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        {/* RTP System Toggle */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <Label>Sistema RTP Ativo</Label>
            <p className="text-sm text-muted-foreground">
              Quando ativo, o sistema RTP ajusta automaticamente as probabilidades para manter o target RTP
            </p>
          </div>
          <Switch
            checked={rtpEnabled}
            onCheckedChange={(checked) => onSettingChange(scratchType, 'rtp_enabled', checked)}
          />
        </div>

        {/* Recommendation Card */}
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-green-900">🎯 Configuração Segura para {scratchType.toUpperCase()}</h4>
              <p className="text-sm text-green-700 mt-1">{recommendation.desc}</p>
              <div className="flex gap-4 mt-2">
                <span className="text-xs">Win Prob: <strong>{recommendation.winProb}%</strong></span>
                <span className="text-xs">RTP: <strong>{recommendation.rtp}%</strong></span>
                <span className="text-xs text-green-600">Margem: <strong>{(100 - recommendation.rtp).toFixed(0)}%</strong></span>
              </div>
            </div>
            <button 
              onClick={applyRecommendation}
              className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors font-medium"
            >
              ✓ Aplicar Seguro
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}