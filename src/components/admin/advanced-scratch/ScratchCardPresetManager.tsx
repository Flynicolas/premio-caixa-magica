import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings, Zap, Shield, TrendingUp, CheckCircle } from 'lucide-react';
import { useAdvancedScratchCard } from '@/hooks/useAdvancedScratchCard';
import { toast } from 'sonner';

export const ScratchCardPresetManager: React.FC = () => {
  const { scratchCards, presets, applyPreset } = useAdvancedScratchCard();
  const [selectedScratchType, setSelectedScratchType] = useState<string>('');
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyPreset = async (scratchType: string, presetId: number) => {
    setIsApplying(true);
    try {
      await applyPreset(scratchType, presetId);
      toast.success('Preset aplicado com sucesso!');
    } catch (error) {
      toast.error('Erro ao aplicar preset');
    } finally {
      setIsApplying(false);
    }
  };

  const getPresetIcon = (name: string) => {
    const icons = {
      '95/05': Shield,
      '90/10': Settings,
      '85/15': TrendingUp,
      '80/20': Zap
    };
    const IconComponent = icons[name as keyof typeof icons] || Settings;
    return <IconComponent className="h-4 w-4" />;
  };

  const getPresetColor = (name: string) => {
    const colors = {
      '95/05': 'border-green-200 bg-green-50 dark:bg-green-900/20',
      '90/10': 'border-blue-200 bg-blue-50 dark:bg-blue-900/20',
      '85/15': 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20',
      '80/20': 'border-red-200 bg-red-50 dark:bg-red-900/20'
    };
    return colors[name as keyof typeof colors] || 'border-gray-200 bg-gray-50 dark:bg-gray-900/20';
  };

  const getRiskLevel = (winProb: number, payoutPerc: number) => {
    const riskScore = winProb + (payoutPerc * 0.5);
    if (riskScore <= 30) return { level: 'Conservador', color: 'bg-green-100 text-green-800' };
    if (riskScore <= 50) return { level: 'Balanceado', color: 'bg-blue-100 text-blue-800' };
    if (riskScore <= 70) return { level: 'Agressivo', color: 'bg-yellow-100 text-yellow-800' };
    return { level: 'Alto Risco', color: 'bg-red-100 text-red-800' };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Presets de Operação
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Grid de Presets */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {presets.map((preset) => {
              const risk = getRiskLevel(preset.win_probability_global, preset.pay_upto_percentage);
              
              return (
                <Card key={preset.id} className={`cursor-pointer transition-all hover:shadow-md ${getPresetColor(preset.name)}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getPresetIcon(preset.name)}
                        <h3 className="font-semibold">{preset.name}</h3>
                      </div>
                      <Badge className={risk.color}>
                        {risk.level}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {preset.description}
                    </p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Prob. Vitória:</span>
                        <span className="font-semibold">{preset.win_probability_global}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payout Máx:</span>
                        <span className="font-semibold">{preset.pay_upto_percentage}%</span>
                      </div>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => setSelectedPreset(preset.id)}
                        >
                          Aplicar Preset
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Aplicar Preset: {preset.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="p-4 bg-muted rounded-lg">
                            <h4 className="font-medium mb-2">Configurações do Preset:</h4>
                            <div className="space-y-1 text-sm">
                              <p>• Probabilidade de Vitória: <strong>{preset.win_probability_global}%</strong></p>
                              <p>• Payout Máximo: <strong>{preset.pay_upto_percentage}%</strong></p>
                              <p>• Nível de Risco: <Badge className={risk.color}>{risk.level}</Badge></p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Aplicar em:</label>
                            <Select value={selectedScratchType} onValueChange={setSelectedScratchType}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione uma raspadinha" />
                              </SelectTrigger>
                              <SelectContent>
                                {scratchCards.map(card => (
                                  <SelectItem key={card.id} value={card.scratch_type}>
                                    {card.name} ({card.scratch_type})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex gap-3">
                            <Button
                              onClick={() => handleApplyPreset(selectedScratchType, preset.id)}
                              disabled={!selectedScratchType || isApplying}
                              className="flex-1"
                            >
                              {isApplying ? (
                                <div className="flex items-center gap-2">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  Aplicando...
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4" />
                                  Confirmar Aplicação
                                </div>
                              )}
                            </Button>
                            <DialogTrigger asChild>
                              <Button variant="outline">Cancelar</Button>
                            </DialogTrigger>
                          </div>

                          {selectedScratchType && (
                            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                <strong>Atenção:</strong> Esta ação irá sobrescrever as configurações atuais 
                                da raspadinha selecionada. A alteração será registrada nos logs.
                              </p>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Aplicação Rápida */}
          <Card className="border-dashed">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h3 className="font-medium">Aplicação Rápida de Preset</h3>
                <p className="text-sm text-muted-foreground">
                  Selecione uma raspadinha e aplique um preset rapidamente
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <Select value={selectedScratchType} onValueChange={setSelectedScratchType}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Raspadinha" />
                    </SelectTrigger>
                    <SelectContent>
                      {scratchCards.map(card => (
                        <SelectItem key={card.id} value={card.scratch_type}>
                          {card.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex gap-2">
                    {presets.slice(0, 4).map(preset => (
                      <Button
                        key={preset.id}
                        variant="outline"
                        size="sm"
                        disabled={!selectedScratchType || isApplying}
                        onClick={() => handleApplyPreset(selectedScratchType, preset.id)}
                        className="min-w-16"
                      >
                        {preset.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};