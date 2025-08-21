import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Zap, Shield, TrendingUp } from 'lucide-react';
import { useAdvancedScratchCard } from '@/hooks/useAdvancedScratchCard';
import { toast } from 'sonner';

export const SimplifiedPresetManager: React.FC = () => {
  const { scratchCards, presets, applyPreset } = useAdvancedScratchCard();
  const [selectedScratchType, setSelectedScratchType] = useState<string>('');
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyPreset = async (scratchType: string, presetId: number) => {
    if (!scratchType) {
      toast.error('Selecione uma raspadinha primeiro');
      return;
    }

    setIsApplying(true);
    try {
      await applyPreset(scratchType, presetId);
      toast.success('Configuração aplicada com sucesso!');
    } catch (error) {
      toast.error('Erro ao aplicar configuração');
    } finally {
      setIsApplying(false);
    }
  };

  const getPresetIcon = (name: string) => {
    const iconMap = {
      'Conservador': Shield,
      'Balanceado': TrendingUp, 
      'Agressivo': Zap
    };
    const Icon = iconMap[name as keyof typeof iconMap] || Settings;
    return <Icon className="h-5 w-5" />;
  };

  const getPresetColor = (name: string) => {
    const colorMap = {
      'Conservador': 'bg-green-50 border-green-200 dark:bg-green-900/20',
      'Balanceado': 'bg-blue-50 border-blue-200 dark:bg-blue-900/20',
      'Agressivo': 'bg-orange-50 border-orange-200 dark:bg-orange-900/20'
    };
    return colorMap[name as keyof typeof colorMap] || 'bg-gray-50 border-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* Status do Sistema 80/20 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Sistema 80/20 - Controle de Lucro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">80%</div>
              <div className="text-sm text-green-700">Margem de Lucro</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">20%</div>
              <div className="text-sm text-blue-700">Prêmios aos Usuários</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-gray-600">Auto</div>
              <div className="text-sm text-gray-700">Pesos por Valor</div>
            </div>
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            ✅ Sistema configurado para máxima rentabilidade com controle automático de prêmios
          </div>
        </CardContent>
      </Card>

      {/* Seleção de Raspadinha */}
      <Card>
        <CardHeader>
          <CardTitle>Aplicar Configuração</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Selecione a Raspadinha:
            </label>
            <Select value={selectedScratchType} onValueChange={setSelectedScratchType}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha uma raspadinha para configurar" />
              </SelectTrigger>
              <SelectContent>
                {scratchCards.map(card => (
                  <SelectItem key={card.id} value={card.scratch_type}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{card.name}</span>
                      <Badge variant="outline">R$ {card.price.toFixed(2)}</Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Presets Simplificados */}
          <div>
            <label className="text-sm font-medium mb-3 block">
              Escolha o Perfil de Operação:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {presets.map((preset) => (
                <Card 
                  key={preset.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${getPresetColor(preset.name)}`}
                >
                  <CardContent className="p-4">
                    <div className="text-center space-y-3">
                      <div className="flex flex-col items-center gap-2">
                        {getPresetIcon(preset.name)}
                        <h3 className="font-semibold text-lg">{preset.name}</h3>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {preset.description}
                      </p>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Chance de Vitória:</span>
                          <span className="font-semibold">{preset.win_probability_global}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Margem de Lucro:</span>
                          <span className="font-semibold">{preset.pay_upto_percentage}%</span>
                        </div>
                      </div>

                      <Button 
                        className="w-full"
                        variant="outline"
                        disabled={!selectedScratchType || isApplying}
                        onClick={() => handleApplyPreset(selectedScratchType, preset.id)}
                      >
                        {isApplying ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                            Aplicando...
                          </div>
                        ) : (
                          `Aplicar ${preset.name}`
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {selectedScratchType && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Raspadinha Selecionada: {scratchCards.find(c => c.scratch_type === selectedScratchType)?.name}
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                As configurações serão aplicadas automaticamente. O sistema ajustará:
              </p>
              <ul className="text-sm text-blue-800 dark:text-blue-200 mt-2 space-y-1">
                <li>• Probabilidade de vitória conforme o perfil escolhido</li>
                <li>• Orçamento diário para 20% dos valores arrecadados</li>
                <li>• Pesos automáticos dos itens baseados no valor</li>
                <li>• Controles financeiros para manter 80% de lucro</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};