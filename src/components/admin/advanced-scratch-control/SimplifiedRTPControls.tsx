import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Info, TrendingUp } from 'lucide-react';

interface SimplifiedRTPControlsProps {
  scratchType: string;
  settings?: {
    target_rtp: number;
    rtp_enabled: boolean;
  };
  currentRTP?: number;
  onRTPChange: (scratchType: string, rtp: number) => void;
  onToggleRTP: (scratchType: string, enabled: boolean) => void;
}

const SimplifiedRTPControls: React.FC<SimplifiedRTPControlsProps> = ({
  scratchType,
  settings,
  currentRTP = 0,
  onRTPChange,
  onToggleRTP
}) => {
  const targetRTP = settings?.target_rtp || 0;
  const rtpEnabled = settings?.rtp_enabled || false;

  const handleRTPSliderChange = (value: number[]) => {
    onRTPChange(scratchType, value[0]);
  };

  const handleRTPInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0));
    onRTPChange(scratchType, value);
  };

  const getRTPStatus = () => {
    if (!rtpEnabled) return { icon: AlertTriangle, color: 'text-orange-500', text: 'Desabilitado' };
    if (targetRTP === 0) return { icon: AlertTriangle, color: 'text-red-500', text: '0% - Sem Prêmios' };
    if (targetRTP >= 90) return { icon: AlertTriangle, color: 'text-red-500', text: 'Alto - Pouco Lucro' };
    if (targetRTP >= 70) return { icon: Info, color: 'text-yellow-500', text: 'Médio - Equilibrado' };
    return { icon: CheckCircle, color: 'text-green-500', text: 'Seguro - Lucro Garantido' };
  };

  const status = getRTPStatus();
  const StatusIcon = status.icon;

  const getRecommendedRTP = () => {
    // Conservative recommendations for profit
    return {
      safe: 30,     // High profit
      balanced: 50, // Balanced
      generous: 70  // Lower profit, higher engagement
    };
  };

  const recommended = getRecommendedRTP();

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <span>Controle RTP - {scratchType.toUpperCase()}</span>
          <div className="flex items-center gap-2">
            <Switch
              checked={rtpEnabled}
              onCheckedChange={(enabled) => onToggleRTP(scratchType, enabled)}
            />
            <Badge variant="outline" className={`${status.color} flex items-center gap-1`}>
              <StatusIcon className="w-3 h-3" />
              {status.text}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* RTP Status Alert */}
        {!rtpEnabled && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              RTP desabilitado - Nenhum prêmio será entregue. Lucro 100%.
            </AlertDescription>
          </Alert>
        )}

        {rtpEnabled && targetRTP === 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              RTP 0% - Nenhum prêmio será entregue mesmo com RTP habilitado.
            </AlertDescription>
          </Alert>
        )}

        {/* Current vs Target RTP */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-primary">{currentRTP.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">RTP Atual (24h)</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-secondary">{targetRTP}%</div>
            <div className="text-sm text-muted-foreground">RTP Target</div>
          </div>
        </div>

        {/* RTP Slider Control */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Return to Player (RTP)</label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                max="100"
                value={targetRTP}
                onChange={handleRTPInputChange}
                className="w-16 h-8 text-center"
                disabled={!rtpEnabled}
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          </div>

          <Slider
            value={[targetRTP]}
            onValueChange={handleRTPSliderChange}
            max={100}
            min={0}
            step={1}
            className="w-full"
            disabled={!rtpEnabled}
          />

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0% (Máximo Lucro)</span>
            <span>50% (Equilibrado)</span>
            <span>100% (Sem Lucro)</span>
          </div>
        </div>

        {/* Quick RTP Presets */}
        {rtpEnabled && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Presets Recomendados:</label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRTPChange(scratchType, recommended.safe)}
                className="flex-1"
              >
                Seguro ({recommended.safe}%)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRTPChange(scratchType, recommended.balanced)}
                className="flex-1"
              >
                Equilibrado ({recommended.balanced}%)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRTPChange(scratchType, recommended.generous)}
                className="flex-1"
              >
                Generoso ({recommended.generous}%)
              </Button>
            </div>
          </div>
        )}

        {/* Profit Analysis */}
        {rtpEnabled && (
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>
              <strong>Sistema Pot-Based:</strong> O RTP controla diretamente quanto vai para o "pote" de prêmios. 
              Com {targetRTP}% RTP, {(100 - targetRTP)}% fica como lucro garantido.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default SimplifiedRTPControls;