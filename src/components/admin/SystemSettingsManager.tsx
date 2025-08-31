import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { supabase } from '@/integrations/supabase/client'
import { useAppSettings } from '@/hooks/useAppSettings'
import { toast } from '@/hooks/use-toast'
import { Loader2, Save, Settings, Shield, Globe, Database, RefreshCw } from 'lucide-react'

export default function SystemSettingsManager() {
  const { settings, loading, updateSetting, getSetting, getBooleanSetting } = useAppSettings()
  const [saving, setSaving] = useState(false)
  
  const [localSettings, setLocalSettings] = useState({
    site_name: '',
    site_description: '',
    maintenance_mode: false,
    allow_registrations: true,
    max_daily_registrations: '',
    security_level: 'medium',
    session_timeout_minutes: '',
    auto_logout_inactive: false,
    enable_notifications: true,
    notification_email: '',
    backup_frequency: 'daily',
    log_retention_days: ''
  })

  useEffect(() => {
    if (!loading) {
      setLocalSettings({
        site_name: getSetting('site_name', 'Gaming Platform'),
        site_description: getSetting('site_description', 'Plataforma de jogos e entretenimento'),
        maintenance_mode: getBooleanSetting('maintenance_mode', false),
        allow_registrations: getBooleanSetting('allow_registrations', true),
        max_daily_registrations: getSetting('max_daily_registrations', '100'),
        security_level: getSetting('security_level', 'medium'),
        session_timeout_minutes: getSetting('session_timeout_minutes', '60'),
        auto_logout_inactive: getBooleanSetting('auto_logout_inactive', false),
        enable_notifications: getBooleanSetting('enable_notifications', true),
        notification_email: getSetting('notification_email', ''),
        backup_frequency: getSetting('backup_frequency', 'daily'),
        log_retention_days: getSetting('log_retention_days', '30')
      })
    }
  }, [loading, settings])

  const handleInputChange = (key: string, value: string | boolean) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }))
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      // Salvar todas as configurações
      const promises = Object.entries(localSettings).map(([key, value]) => 
        updateSetting(key, value.toString())
      )
      
      await Promise.all(promises)
      
      toast({
        title: "Configurações salvas",
        description: "Todas as configurações do sistema foram atualizadas."
      })
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const getSecurityLevelBadge = (level: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      'low': 'secondary',
      'medium': 'default',
      'high': 'destructive'
    }
    
    return <Badge variant={variants[level] || 'default'}>{level.toUpperCase()}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando configurações do sistema...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Configurações Gerais do Sistema</h1>
          <p className="text-muted-foreground">
            Gerencie as configurações globais e comportamentos do sistema
          </p>
        </div>
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Salvar Alterações
        </Button>
      </div>

      {/* Configurações Gerais */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            <CardTitle>Configurações Gerais</CardTitle>
          </div>
          <CardDescription>
            Configurações básicas do site e plataforma
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="site_name">Nome do Site</Label>
              <Input
                id="site_name"
                value={localSettings.site_name}
                onChange={(e) => handleInputChange('site_name', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="notification_email">Email de Notificações</Label>
              <Input
                id="notification_email"
                type="email"
                value={localSettings.notification_email}
                onChange={(e) => handleInputChange('notification_email', e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="site_description">Descrição do Site</Label>
            <Textarea
              id="site_description"
              value={localSettings.site_description}
              onChange={(e) => handleInputChange('site_description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Modo de Manutenção</Label>
              <p className="text-sm text-muted-foreground">
                Ativar para bloquear acesso temporariamente
              </p>
            </div>
            <Switch
              checked={localSettings.maintenance_mode}
              onCheckedChange={(checked) => handleInputChange('maintenance_mode', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Permitir Novos Registros</Label>
              <p className="text-sm text-muted-foreground">
                Controla se novos usuários podem se cadastrar
              </p>
            </div>
            <Switch
              checked={localSettings.allow_registrations}
              onCheckedChange={(checked) => handleInputChange('allow_registrations', checked)}
            />
          </div>

          <div>
            <Label htmlFor="max_registrations">Máximo de Registros Diários</Label>
            <Input
              id="max_registrations"
              type="number"
              value={localSettings.max_daily_registrations}
              onChange={(e) => handleInputChange('max_daily_registrations', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Segurança */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Configurações de Segurança</CardTitle>
          </div>
          <CardDescription>
            Configurações relacionadas à segurança e autenticação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nível de Segurança</Label>
              <Select
                value={localSettings.security_level}
                onValueChange={(value) => handleInputChange('security_level', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixo</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="high">Alto</SelectItem>
                </SelectContent>
              </Select>
              <div className="mt-2">
                {getSecurityLevelBadge(localSettings.security_level)}
              </div>
            </div>

            <div>
              <Label htmlFor="session_timeout">Timeout de Sessão (minutos)</Label>
              <Input
                id="session_timeout"
                type="number"
                value={localSettings.session_timeout_minutes}
                onChange={(e) => handleInputChange('session_timeout_minutes', e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Auto Logout por Inatividade</Label>
              <p className="text-sm text-muted-foreground">
                Desconectar usuários inativos automaticamente
              </p>
            </div>
            <Switch
              checked={localSettings.auto_logout_inactive}
              onCheckedChange={(checked) => handleInputChange('auto_logout_inactive', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Configurações do Sistema */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <CardTitle>Configurações do Sistema</CardTitle>
          </div>
          <CardDescription>
            Configurações técnicas e de manutenção
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Frequência de Backup</Label>
              <Select
                value={localSettings.backup_frequency}
                onValueChange={(value) => handleInputChange('backup_frequency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">A cada hora</SelectItem>
                  <SelectItem value="daily">Diário</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="log_retention">Retenção de Logs (dias)</Label>
              <Input
                id="log_retention"
                type="number"
                value={localSettings.log_retention_days}
                onChange={(e) => handleInputChange('log_retention_days', e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Habilitar Notificações</Label>
              <p className="text-sm text-muted-foreground">
                Enviar notificações do sistema por email
              </p>
            </div>
            <Switch
              checked={localSettings.enable_notifications}
              onCheckedChange={(checked) => handleInputChange('enable_notifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Informações do Sistema */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Status do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Gateway Principal</p>
              <p className="font-medium text-green-600">SUITPAY PIX</p>
            </div>
            <div>
              <p className="text-muted-foreground">Modo Manutenção</p>
              <p className="font-medium">
                {localSettings.maintenance_mode ? (
                  <span className="text-red-600">Ativado</span>
                ) : (
                  <span className="text-green-600">Inativo</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Registros</p>
              <p className="font-medium">
                {localSettings.allow_registrations ? (
                  <span className="text-green-600">Permitidos</span>
                ) : (
                  <span className="text-red-600">Bloqueados</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Segurança</p>
              <p className="font-medium">{localSettings.security_level}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}