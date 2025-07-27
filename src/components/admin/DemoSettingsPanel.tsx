import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Settings, Save, RotateCcw } from 'lucide-react';

interface DemoSettings {
  id: string;
  saldo_inicial: number;
  tempo_reset_horas: number;
  probabilidades_chest: Record<string, any>;
  itens_demo: string[];
}

const DemoSettingsPanel = () => {
  const [settings, setSettings] = useState<DemoSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('demo_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) throw error;
      setSettings({
        ...data,
        probabilidades_chest: data.probabilidades_chest as Record<string, any>,
        itens_demo: data.itens_demo as string[]
      });
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('demo_settings')
        .update({
          saldo_inicial: settings.saldo_inicial,
          tempo_reset_horas: settings.tempo_reset_horas,
          probabilidades_chest: settings.probabilidades_chest,
          itens_demo: settings.itens_demo,
          updated_at: new Date().toISOString()
        })
        .eq('id', settings.id);

      if (error) throw error;

      toast({
        title: "Configurações salvas!",
        description: "As configurações demo foram atualizadas",
        variant: "default"
      });
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateChestProbability = (chestType: string, field: string, value: number) => {
    if (!settings) return;

    setSettings(prev => ({
      ...prev!,
      probabilidades_chest: {
        ...prev!.probabilidades_chest,
        [chestType]: {
          ...prev!.probabilidades_chest[chestType],
          [field]: value
        }
      }
    }));
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurações Demo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Carregando configurações...</div>
        </CardContent>
      </Card>
    );
  }

  if (!settings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurações Demo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600">Erro ao carregar configurações</p>
            <Button onClick={fetchSettings} className="mt-4">
              <RotateCcw className="w-4 h-4 mr-2" />
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chestTypes = [
    { key: 'basic', name: 'Básico' },
    { key: 'silver', name: 'Prata' },
    { key: 'gold', name: 'Ouro' },
    { key: 'diamond', name: 'Diamante' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Configurações Demo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configurações Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="saldo_inicial">Saldo Inicial (R$)</Label>
            <Input
              id="saldo_inicial"
              type="number"
              value={settings.saldo_inicial}
              onChange={(e) => setSettings(prev => ({
                ...prev!,
                saldo_inicial: Number(e.target.value)
              }))}
              min="0"
              step="0.01"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tempo_reset">Tempo Reset (horas)</Label>
            <Input
              id="tempo_reset"
              type="number"
              value={settings.tempo_reset_horas}
              onChange={(e) => setSettings(prev => ({
                ...prev!,
                tempo_reset_horas: Number(e.target.value)
              }))}
              min="1"
              max="168"
            />
          </div>
        </div>

        {/* Probabilidades dos Baús */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Probabilidades dos Baús Demo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chestTypes.map(chest => (
              <Card key={chest.key} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{chest.name}</h4>
                  <Badge variant="outline">{chest.key}</Badge>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Taxa de Vitória</Label>
                    <Input
                      type="number"
                      value={settings.probabilidades_chest[chest.key]?.win_rate || 0.8}
                      onChange={(e) => updateChestProbability(
                        chest.key, 
                        'win_rate', 
                        Number(e.target.value)
                      )}
                      min="0"
                      max="1"
                      step="0.1"
                      className="text-sm"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-xs">Taxa de Itens Raros</Label>
                    <Input
                      type="number"
                      value={settings.probabilidades_chest[chest.key]?.rare_rate || 0.3}
                      onChange={(e) => updateChestProbability(
                        chest.key, 
                        'rare_rate', 
                        Number(e.target.value)
                      )}
                      min="0"
                      max="1"
                      step="0.1"
                      className="text-sm"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Itens Demo */}
        <div>
          <Label htmlFor="itens_demo">Itens Demo (JSON)</Label>
          <Textarea
            id="itens_demo"
            value={JSON.stringify(settings.itens_demo, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                setSettings(prev => ({
                  ...prev!,
                  itens_demo: parsed
                }));
              } catch {
                // Ignore invalid JSON while typing
              }
            }}
            rows={6}
            className="font-mono text-sm"
          />
        </div>

        {/* Botão Salvar */}
        <div className="flex justify-end">
          <Button onClick={saveSettings} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DemoSettingsPanel;