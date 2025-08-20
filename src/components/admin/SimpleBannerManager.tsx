import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Upload, Eye, Save, Monitor, Smartphone, Image, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface BannerConfig {
  id: string;
  name: string;
  description: string;
  desktopImage: string;
  mobileImage: string;
  position: 'header' | 'footer' | 'hero';
  isActive: boolean;
  altText: string;
}

const SimpleBannerManager = () => {
  const [banners, setBanners] = useState<BannerConfig[]>([
    {
      id: 'hero-banner',
      name: 'Banner Principal',
      description: 'Banner hero do site - primeira impressão',
      desktopImage: '/lovable-uploads/hero-desktop.jpg',
      mobileImage: '/lovable-uploads/hero-mobile.jpg',
      position: 'hero',
      isActive: true,
      altText: 'Banner principal do site'
    },
    {
      id: 'promo-banner',
      name: 'Banner Promocional',
      description: 'Banner de promoções e ofertas especiais',
      desktopImage: '/lovable-uploads/promo-desktop.jpg',
      mobileImage: '/lovable-uploads/promo-mobile.jpg',
      position: 'header',
      isActive: false,
      altText: 'Promoções especiais'
    },
    {
      id: 'footer-banner',
      name: 'Banner Rodapé',
      description: 'Banner informativo no rodapé',
      desktopImage: '/lovable-uploads/footer-desktop.jpg',
      mobileImage: '/lovable-uploads/footer-mobile.jpg',
      position: 'footer',
      isActive: true,
      altText: 'Informações adicionais'
    }
  ]);

  const [selectedBanner, setSelectedBanner] = useState<BannerConfig | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const desktopFileRef = useRef<HTMLInputElement>(null);
  const mobileFileRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File, type: 'desktop' | 'mobile') => {
    if (!selectedBanner) return;

    // Simular upload - em produção, usar Supabase Storage
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      // Mock URL - substituir por upload real
      const mockUrl = URL.createObjectURL(file);
      
      const updatedBanner = {
        ...selectedBanner,
        [type === 'desktop' ? 'desktopImage' : 'mobileImage']: mockUrl
      };
      
      setSelectedBanner(updatedBanner);
      setBanners(prev => prev.map(b => b.id === selectedBanner.id ? updatedBanner : b));
      
      toast.success(`Imagem ${type} atualizada com sucesso!`);
    } catch (error) {
      toast.error('Erro ao fazer upload da imagem');
    }
  };

  const handleSaveBanner = () => {
    if (!selectedBanner) return;
    
    setBanners(prev => prev.map(b => b.id === selectedBanner.id ? selectedBanner : b));
    toast.success('Banner salvo com sucesso!');
  };

  const toggleBannerStatus = (bannerId: string) => {
    setBanners(prev => prev.map(b => 
      b.id === bannerId ? { ...b, isActive: !b.isActive } : b
    ));
    toast.success('Status do banner atualizado!');
  };

  const getPositionBadgeColor = (position: string) => {
    switch (position) {
      case 'hero': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'header': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      case 'footer': return 'bg-gradient-to-r from-green-500 to-emerald-500';
      default: return 'bg-gradient-to-r from-gray-500 to-slate-500';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Gestão de Banners</h2>
          <p className="text-muted-foreground">
            Gerencie todos os banners do site de forma simples e responsiva
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50">
            {banners.filter(b => b.isActive).length} Ativos
          </Badge>
          <Badge variant="outline" className="bg-gray-50">
            {banners.length} Total
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Banners */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Banners Disponíveis
              </CardTitle>
              <CardDescription>
                Selecione um banner para editar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {banners.map((banner) => (
                <div
                  key={banner.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all hover:border-primary/50 ${
                    selectedBanner?.id === banner.id ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                  onClick={() => setSelectedBanner(banner)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{banner.name}</h4>
                    <Badge 
                      variant={banner.isActive ? "default" : "secondary"}
                      className={banner.isActive ? getPositionBadgeColor(banner.position) : ''}
                    >
                      {banner.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{banner.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {banner.position.toUpperCase()}
                    </Badge>
                    <Button
                      size="sm"
                      variant={banner.isActive ? "destructive" : "default"}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBannerStatus(banner.id);
                      }}
                    >
                      {banner.isActive ? 'Desativar' : 'Ativar'}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Editor de Banner */}
        <div className="lg:col-span-2">
          {selectedBanner ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Editando: {selectedBanner.name}</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={previewMode === 'desktop' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewMode('desktop')}
                    >
                      <Monitor className="h-4 w-4 mr-2" />
                      Desktop
                    </Button>
                    <Button
                      variant={previewMode === 'mobile' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewMode('mobile')}
                    >
                      <Smartphone className="h-4 w-4 mr-2" />
                      Mobile
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Preview */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Preview em Tempo Real</Label>
                  <div className={`border rounded-lg overflow-hidden ${
                    previewMode === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'
                  }`}>
                    <img
                      src={previewMode === 'desktop' ? selectedBanner.desktopImage : selectedBanner.mobileImage}
                      alt={selectedBanner.altText}
                      className="w-full h-auto"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  </div>
                </div>

                {/* Upload Controls */}
                <Tabs value={previewMode} onValueChange={(v) => setPreviewMode(v as 'desktop' | 'mobile')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="desktop">Imagem Desktop</TabsTrigger>
                    <TabsTrigger value="mobile">Imagem Mobile</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="desktop" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Imagem para Desktop (Recomendado: 1200x400px)</Label>
                      <div className="flex gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          ref={desktopFileRef}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file, 'desktop');
                          }}
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          onClick={() => desktopFileRef.current?.click()}
                          className="flex-1"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Escolher Arquivo
                        </Button>
                        <Button variant="outline" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="mobile" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Imagem para Mobile (Recomendado: 600x300px)</Label>
                      <div className="flex gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          ref={mobileFileRef}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file, 'mobile');
                          }}
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          onClick={() => mobileFileRef.current?.click()}
                          className="flex-1"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Escolher Arquivo
                        </Button>
                        <Button variant="outline" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Configurações Adicionais */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="alt-text">Texto Alternativo (ALT)</Label>
                    <Input
                      id="alt-text"
                      value={selectedBanner.altText}
                      onChange={(e) => setSelectedBanner({...selectedBanner, altText: e.target.value})}
                      placeholder="Descreva a imagem para acessibilidade"
                    />
                  </div>
                </div>

                {/* Ações */}
                <div className="flex justify-between pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    Alterações são aplicadas em tempo real
                  </div>
                  <Button onClick={handleSaveBanner} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Salvar Configurações
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center space-y-2">
                  <Image className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="font-semibold">Selecione um Banner</h3>
                  <p className="text-muted-foreground">
                    Escolha um banner na lista ao lado para começar a editar
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleBannerManager;