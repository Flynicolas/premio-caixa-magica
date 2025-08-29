import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AlertTriangle, CheckCircle, Bell, Settings, Play, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RTPAlert {
  id: string;
  game_type: string;
  alert_type: string;
  severity: string;
  current_value: number;
  threshold_value: number;
  message: string;
  metadata: any;
  resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
  updated_at: string;
}

interface AlertSettings {
  game_type: string;
  rtp_deviation_threshold: number;
  low_balance_threshold: number;
  high_loss_threshold: number;
  cap_warning_threshold: number;
  email_notifications: boolean;
  slack_notifications: boolean;
  created_at: string;
  updated_at: string;
}

export function RTPAlertsPanel() {
  const [alerts, setAlerts] = useState<RTPAlert[]>([]);
  const [alertSettings, setAlertSettings] = useState<AlertSettings[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGameType, setSelectedGameType] = useState<string>('');
  const [editingSettings, setEditingSettings] = useState<Partial<AlertSettings>>({});
  const { toast } = useToast();

  useEffect(() => {
    loadAlerts();
    loadAlertSettings();
  }, []);

  const loadAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('rtp_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setAlerts(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar alertas",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const loadAlertSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('rtp_alert_settings')
        .select('*')
        .order('game_type');

      if (error) throw error;
      setAlertSettings(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar configurações",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const runAlertCheck = async () => {
    try {
      setLoading(true);
      toast({
        title: "Executando verificação",
        description: "Analisando sistema RTP em busca de alertas..."
      });

      const { data, error } = await supabase.rpc('check_rtp_alerts');

      if (error) throw error;

      const result = data?.[0];
      toast({
        title: "Verificação concluída",
        description: `${result?.alerts_created || 0} novos alertas criados, ${result?.alerts_updated || 0} atualizados`
      });

      loadAlerts();
    } catch (error: any) {
      toast({
        title: "Erro na verificação",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('rtp_alerts')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) throw error;

      toast({
        title: "Alerta resolvido",
        description: "Alerta marcado como resolvido"
      });

      loadAlerts();
    } catch (error: any) {
      toast({
        title: "Erro ao resolver alerta",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const saveAlertSettings = async () => {
    try {
      if (!editingSettings.game_type) {
        toast({
          title: "Erro de validação",
          description: "Selecione um tipo de jogo",
          variant: "destructive"
        });
        return;
      }

      const settingsToSave = {
        game_type: editingSettings.game_type,
        rtp_deviation_threshold: editingSettings.rtp_deviation_threshold || 0.05,
        low_balance_threshold: editingSettings.low_balance_threshold || 100,
        high_loss_threshold: editingSettings.high_loss_threshold || 1000,
        cap_warning_threshold: editingSettings.cap_warning_threshold || 0.8,
        email_notifications: editingSettings.email_notifications ?? true,
        slack_notifications: editingSettings.slack_notifications ?? false
      };

      const { error } = await supabase
        .from('rtp_alert_settings')
        .upsert(settingsToSave);

      if (error) throw error;

      toast({
        title: "Configurações salvas",
        description: "Configurações de alerta atualizadas com sucesso"
      });

      setEditingSettings({});
      loadAlertSettings();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar configurações",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': 
      case 'high': 
        return AlertTriangle;
      default: 
        return Bell;
    }
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'rtp_deviation': return 'Desvio de RTP';
      case 'low_balance': return 'Saldo Baixo';
      case 'high_loss': return 'Perdas Altas';
      case 'cap_exhausted': return 'CAP Esgotado';
      default: return type;
    }
  };

  const activeAlerts = alerts.filter(a => !a.resolved);
  const resolvedAlerts = alerts.filter(a => a.resolved);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Sistema de Alertas RTP
          </CardTitle>
          <CardDescription>
            Monitore automaticamente desvios de RTP e problemas do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="grid grid-cols-3 gap-4 flex-1">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {activeAlerts.filter(a => a.severity === 'critical').length}
                </div>
                <div className="text-sm text-muted-foreground">Críticos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {activeAlerts.filter(a => a.severity !== 'critical').length}
                </div>
                <div className="text-sm text-muted-foreground">Ativos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {resolvedAlerts.length}
                </div>
                <div className="text-sm text-muted-foreground">Resolvidos</div>
              </div>
            </div>
            
            <Button onClick={runAlertCheck} disabled={loading}>
              <Play className="w-4 h-4 mr-2" />
              Executar Verificação
            </Button>
            
            <Button variant="outline" onClick={loadAlerts}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Alertas Ativos</TabsTrigger>
          <TabsTrigger value="resolved">Histórico</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeAlerts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Sistema Funcionando Normalmente</h3>
                <p className="text-muted-foreground">Não há alertas ativos no momento</p>
              </CardContent>
            </Card>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Severidade</TableHead>
                  <TableHead>Mensagem</TableHead>
                  <TableHead>Valor Atual</TableHead>
                  <TableHead>Limite</TableHead>
                  <TableHead>Criado</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeAlerts.map((alert) => {
                  const SeverityIcon = getSeverityIcon(alert.severity);
                  
                  return (
                    <TableRow key={alert.id}>
                      <TableCell className="font-medium">{alert.game_type}</TableCell>
                      <TableCell>
                        <Badge variant={getSeverityColor(alert.severity) as any} className="flex items-center gap-1 w-fit">
                          <SeverityIcon className="w-3 h-3" />
                          {alert.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="text-sm">{getAlertTypeLabel(alert.alert_type)}</div>
                        <div className="text-xs text-muted-foreground truncate">{alert.message}</div>
                      </TableCell>
                      <TableCell className="font-mono">
                        {alert.alert_type.includes('rtp') 
                          ? `${(alert.current_value * 100).toFixed(2)}%`
                          : `R$ ${alert.current_value?.toFixed(2)}`
                        }
                      </TableCell>
                      <TableCell className="font-mono">
                        {alert.alert_type.includes('rtp') 
                          ? `${(alert.threshold_value * 100).toFixed(2)}%`
                          : `R$ ${alert.threshold_value?.toFixed(2)}`
                        }
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(alert.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Resolver
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Resolver Alerta</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja marcar este alerta como resolvido?
                                <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                                  <strong>{getAlertTypeLabel(alert.alert_type)}</strong><br />
                                  {alert.message}
                                </div>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => resolveAlert(alert.id)}>
                                Resolver
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Severidade</TableHead>
                <TableHead>Mensagem</TableHead>
                <TableHead>Criado</TableHead>
                <TableHead>Resolvido</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resolvedAlerts.slice(0, 20).map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell className="font-medium">{alert.game_type}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {alert.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="text-sm">{getAlertTypeLabel(alert.alert_type)}</div>
                    <div className="text-xs text-muted-foreground truncate">{alert.message}</div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(alert.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </TableCell>
                  <TableCell className="text-sm">
                    {alert.resolved_at && format(new Date(alert.resolved_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configurações de Alertas
              </CardTitle>
              <CardDescription>
                Configure limites e notificações para cada tipo de jogo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="gameType">Tipo de Jogo</Label>
                    <Input
                      id="gameType"
                      placeholder="Ex: relampago"
                      value={editingSettings.game_type || ''}
                      onChange={(e) => setEditingSettings({ ...editingSettings, game_type: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="rtpThreshold">Limite de Desvio RTP (%)</Label>
                    <Input
                      id="rtpThreshold"
                      type="number"
                      step="0.01"
                      placeholder="5.00"
                      value={editingSettings.rtp_deviation_threshold ? (editingSettings.rtp_deviation_threshold * 100).toFixed(2) : ''}
                      onChange={(e) => setEditingSettings({ 
                        ...editingSettings, 
                        rtp_deviation_threshold: parseFloat(e.target.value) / 100 || 0.05 
                      })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="lowBalance">Limite de Saldo Baixo (R$)</Label>
                    <Input
                      id="lowBalance"
                      type="number"
                      step="0.01"
                      placeholder="100.00"
                      value={editingSettings.low_balance_threshold || ''}
                      onChange={(e) => setEditingSettings({ 
                        ...editingSettings, 
                        low_balance_threshold: parseFloat(e.target.value) || 100 
                      })}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="highLoss">Limite de Perdas Altas (R$)</Label>
                    <Input
                      id="highLoss"
                      type="number"
                      step="0.01"
                      placeholder="1000.00"
                      value={editingSettings.high_loss_threshold || ''}
                      onChange={(e) => setEditingSettings({ 
                        ...editingSettings, 
                        high_loss_threshold: parseFloat(e.target.value) || 1000 
                      })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="capWarning">Limite de Aviso CAP (%)</Label>
                    <Input
                      id="capWarning"
                      type="number"
                      step="0.01"
                      placeholder="80.00"
                      value={editingSettings.cap_warning_threshold ? (editingSettings.cap_warning_threshold * 100).toFixed(2) : ''}
                      onChange={(e) => setEditingSettings({ 
                        ...editingSettings, 
                        cap_warning_threshold: parseFloat(e.target.value) / 100 || 0.8 
                      })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="emailNotifications"
                        checked={editingSettings.email_notifications ?? true}
                        onCheckedChange={(checked) => setEditingSettings({ 
                          ...editingSettings, 
                          email_notifications: checked 
                        })}
                      />
                      <Label htmlFor="emailNotifications">Notificações por E-mail</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="slackNotifications"
                        checked={editingSettings.slack_notifications ?? false}
                        onCheckedChange={(checked) => setEditingSettings({ 
                          ...editingSettings, 
                          slack_notifications: checked 
                        })}
                      />
                      <Label htmlFor="slackNotifications">Notificações Slack</Label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 mt-6">
                <Button onClick={saveAlertSettings}>
                  Salvar Configurações
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setEditingSettings({})}
                >
                  Limpar
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configurações Existentes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Desvio RTP</TableHead>
                    <TableHead>Saldo Baixo</TableHead>
                    <TableHead>Perdas Altas</TableHead>
                    <TableHead>Notificações</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alertSettings.map((setting) => (
                    <TableRow key={setting.game_type}>
                      <TableCell className="font-medium">{setting.game_type}</TableCell>
                      <TableCell>{(setting.rtp_deviation_threshold * 100).toFixed(1)}%</TableCell>
                      <TableCell>R$ {setting.low_balance_threshold.toFixed(2)}</TableCell>
                      <TableCell>R$ {setting.high_loss_threshold.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {setting.email_notifications && <Badge variant="outline">E-mail</Badge>}
                          {setting.slack_notifications && <Badge variant="outline">Slack</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingSettings(setting)}
                        >
                          Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}