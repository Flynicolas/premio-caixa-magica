import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Monitor, Smartphone, Eye, Settings } from 'lucide-react';
import { useVisualCustomization } from '@/hooks/useVisualCustomization';
import { PremiumCatalogConfig } from '@/types/visualCustomization';

export const PremiumCatalogSection: React.FC = () => {
  const { getConfiguration, updateConfiguration, loading } = useVisualCustomization();
  const [config, setConfig] = useState<PremiumCatalogConfig>({
    enabled: true,
    cardsPerRow: 2,
    showMobileOnly: true,
    animationDuration: 300
  });

  useEffect(() => {
    const catalogConfig = getConfiguration('premium_catalog', 'settings');
    if (catalogConfig) {
      setConfig(catalogConfig.config_data as PremiumCatalogConfig);
    }
  }, [getConfiguration]);

  const handleConfigChange = (updates: Partial<PremiumCatalogConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const handleSaveConfig = async () => {
    try {
      await updateConfiguration('premium_catalog', 'settings', config);
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configurações de Exibição */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurações de Exibição
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enabled">Catálogo Premium Ativo</Label>
              <p className="text-sm text-muted-foreground">
                Ativa ou desativa a exibição do catálogo premium
              </p>
            </div>
            <Switch
              id="enabled"
              checked={config.enabled}
              onCheckedChange={(checked) => handleConfigChange({ enabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="showMobileOnly">Exibir Apenas no Mobile</Label>
              <p className="text-sm text-muted-foreground">
                Mostra o catálogo premium apenas em dispositivos móveis
              </p>
            </div>
            <Switch
              id="showMobileOnly"
              checked={config.showMobileOnly}
              onCheckedChange={(checked) => handleConfigChange({ showMobileOnly: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Layout e Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Layout e Grid
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Cards por Linha: {config.cardsPerRow}</Label>
            <Slider
              value={[config.cardsPerRow]}
              onValueChange={(value) => handleConfigChange({ cardsPerRow: value[0] })}
              max={4}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 card</span>
              <span>2 cards</span>
              <span>3 cards</span>
              <span>4 cards</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 p-4 border rounded-lg bg-muted/20">
            <p className="col-span-4 text-sm font-medium mb-2">Preview do Layout:</p>
            {Array.from({ length: config.cardsPerRow * 2 }).map((_, index) => (
              <div
                key={index}
                className="aspect-[2/3] bg-primary/20 rounded border-2 border-dashed border-primary/40"
                style={{
                  gridColumn: index >= config.cardsPerRow ? `${(index % config.cardsPerRow) + 1}` : undefined
                }}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Animações */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Animações e Transições</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Duração da Animação: {config.animationDuration}ms</Label>
            <Slider
              value={[config.animationDuration]}
              onValueChange={(value) => handleConfigChange({ animationDuration: value[0] })}
              max={1000}
              min={100}
              step={50}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>100ms (Rápido)</span>
              <span>300ms (Normal)</span>
              <span>500ms (Lento)</span>
              <span>1000ms (Muito Lento)</span>
            </div>
          </div>

          <div className="p-4 border rounded-lg bg-muted/20">
            <p className="text-sm font-medium mb-2">Teste de Animação:</p>
            <div 
              className="w-16 h-24 bg-primary/60 rounded transition-all hover:scale-105"
              style={{ transitionDuration: `${config.animationDuration}ms` }}
            >
              <div className="h-full flex items-center justify-center text-xs text-white">
                Hover
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Responsivo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Preview Responsivo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mobile Preview */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Smartphone className="w-4 h-4" />
              <Label className="text-sm font-medium">Mobile Preview</Label>
              {config.showMobileOnly && (
                <Badge variant="default" className="text-xs">Visível</Badge>
              )}
              {!config.showMobileOnly && (
                <Badge variant="secondary" className="text-xs">Oculto</Badge>
              )}
            </div>
            
            <div className="max-w-sm border rounded-lg p-4 bg-muted/10">
              <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${config.cardsPerRow}, 1fr)` }}>
                {Array.from({ length: config.cardsPerRow * 2 }).map((_, index) => (
                  <div
                    key={index}
                    className="aspect-[2/3] bg-gradient-to-br from-purple-500 to-pink-500 rounded text-white text-xs flex items-end p-2"
                  >
                    <div>
                      <div className="font-bold">Card {index + 1}</div>
                      <div className="text-xs opacity-75">R$ 25,00</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Preview */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Monitor className="w-4 h-4" />
              <Label className="text-sm font-medium">Desktop Preview</Label>
              {!config.showMobileOnly && (
                <Badge variant="default" className="text-xs">Visível</Badge>
              )}
              {config.showMobileOnly && (
                <Badge variant="secondary" className="text-xs">Oculto</Badge>
              )}
            </div>
            
            <div className="border rounded-lg p-4 bg-muted/10">
              <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${Math.min(config.cardsPerRow * 2, 4)}, 1fr)` }}>
                {Array.from({ length: Math.min(config.cardsPerRow * 2, 4) }).map((_, index) => (
                  <div
                    key={index}
                    className="aspect-[2/3] bg-gradient-to-br from-blue-500 to-cyan-500 rounded text-white text-sm flex items-end p-3"
                  >
                    <div>
                      <div className="font-bold">Card {index + 1}</div>
                      <div className="text-xs opacity-75">R$ 25,00</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <Button onClick={handleSaveConfig} disabled={loading} size="lg">
          Salvar Configurações do Catálogo
        </Button>
      </div>
    </div>
  );
};