import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useImageUpload } from '@/hooks/useImageUpload';
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  Image, 
  Palette, 
  Clock,
  Gift,
  Upload,
  Save,
  Bell,
  Shield,
  Zap
} from 'lucide-react';

const OptimizedSettings = () => {
  const { uploadImage, uploading } = useImageUpload();
  const { toast } = useToast();
  const [bannerSettings, setBannerSettings] = useState({
    heroImage: '',
    heroTitle: 'Ganhe Prêmios Incríveis!',
    heroSubtitle: 'Raspe e descubra sua sorte',
    showBanner: true,
  });

  const [manualReleaseSettings, setManualReleaseSettings] = useState({
    enabled: true,
    maxPerHour: 3,
    minInterval: 15, // minutos
    autoTriggerLowRtp: true,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    rtpAlerts: true,
    lowProfitAlerts: true,
    highVolumeAlerts: true,
    dailyReports: true,
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const imageUrl = await uploadImage(file, 'banners');
      setBannerSettings(prev => ({ ...prev, [field]: imageUrl }));
      toast({
        title: "Sucesso",
        description: "Imagem carregada com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao carregar a imagem.",
        variant: "destructive",
      });
    }
  };

  const saveBannerSettings = () => {
    // Simulação de salvamento
    toast({
      title: "Configurações Salvas",
      description: "As configurações de banner foram atualizadas.",
    });
  };

  const saveManualReleaseSettings = () => {
    // Simulação de salvamento
    toast({
      title: "Configurações Salvas",
      description: "As configurações de liberação manual foram atualizadas.",
    });
  };

  const saveNotificationSettings = () => {
    // Simulação de salvamento
    toast({
      title: "Configurações Salvas",
      description: "As configurações de notificação foram atualizadas.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Configurações do Sistema
          </h2>
          <p className="text-muted-foreground">Personalize banners, liberações manuais e notificações</p>
        </div>
      </div>

      <Tabs defaultValue="visual" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="visual">Personalização Visual</TabsTrigger>
          <TabsTrigger value="manual">Liberação Manual</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="general">Configurações Gerais</TabsTrigger>
        </TabsList>

        {/* Personalização Visual */}
        <TabsContent value="visual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Banners e Imagens
              </CardTitle>
              <CardDescription>
                Configure os elementos visuais das raspadinhas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Hero Banner */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-banner"
                    checked={bannerSettings.showBanner}
                    onCheckedChange={(checked) => 
                      setBannerSettings(prev => ({ ...prev, showBanner: checked }))
                    }
                  />
                  <Label htmlFor="show-banner">Exibir Banner Principal</Label>
                </div>

                {bannerSettings.showBanner && (
                  <div className="space-y-4 pl-6 border-l-2 border-muted">
                    <div>
                      <Label htmlFor="hero-image">Imagem do Banner</Label>
                      <div className="mt-2 flex items-center space-x-4">
                        {bannerSettings.heroImage && (
                          <img 
                            src={bannerSettings.heroImage} 
                            alt="Hero" 
                            className="w-32 h-20 object-cover rounded border"
                          />
                        )}
                        <div>
                          <input
                            id="hero-image"
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'heroImage')}
                            className="hidden"
                          />
                          <Button
                            variant="outline"
                            onClick={() => document.getElementById('hero-image')?.click()}
                            disabled={uploading}
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            {uploading ? 'Carregando...' : 'Carregar Imagem'}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="hero-title">Título do Banner</Label>
                      <Input
                        id="hero-title"
                        value={bannerSettings.heroTitle}
                        onChange={(e) => setBannerSettings(prev => ({ ...prev, heroTitle: e.target.value }))}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="hero-subtitle">Subtítulo do Banner</Label>
                      <Input
                        id="hero-subtitle"
                        value={bannerSettings.heroSubtitle}
                        onChange={(e) => setBannerSettings(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
              </div>

              <Button onClick={saveBannerSettings} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Salvar Configurações Visuais
              </Button>
            </CardContent>
          </Card>

          {/* Preview */}
          {bannerSettings.showBanner && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Preview do Banner
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-6 bg-gradient-to-r from-primary/10 to-primary/5">
                  {bannerSettings.heroImage && (
                    <img 
                      src={bannerSettings.heroImage} 
                      alt="Preview" 
                      className="w-full h-32 object-cover rounded-lg mb-4"
                    />
                  )}
                  <h3 className="text-2xl font-bold mb-2">{bannerSettings.heroTitle}</h3>
                  <p className="text-muted-foreground">{bannerSettings.heroSubtitle}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Liberação Manual */}
        <TabsContent value="manual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Sistema de Liberação Manual
              </CardTitle>
              <CardDescription>
                Configure quando e como liberar prêmios manualmente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="manual-enabled"
                  checked={manualReleaseSettings.enabled}
                  onCheckedChange={(checked) => 
                    setManualReleaseSettings(prev => ({ ...prev, enabled: checked }))
                  }
                />
                <Label htmlFor="manual-enabled">Habilitar Liberação Manual</Label>
              </div>

              {manualReleaseSettings.enabled && (
                <div className="space-y-4 pl-6 border-l-2 border-muted">
                  <div>
                    <Label htmlFor="max-per-hour">Máximo de Liberações por Hora</Label>
                    <Input
                      id="max-per-hour"
                      type="number"
                      value={manualReleaseSettings.maxPerHour}
                      onChange={(e) => setManualReleaseSettings(prev => ({ 
                        ...prev, 
                        maxPerHour: parseInt(e.target.value) || 0 
                      }))}
                      className="mt-1"
                      min="1"
                      max="10"
                    />
                  </div>

                  <div>
                    <Label htmlFor="min-interval">Intervalo Mínimo (minutos)</Label>
                    <Input
                      id="min-interval"
                      type="number"
                      value={manualReleaseSettings.minInterval}
                      onChange={(e) => setManualReleaseSettings(prev => ({ 
                        ...prev, 
                        minInterval: parseInt(e.target.value) || 0 
                      }))}
                      className="mt-1"
                      min="5"
                      max="60"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto-trigger"
                      checked={manualReleaseSettings.autoTriggerLowRtp}
                      onCheckedChange={(checked) => 
                        setManualReleaseSettings(prev => ({ ...prev, autoTriggerLowRtp: checked }))
                      }
                    />
                    <Label htmlFor="auto-trigger">Auto-liberar quando RTP estiver muito baixo</Label>
                  </div>
                </div>
              )}

              <Button onClick={saveManualReleaseSettings} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Salvar Configurações de Liberação
              </Button>
            </CardContent>
          </Card>

          {/* Status da Liberação Manual */}
          <Card>
            <CardHeader>
              <CardTitle>Status Atual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-muted-foreground">Liberações na última hora</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">--</div>
                  <div className="text-sm text-muted-foreground">Próxima liberação disponível</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Badge variant="default" className="text-sm">
                    Sistema Ativo
                  </Badge>
                  <div className="text-sm text-muted-foreground mt-1">Status geral</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notificações */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Sistema de Notificações
              </CardTitle>
              <CardDescription>
                Configure quando e como receber alertas do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="rtp-alerts">Alertas de RTP</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificar quando RTP sair do alvo em mais de 15%
                    </p>
                  </div>
                  <Switch
                    id="rtp-alerts"
                    checked={notificationSettings.rtpAlerts}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, rtpAlerts: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="profit-alerts">Alertas de Lucro Baixo</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificar quando margem de lucro ficar abaixo de 40%
                    </p>
                  </div>
                  <Switch
                    id="profit-alerts"
                    checked={notificationSettings.lowProfitAlerts}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, lowProfitAlerts: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="volume-alerts">Alertas de Alto Volume</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificar quando houver picos de atividade
                    </p>
                  </div>
                  <Switch
                    id="volume-alerts"
                    checked={notificationSettings.highVolumeAlerts}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, highVolumeAlerts: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="daily-reports">Relatórios Diários</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber resumo diário por email
                    </p>
                  </div>
                  <Switch
                    id="daily-reports"
                    checked={notificationSettings.dailyReports}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, dailyReports: checked }))
                    }
                  />
                </div>
              </div>

              <Button onClick={saveNotificationSettings} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Salvar Configurações de Notificação
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações Gerais */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configurações Gerais do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="system-timezone">Fuso Horário</Label>
                  <select id="system-timezone" className="w-full p-2 border rounded-md mt-1">
                    <option value="America/Sao_Paulo">São Paulo (UTC-3)</option>
                    <option value="America/Rio_Branco">Rio Branco (UTC-5)</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="currency">Moeda</Label>
                  <select id="currency" className="w-full p-2 border rounded-md mt-1">
                    <option value="BRL">Real Brasileiro (R$)</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="maintenance-mode">Modo de Manutenção</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <Switch id="maintenance-mode" />
                  <span className="text-sm text-muted-foreground">
                    Ativar para bloquear acesso dos usuários
                  </span>
                </div>
              </div>

              <div>
                <Label htmlFor="maintenance-message">Mensagem de Manutenção</Label>
                <Textarea
                  id="maintenance-message"
                  placeholder="Digite a mensagem que será exibida durante a manutenção"
                  className="mt-1"
                  rows={3}
                />
              </div>

              <Button className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Salvar Configurações Gerais
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OptimizedSettings;