import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Upload } from 'lucide-react';
import { useVisualCustomization } from '@/hooks/useVisualCustomization';
import { ScratchCardConfig } from '@/types/visualCustomization';

export const ScratchCardVisualSection: React.FC = () => {
  const { getConfiguration, updateConfiguration, uploadVisualAsset, loading } = useVisualCustomization();
  const [config, setConfig] = useState<ScratchCardConfig>({
    enabled: true,
    defaultCover: '',
    cards: {}
  });
  const [uploading, setUploading] = useState<string | null>(null);

  const scratchCardTypes = [
    { id: 'bronze', name: 'Bronze', price: 'R$ 5,00', color: 'bg-amber-600' },
    { id: 'prata', name: 'Prata', price: 'R$ 10,00', color: 'bg-gray-400' },
    { id: 'ouro', name: 'Ouro', price: 'R$ 25,00', color: 'bg-yellow-500' },
    { id: 'diamante', name: 'Diamante', price: 'R$ 50,00', color: 'bg-blue-500' },
    { id: 'ruby', name: 'Ruby', price: 'R$ 100,00', color: 'bg-red-500' }
  ];

  useEffect(() => {
    const scratchConfig = getConfiguration('scratch_card', 'covers');
    if (scratchConfig) {
      setConfig(scratchConfig.config_data as ScratchCardConfig);
    }
  }, [getConfiguration]);

  const handleConfigChange = (updates: Partial<ScratchCardConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const handleSaveConfig = async () => {
    try {
      await updateConfiguration('scratch_card', 'covers', config);
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
    }
  };

  const handleImageUpload = async (cardType: string, file: File) => {
    try {
      setUploading(cardType);
      const imageUrl = await uploadVisualAsset(file, `scratch-cards/${cardType}`);
      if (imageUrl) {
        handleConfigChange({
          cards: { ...config.cards, [cardType]: imageUrl }
        });
      }
    } catch (error) {
      console.error('Erro no upload:', error);
    } finally {
      setUploading(null);
    }
  };

  const handleDefaultCoverUpload = async (file: File) => {
    try {
      setUploading('default');
      const imageUrl = await uploadVisualAsset(file, 'scratch-cards');
      if (imageUrl) {
        handleConfigChange({ defaultCover: imageUrl });
      }
    } catch (error) {
      console.error('Erro no upload:', error);
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configurações Gerais */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Configurações Gerais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="enabled">Sistema de Capas Ativo</Label>
            <Switch
              id="enabled"
              checked={config.enabled}
              onCheckedChange={(checked) => handleConfigChange({ enabled: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label>Capa Padrão (400x600px recomendado)</Label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleDefaultCoverUpload(file);
                }}
                disabled={uploading === 'default'}
              />
              {config.defaultCover && (
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
              )}
            </div>
            {uploading === 'default' && (
              <p className="text-sm text-muted-foreground">Enviando imagem padrão...</p>
            )}
            {config.defaultCover && (
              <div className="mt-2">
                <img
                  src={config.defaultCover}
                  alt="Capa padrão"
                  className="h-32 w-auto rounded border object-cover"
                />
              </div>
            )}
          </div>

          <Button onClick={handleSaveConfig} disabled={loading}>
            Salvar Configurações
          </Button>
        </CardContent>
      </Card>

      {/* Capas por Tipo de Raspadinha */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Capas por Tipo de Raspadinha</CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure capas específicas para cada tipo de raspadinha. Se não definida, usará a capa padrão.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {scratchCardTypes.map((cardType) => (
              <Card key={cardType.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded ${cardType.color}`}></div>
                      <span className="font-medium">{cardType.name}</span>
                      <Badge variant="outline" className="text-xs">{cardType.price}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Imagem de Capa (400x600px)</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(cardType.id, file);
                      }}
                      disabled={uploading === cardType.id}
                    />
                    {uploading === cardType.id && (
                      <p className="text-sm text-muted-foreground">Enviando imagem...</p>
                    )}
                  </div>

                  {config.cards[cardType.id] && (
                    <div className="space-y-2">
                      <img
                        src={config.cards[cardType.id]}
                        alt={`Capa ${cardType.name}`}
                        className="w-full h-32 object-cover rounded border"
                      />
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="w-4 h-4 mr-2" />
                        Visualizar
                      </Button>
                    </div>
                  )}

                  {!config.cards[cardType.id] && config.defaultCover && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Usando capa padrão:</p>
                      <img
                        src={config.defaultCover}
                        alt="Capa padrão"
                        className="w-full h-32 object-cover rounded border opacity-50"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preview das Capas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Preview das Capas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {scratchCardTypes.map((cardType) => {
              const imageUrl = config.cards[cardType.id] || config.defaultCover;
              return (
                <div key={cardType.id} className="space-y-2">
                  <div className="relative">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={`Preview ${cardType.name}`}
                        className="w-full aspect-[2/3] object-cover rounded-lg border"
                      />
                    ) : (
                      <div className="w-full aspect-[2/3] bg-gray-200 rounded-lg border flex items-center justify-center">
                        <span className="text-gray-400 text-xs">Sem Imagem</span>
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className={`px-2 py-1 rounded text-white text-xs ${cardType.color}`}>
                        {cardType.name}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-center text-muted-foreground">{cardType.price}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};