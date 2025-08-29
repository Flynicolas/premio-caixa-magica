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
                        settings?.win_probability_global ?? 12;
  const currentRTP = pendingChanges.target_rtp ?? 
                     settings?.target_rtp ?? 35;
  const rtpEnabled = pendingChanges.rtp_enabled ?? 
                     settings?.rtp_enabled ?? true;

  // Validação de configuração perigosa
  const isDangerous = currentWinProb > 20 || currentRTP > 60;
  const isRTPTooHigh = currentRTP > (currentWinProb * 3);

  const getRecommendation = () => {
    const type = scratchType.toLowerCase();
    const recommendations = {
      pix: { winProb: 12, rtp: 30, desc: 'Raspadinha barata - foco em volume' },
      sorte: { winProb: 15, rtp: 35, desc: 'Equilíbrio entre frequência e valor' },
      dupla: { winProb: 18, rtp: 40, desc: 'Prêmios médios mais frequentes' },
      ouro: { winProb: 12, rtp: 45, desc: 'Prêmios altos menos frequentes' },
      diamante: { winProb: 10, rtp: 50, desc: 'Exclusividade com alto retorno' },
      premium: { winProb: 8, rtp: 55, desc: 'Ultra exclusivo - máximo retorno' }
    };

    return recommendations[type as keyof typeof recommendations] || 
           { winProb: 12, rtp: 35, desc: 'Configuração padrão balanceada' };
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
        {/* Alertas de Configuração */}
        {isDangerous && (
          <div className="p-3 border border-red-200 bg-red-50 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-900">⚠️ Configuração de Risco</h4>
                <p className="text-sm text-red-700 mt-1">
                  {currentWinProb > 20 && 'Win Probability muito alta pode causar prejuízos. '}
                  {currentRTP > 60 && 'RTP muito alto reduz drasticamente a margem de lucro. '}
                  {isRTPTooHigh && 'RTP impossível de manter com essa Win Probability.'}
                </p>
              </div>
            </div>
          </div>
        )}

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
              onValueChange={([value]) => onSettingChange(scratchType, 'win_probability_global', value)}
              min={5}
              max={30}
              step={0.5}
              className="w-full"
            />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5% (Muito Raro)</span>
              <span>15% (Balanceado)</span>
              <span>30% (Muito Frequente)</span>
            </div>

            <Input
              type="number"
              value={currentWinProb}
              onChange={(e) => onSettingChange(scratchType, 'win_probability_global', Number(e.target.value))}
              min={5}
              max={30}
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
              <Badge variant={currentRTP <= 50 ? "secondary" : "destructive"}>
                {currentRTP.toFixed(1)}%
              </Badge>
            </div>
            
            <Slider
              value={[currentRTP]}
              onValueChange={([value]) => onSettingChange(scratchType, 'target_rtp', value)}
              min={20}
              max={80}
              step={1}
              className="w-full"
            />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>20% (Alto Lucro)</span>
              <span>45% (Balanceado)</span>
              <span>80% (Baixo Lucro)</span>
            </div>

            <Input
              type="number"
              value={currentRTP}
              onChange={(e) => onSettingChange(scratchType, 'target_rtp', Number(e.target.value))}
              min={20}
              max={80}
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
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-900">💡 Recomendação para {scratchType.toUpperCase()}</h4>
              <p className="text-sm text-blue-700 mt-1">{recommendation.desc}</p>
              <div className="flex gap-4 mt-2">
                <span className="text-xs">Win Prob: <strong>{recommendation.winProb}%</strong></span>
                <span className="text-xs">RTP: <strong>{recommendation.rtp}%</strong></span>
              </div>
            </div>
            <button 
              onClick={applyRecommendation}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
            >
              Aplicar
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}