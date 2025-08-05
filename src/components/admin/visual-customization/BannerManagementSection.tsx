import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Monitor, Smartphone, Eye, Upload } from 'lucide-react';
import { useVisualCustomization } from '@/hooks/useVisualCustomization';
import { BannerConfig } from '@/types/visualCustomization';

export const BannerManagementSection: React.FC = () => {
  const { getConfiguration, updateConfiguration, uploadVisualAsset, loading } = useVisualCustomization();
  const [banners, setBanners] = useState<Record<string, BannerConfig>>({});
  const [selectedBanner, setSelectedBanner] = useState<string>('home_main');
  const [uploading, setUploading] = useState<string | null>(null);

  const bannerTypes = [
    { id: 'home_main', name: 'Banner Principal - Home', description: 'Banner principal exibido na página inicial' },
    { id: 'home_secondary', name: 'Banner Secundário - Home', description: 'Banner adicional na home page' },
    { id: 'prizes_banner', name: 'Banner - Prêmios', description: 'Banner da página de prêmios' },
    { id: 'profile_banner', name: 'Banner - Perfil', description: 'Banner da página de perfil' },
    { id: 'scratch_banner', name: 'Banner - Raspadinhas', description: 'Banner da seção de raspadinhas' }
  ];

  useEffect(() => {
    // Carregar configurações de todos os banners
    const loadBanners = async () => {
      const bannerConfigs: Record<string, BannerConfig> = {};
      
      for (const banner of bannerTypes) {
        const config = getConfiguration('banner', banner.id);
        bannerConfigs[banner.id] = config?.config_data || {
          enabled: false,
          imageUrlPC: '',
          imageUrlMobile: '',
          altText: '',
          position: 'before_footer'
        };
      }
      
      setBanners(bannerConfigs);
    };
    
    loadBanners();
  }, [getConfiguration]);

  const currentBanner = banners[selectedBanner] || {
    enabled: false,
    imageUrlPC: '',
    imageUrlMobile: '',
    altText: '',
    position: 'before_footer'
  };

  const handleBannerChange = (updates: Partial<BannerConfig>) => {
    setBanners(prev => ({
      ...prev,
      [selectedBanner]: { ...prev[selectedBanner], ...updates }
    }));
  };

  const handleSaveBanner = async () => {
    try {
      await updateConfiguration('banner', selectedBanner, currentBanner);
    } catch (error) {
      console.error('Erro ao salvar banner:', error);
    }
  };

  const handleImageUpload = async (type: 'pc' | 'mobile', file: File) => {
    try {
      setUploading(type);
      const imageUrl = await uploadVisualAsset(file, `banners/${selectedBanner}`);
      if (imageUrl) {
        if (type === 'pc') {
          handleBannerChange({ imageUrlPC: imageUrl });
        } else {
          handleBannerChange({ imageUrlMobile: imageUrl });
        }
      }
    } catch (error) {
      console.error('Erro no upload:', error);
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Seletor de Banner */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Selecionar Banner</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedBanner} onValueChange={setSelectedBanner}>
            <SelectTrigger>
              <SelectValue placeholder="Escolha um banner para configurar" />
            </SelectTrigger>
            <SelectContent>
              {bannerTypes.map((banner) => (
                <SelectItem key={banner.id} value={banner.id}>
                  <div>
                    <div className="font-medium">{banner.name}</div>
                    <div className="text-sm text-muted-foreground">{banner.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Configuração do Banner Selecionado */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Configurar: {bannerTypes.find(b => b.id === selectedBanner)?.name}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={currentBanner.enabled ? "default" : "secondary"}>
                {currentBanner.enabled ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configurações Gerais */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="enabled">Banner Ativo</Label>
              <Switch
                id="enabled"
                checked={currentBanner.enabled}
                onCheckedChange={(checked) => handleBannerChange({ enabled: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="altText">Texto Alternativo (SEO)</Label>
              <Input
                id="altText"
                value={currentBanner.altText}
                onChange={(e) => handleBannerChange({ altText: e.target.value })}
                placeholder="Descrição da imagem para acessibilidade"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Posição do Banner</Label>
              <Select 
                value={currentBanner.position} 
                onValueChange={(value) => handleBannerChange({ position: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="before_footer">Antes do Footer</SelectItem>
                  <SelectItem value="after_header">Após o Header</SelectItem>
                  <SelectItem value="custom">Posição Customizada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Upload de Imagens */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Imagem Desktop */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                <Label className="text-base font-medium">Imagem Desktop</Label>
                <Badge variant="outline" className="text-xs">1000x300px</Badge>
              </div>
              
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload('pc', file);
                  }}
                  disabled={uploading === 'pc'}
                />
                {uploading === 'pc' && (
                  <p className="text-sm text-muted-foreground">Enviando imagem...</p>
                )}
              </div>

              {currentBanner.imageUrlPC && (
                <div className="space-y-2">
                  <img
                    src={currentBanner.imageUrlPC}
                    alt="Preview Desktop"
                    className="w-full h-24 object-cover rounded border"
                  />
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    Visualizar
                  </Button>
                </div>
              )}
            </div>

            {/* Imagem Mobile */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                <Label className="text-base font-medium">Imagem Mobile</Label>
                <Badge variant="outline" className="text-xs">600x200px</Badge>
              </div>
              
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload('mobile', file);
                  }}
                  disabled={uploading === 'mobile'}
                />
                {uploading === 'mobile' && (
                  <p className="text-sm text-muted-foreground">Enviando imagem...</p>
                )}
              </div>

              {currentBanner.imageUrlMobile && (
                <div className="space-y-2">
                  <img
                    src={currentBanner.imageUrlMobile}
                    alt="Preview Mobile"
                    className="w-full h-24 object-cover rounded border"
                  />
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    Visualizar
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Botão Salvar */}
          <div className="pt-4 border-t">
            <Button onClick={handleSaveBanner} disabled={loading} className="w-full">
              Salvar Configurações do Banner
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Responsivo */}
      {(currentBanner.imageUrlPC || currentBanner.imageUrlMobile) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Preview Responsivo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentBanner.imageUrlPC && (
                <div>
                  <Label className="text-sm text-muted-foreground">Desktop/Tablet</Label>
                  <div className="border rounded-lg overflow-hidden">
                    <img
                      src={currentBanner.imageUrlPC}
                      alt={currentBanner.altText}
                      className="w-full h-auto"
                      style={{ aspectRatio: '10/3' }}
                    />
                  </div>
                </div>
              )}
              
              {currentBanner.imageUrlMobile && (
                <div>
                  <Label className="text-sm text-muted-foreground">Mobile</Label>
                  <div className="border rounded-lg overflow-hidden max-w-xs">
                    <img
                      src={currentBanner.imageUrlMobile}
                      alt={currentBanner.altText}
                      className="w-full h-auto"
                      style={{ aspectRatio: '3/1' }}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};