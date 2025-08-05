import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Image, Palette, Monitor } from 'lucide-react';
import { HeroConfigurationSection } from './visual-customization/HeroConfigurationSection';
import { BannerManagementSection } from './visual-customization/BannerManagementSection';
import { ScratchCardVisualSection } from './visual-customization/ScratchCardVisualSection';
import { PremiumCatalogSection } from './visual-customization/PremiumCatalogSection';

const VisualCustomizationPanel: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customização Visual</h1>
          <p className="text-muted-foreground mt-1">
            Configure banners, hero sliders, capas e elementos visuais do sistema
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Palette className="w-4 h-4 mr-1" />
          Painel Visual
        </Badge>
      </div>

      {/* Tabs de Configuração */}
      <Tabs defaultValue="hero" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="hero" className="flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            Hero Slider
          </TabsTrigger>
          <TabsTrigger value="banners" className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            Banners
          </TabsTrigger>
          <TabsTrigger value="scratch" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Raspadinhas
          </TabsTrigger>
          <TabsTrigger value="catalog" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Catálogo
          </TabsTrigger>
        </TabsList>

        {/* Hero Slider Configuration */}
        <TabsContent value="hero" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Configuração do Hero Slider
              </CardTitle>
              <CardDescription>
                Gerencie os slides do carrossel principal da página inicial
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HeroConfigurationSection />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Banner Management */}
        <TabsContent value="banners" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5" />
                Gerenciamento de Banners
              </CardTitle>
              <CardDescription>
                Configure banners responsivos para diferentes seções do site
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BannerManagementSection />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scratch Card Visual */}
        <TabsContent value="scratch" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Capas das Raspadinhas
              </CardTitle>
              <CardDescription>
                Personalize as imagens de fundo dos cards de raspadinha
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScratchCardVisualSection />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Premium Catalog */}
        <TabsContent value="catalog" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Catálogo Premium
              </CardTitle>
              <CardDescription>
                Configure a aparência e comportamento do catálogo premium
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PremiumCatalogSection />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dimensões de Referência */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">📐 Dimensões de Referência</CardTitle>
          <CardDescription>
            Guia rápido das dimensões recomendadas para cada tipo de imagem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="border rounded-lg p-3">
              <h4 className="font-semibold text-primary mb-2">Hero Slider</h4>
              <p className="text-muted-foreground">1200x400px (3:1)</p>
              <p className="text-xs mt-1">Máx: 2MB | JPG/PNG/WebP</p>
            </div>
            <div className="border rounded-lg p-3">
              <h4 className="font-semibold text-primary mb-2">Banner Desktop</h4>
              <p className="text-muted-foreground">1000x300px (10:3)</p>
              <p className="text-xs mt-1">Máx: 2MB | JPG/PNG/WebP</p>
            </div>
            <div className="border rounded-lg p-3">
              <h4 className="font-semibold text-primary mb-2">Banner Mobile</h4>
              <p className="text-muted-foreground">600x200px (3:1)</p>
              <p className="text-xs mt-1">Máx: 1MB | JPG/PNG/WebP</p>
            </div>
            <div className="border rounded-lg p-3">
              <h4 className="font-semibold text-primary mb-2">Capa Raspadinha</h4>
              <p className="text-muted-foreground">400x600px (2:3)</p>
              <p className="text-xs mt-1">Máx: 1MB | JPG/PNG/WebP</p>
            </div>
            <div className="border rounded-lg p-3">
              <h4 className="font-semibold text-primary mb-2">Catálogo Premium</h4>
              <p className="text-muted-foreground">400x600px (2:3)</p>
              <p className="text-xs mt-1">Máx: 1MB | JPG/PNG/WebP</p>
            </div>
            <div className="border rounded-lg p-3">
              <h4 className="font-semibold text-primary mb-2">Itens do Sistema</h4>
              <p className="text-muted-foreground">400x400px (1:1)</p>
              <p className="text-xs mt-1">Máx: 1MB | Painel de Itens</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VisualCustomizationPanel;