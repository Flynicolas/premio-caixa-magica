import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Upload, Eye } from 'lucide-react';
import { useVisualCustomization } from '@/hooks/useVisualCustomization';
import { HeroSliderConfig, HeroSlide } from '@/types/visualCustomization';

export const HeroConfigurationSection: React.FC = () => {
  const { getConfiguration, updateConfiguration, uploadVisualAsset, loading } = useVisualCustomization();
  const [config, setConfig] = useState<HeroSliderConfig>({
    autoPlay: true,
    autoPlayInterval: 4000,
    showNavigation: true,
    showDots: true,
    slides: []
  });
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    const heroConfig = getConfiguration('hero', 'main_slider');
    if (heroConfig) {
      setConfig(heroConfig.config_data as HeroSliderConfig);
    }
  }, [getConfiguration]);

  const handleConfigChange = (updates: Partial<HeroSliderConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const handleSaveConfig = async () => {
    try {
      await updateConfiguration('hero', 'main_slider', config);
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
    }
  };

  const handleAddSlide = () => {
    const newSlide: HeroSlide = {
      id: Date.now().toString(),
      title: 'Novo Slide',
      subtitle: 'Descrição do slide',
      image: '',
      order: config.slides.length
    };
    
    handleConfigChange({
      slides: [...config.slides, newSlide]
    });
  };

  const handleUpdateSlide = (slideId: string, updates: Partial<HeroSlide>) => {
    const updatedSlides = config.slides.map(slide =>
      slide.id === slideId ? { ...slide, ...updates } : slide
    );
    handleConfigChange({ slides: updatedSlides });
  };

  const handleDeleteSlide = (slideId: string) => {
    const filteredSlides = config.slides.filter(slide => slide.id !== slideId);
    handleConfigChange({ slides: filteredSlides });
  };

  const handleImageUpload = async (slideId: string, file: File) => {
    try {
      setUploading(slideId);
      const imageUrl = await uploadVisualAsset(file, 'hero-slides');
      if (imageUrl) {
        handleUpdateSlide(slideId, { image: imageUrl });
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
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="autoPlay">Auto Play</Label>
              <Switch
                id="autoPlay"
                checked={config.autoPlay}
                onCheckedChange={(checked) => handleConfigChange({ autoPlay: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="showNavigation">Mostrar Navegação</Label>
              <Switch
                id="showNavigation"
                checked={config.showNavigation}
                onCheckedChange={(checked) => handleConfigChange({ showNavigation: checked })}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="showDots">Mostrar Indicadores</Label>
              <Switch
                id="showDots"
                checked={config.showDots}
                onCheckedChange={(checked) => handleConfigChange({ showDots: checked })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="interval">Intervalo (ms)</Label>
              <Input
                id="interval"
                type="number"
                value={config.autoPlayInterval}
                onChange={(e) => handleConfigChange({ autoPlayInterval: parseInt(e.target.value) })}
                min={1000}
                max={10000}
                step={500}
              />
            </div>
          </div>
          
          <Button onClick={handleSaveConfig} disabled={loading}>
            Salvar Configurações
          </Button>
        </CardContent>
      </Card>

      {/* Gerenciar Slides */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Slides do Hero</CardTitle>
          <Button onClick={handleAddSlide} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Slide
          </Button>
        </CardHeader>
        <CardContent>
          {config.slides.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum slide configurado</p>
              <p className="text-sm">Clique em "Adicionar Slide" para começar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {config.slides.map((slide, index) => (
                <Card key={slide.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Slide {index + 1}</Badge>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteSlide(slide.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Título</Label>
                        <Input
                          value={slide.title}
                          onChange={(e) => handleUpdateSlide(slide.id, { title: e.target.value })}
                          placeholder="Título do slide"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Subtítulo</Label>
                        <Input
                          value={slide.subtitle}
                          onChange={(e) => handleUpdateSlide(slide.id, { subtitle: e.target.value })}
                          placeholder="Subtítulo do slide"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Imagem (1200x400px recomendado)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(slide.id, file);
                          }}
                          disabled={uploading === slide.id}
                        />
                        {slide.image && (
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      {uploading === slide.id && (
                        <p className="text-sm text-muted-foreground">Enviando imagem...</p>
                      )}
                      {slide.image && (
                        <div className="mt-2">
                          <img
                            src={slide.image}
                            alt={slide.title}
                            className="h-20 w-auto rounded border object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};