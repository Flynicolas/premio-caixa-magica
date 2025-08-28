import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Settings, DollarSign, Percent, Calendar, Save, RefreshCw } from 'lucide-react';
import { useAffiliateAdmin } from '@/hooks/useAffiliateAdmin';
import { useToast } from '@/hooks/use-toast';

export const AffiliateSettings = () => {
  const { settings, updateSettings, fetchSettings, loading } = useAffiliateAdmin();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    plan_type: 'hybrid',
    revshare_l1: 0.08,
    revshare_l2: 0.04,
    revshare_l3: 0.03,
    cpa_l1_cents: 5000,
    cpa_l2_cents: 2000,
    cpa_l3_cents: 1000,
    ngr_l1: 0.05,
    ngr_l2: 0.02,
    ngr_l3: 0.01,
    cpa_trigger_min_deposit_cents: 5000,
    payout_min_cents: 5000,
    payout_day_of_week: 1,
    payout_hour: 2,
    require_manual_approval: true,
    negative_carryover: true
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        plan_type: settings.plan_type,
        revshare_l1: settings.revshare_l1,
        revshare_l2: settings.revshare_l2,
        revshare_l3: settings.revshare_l3,
        cpa_l1_cents: settings.cpa_l1_cents,
        cpa_l2_cents: settings.cpa_l2_cents,
        cpa_l3_cents: settings.cpa_l3_cents,
        ngr_l1: settings.ngr_l1,
        ngr_l2: settings.ngr_l2,
        ngr_l3: settings.ngr_l3,
        cpa_trigger_min_deposit_cents: settings.cpa_trigger_min_deposit_cents,
        payout_min_cents: settings.payout_min_cents,
        payout_day_of_week: settings.payout_day_of_week,
        payout_hour: settings.payout_hour,
        require_manual_approval: settings.require_manual_approval,
        negative_carryover: settings.negative_carryover
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(formData);
      toast({
        title: "Configurações salvas",
        description: "As configurações do programa de afiliados foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const weekDays = [
    { value: 1, label: 'Segunda-feira' },
    { value: 2, label: 'Terça-feira' },
    { value: 3, label: 'Quarta-feira' },
    { value: 4, label: 'Quinta-feira' },
    { value: 5, label: 'Sexta-feira' },
    { value: 6, label: 'Sábado' },
    { value: 0, label: 'Domingo' }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-xl font-semibold">Configurações do Programa</h2>
            <p className="text-sm text-muted-foreground">Configure taxas, limites e regras de pagamento</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchSettings} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      {/* Tipo de Plano */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Tipo de Comissão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="plan_type">Modelo de Comissão</Label>
            <Select
              value={formData.plan_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, plan_type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revshare">Revshare (% do GGR)</SelectItem>
                <SelectItem value="cpa">CPA (Valor fixo por conversão)</SelectItem>
                <SelectItem value="ngr">NGR (% do lucro líquido)</SelectItem>
                <SelectItem value="hybrid">Híbrido (Revshare + CPA)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              {formData.plan_type === 'revshare' && 'Afiliados ganham % sobre o GGR (Gross Gaming Revenue)'}
              {formData.plan_type === 'cpa' && 'Afiliados ganham valor fixo por primeiro depósito'}
              {formData.plan_type === 'ngr' && 'Afiliados ganham % sobre o NGR (Net Gaming Revenue)'}
              {formData.plan_type === 'hybrid' && 'Afiliados ganham valor fixo + % sobre receita'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              Atual: {formData.plan_type.toUpperCase()}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Taxas por Nível */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Revshare/NGR */}
        {(formData.plan_type === 'revshare' || formData.plan_type === 'ngr' || formData.plan_type === 'hybrid') && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="w-5 h-5" />
                {formData.plan_type === 'ngr' ? 'Taxas NGR' : 'Taxas Revshare'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="revshare_l1">Nível 1 (%)</Label>
                  <Input
                    id="revshare_l1"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={formData.plan_type === 'ngr' ? formData.ngr_l1 : formData.revshare_l1}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      if (formData.plan_type === 'ngr') {
                        setFormData(prev => ({ ...prev, ngr_l1: value }));
                      } else {
                        setFormData(prev => ({ ...prev, revshare_l1: value }));
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {((formData.plan_type === 'ngr' ? formData.ngr_l1 : formData.revshare_l1) * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <Label htmlFor="revshare_l2">Nível 2 (%)</Label>
                  <Input
                    id="revshare_l2"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={formData.plan_type === 'ngr' ? formData.ngr_l2 : formData.revshare_l2}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      if (formData.plan_type === 'ngr') {
                        setFormData(prev => ({ ...prev, ngr_l2: value }));
                      } else {
                        setFormData(prev => ({ ...prev, revshare_l2: value }));
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {((formData.plan_type === 'ngr' ? formData.ngr_l2 : formData.revshare_l2) * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <Label htmlFor="revshare_l3">Nível 3 (%)</Label>
                  <Input
                    id="revshare_l3"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={formData.plan_type === 'ngr' ? formData.ngr_l3 : formData.revshare_l3}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      if (formData.plan_type === 'ngr') {
                        setFormData(prev => ({ ...prev, ngr_l3: value }));
                      } else {
                        setFormData(prev => ({ ...prev, revshare_l3: value }));
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {((formData.plan_type === 'ngr' ? formData.ngr_l3 : formData.revshare_l3) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* CPA */}
        {(formData.plan_type === 'cpa' || formData.plan_type === 'hybrid') && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Valores CPA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="cpa_l1">Nível 1 (R$)</Label>
                  <Input
                    id="cpa_l1"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.cpa_l1_cents / 100}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      cpa_l1_cents: (parseFloat(e.target.value) || 0) * 100 
                    }))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    R$ {(formData.cpa_l1_cents / 100).toFixed(2)}
                  </p>
                </div>
                <div>
                  <Label htmlFor="cpa_l2">Nível 2 (R$)</Label>
                  <Input
                    id="cpa_l2"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.cpa_l2_cents / 100}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      cpa_l2_cents: (parseFloat(e.target.value) || 0) * 100 
                    }))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    R$ {(formData.cpa_l2_cents / 100).toFixed(2)}
                  </p>
                </div>
                <div>
                  <Label htmlFor="cpa_l3">Nível 3 (R$)</Label>
                  <Input
                    id="cpa_l3"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.cpa_l3_cents / 100}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      cpa_l3_cents: (parseFloat(e.target.value) || 0) * 100 
                    }))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    R$ {(formData.cpa_l3_cents / 100).toFixed(2)}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <Label htmlFor="cpa_trigger">Depósito Mínimo para CPA (R$)</Label>
                <Input
                  id="cpa_trigger"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.cpa_trigger_min_deposit_cents / 100}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    cpa_trigger_min_deposit_cents: (parseFloat(e.target.value) || 0) * 100 
                  }))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Usuário precisa depositar pelo menos R$ {(formData.cpa_trigger_min_deposit_cents / 100).toFixed(2)} para disparar CPA
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Configurações de Pagamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Configurações de Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="payout_min">Saque Mínimo (R$)</Label>
              <Input
                id="payout_min"
                type="number"
                min="0"
                step="1"
                value={formData.payout_min_cents / 100}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  payout_min_cents: (parseFloat(e.target.value) || 0) * 100 
                }))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Mínimo de R$ {(formData.payout_min_cents / 100).toFixed(2)} para solicitar saque
              </p>
            </div>

            <div>
              <Label htmlFor="payout_day">Dia de Pagamento Semanal</Label>
              <Select
                value={formData.payout_day_of_week.toString()}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  payout_day_of_week: parseInt(value) 
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {weekDays.map((day) => (
                    <SelectItem key={day.value} value={day.value.toString()}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="payout_hour">Horário do Pagamento</Label>
              <Input
                id="payout_hour"
                type="number"
                min="0"
                max="23"
                value={formData.payout_hour}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  payout_hour: parseInt(e.target.value) || 0 
                }))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Pagamentos processados às {formData.payout_hour.toString().padStart(2, '0')}:00
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="manual_approval">Aprovação Manual</Label>
                <p className="text-xs text-muted-foreground">
                  Requer aprovação manual antes do pagamento
                </p>
              </div>
              <Switch
                id="manual_approval"
                checked={formData.require_manual_approval}
                onCheckedChange={(checked) => setFormData(prev => ({ 
                  ...prev, 
                  require_manual_approval: checked 
                }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="negative_carryover">Saldo Negativo</Label>
                <p className="text-xs text-muted-foreground">
                  Transportar saldo negativo para próxima semana
                </p>
              </div>
              <Switch
                id="negative_carryover"
                checked={formData.negative_carryover}
                onCheckedChange={(checked) => setFormData(prev => ({ 
                  ...prev, 
                  negative_carryover: checked 
                }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};