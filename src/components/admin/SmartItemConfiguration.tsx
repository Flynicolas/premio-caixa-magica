import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseItem } from '@/types/database';
import { ScratchCardType, scratchCardTypes } from '@/types/scratchCard';
import { 
  Plus, 
  Trash2, 
  Save, 
  Package, 
  AlertCircle, 
  Eye, 
  Target, 
  Calculator, 
  RefreshCw,
  Zap,
  Gift
} from 'lucide-react';

interface SmartItemConfigurationProps {
  items: DatabaseItem[];
  onRefresh: () => void;
}

interface ScratchCardProbability {
  id: string;
  item_id: string;
  scratch_type: ScratchCardType;
  probability_weight: number;
  min_quantity: number;
  max_quantity: number;
  is_active: boolean;
  item?: DatabaseItem;
}

interface RTPSettings {
  id: string;
  scratch_type: string;
  target_rtp: number;
  rtp_enabled: boolean;
}

const SmartItemConfiguration = ({ items, onRefresh }: SmartItemConfigurationProps) => {
  const [probabilities, setProbabilities] = useState<Record<ScratchCardType, ScratchCardProbability[]>>({} as Record<ScratchCardType, ScratchCardProbability[]>);
  const [rtpSettings, setRtpSettings] = useState<Record<string, RTPSettings>>({});
  const [editingWeights, setEditingWeights] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [applyingWeights, setApplyingWeights] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadProbabilities(),
        loadRTPSettings()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProbabilities = async () => {
    try {
      const { data, error } = await supabase
        .from('scratch_card_probabilities')
        .select('*')
        .eq('is_active', true)
        .order('scratch_type')
        .order('probability_weight', { ascending: false });

      if (error) throw error;

      const grouped = (data || []).reduce((acc, prob: any) => {
        const typedProb: ScratchCardProbability = {
          id: prob.id,
          item_id: prob.item_id,
          scratch_type: prob.scratch_type as ScratchCardType,
          probability_weight: prob.probability_weight,
          min_quantity: prob.min_quantity,
          max_quantity: prob.max_quantity,
          is_active: prob.is_active,
          item: items.find((it) => it.id === prob.item_id)
        };

        if (!acc[typedProb.scratch_type]) {
          acc[typedProb.scratch_type] = [];
        }
        acc[typedProb.scratch_type].push(typedProb);
        return acc;
      }, {} as Record<ScratchCardType, ScratchCardProbability[]>);

      setProbabilities(grouped);
    } catch (error: any) {
      console.error('Erro ao carregar probabilidades:', error);
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const loadRTPSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('scratch_card_settings')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      const settingsMap = (data || []).reduce((acc, setting) => {
        acc[setting.scratch_type] = setting;
        return acc;
      }, {} as Record<string, RTPSettings>);

      setRtpSettings(settingsMap);
    } catch (error: any) {
      console.error('Erro ao carregar configurações RTP:', error);
    }
  };

  const calculateOptimalWeight = (itemValue: number, targetRtp: number, cardPrice: number) => {
    // Lógica melhorada para calcular peso baseado na RTP e valor do item
    const valueRatio = itemValue / cardPrice;
    const rtpFactor = targetRtp / 100;
    
    // Peso inversamente proporcional ao valor, ajustado pela RTP
    let weight;
    if (valueRatio <= 0.1) {
      weight = Math.floor(100 * rtpFactor); // Itens muito baratos
    } else if (valueRatio <= 0.5) {
      weight = Math.floor(50 * rtpFactor); // Itens baratos
    } else if (valueRatio <= 1.0) {
      weight = Math.floor(25 * rtpFactor); // Itens médios
    } else if (valueRatio <= 2.0) {
      weight = Math.floor(10 * rtpFactor); // Itens caros
    } else if (valueRatio <= 5.0) {
      weight = Math.floor(5 * rtpFactor); // Itens muito caros
    } else {
      weight = Math.floor(2 * rtpFactor); // Itens premium
    }

    return Math.max(1, weight); // Mínimo 1
  };

  const applySmartWeights = async (scratchType: ScratchCardType) => {
    const typeSettings = rtpSettings[scratchType];
    const cardConfig = scratchCardTypes[scratchType];
    
    if (!typeSettings || !cardConfig) {
      toast({
        title: "Erro",
        description: "Configurações RTP não encontradas para este tipo",
        variant: "destructive"
      });
      return;
    }

    setApplyingWeights(true);
    
    try {
      const typeProbs = probabilities[scratchType] || [];
      
      for (const prob of typeProbs) {
        if (prob.item) {
          const optimalWeight = calculateOptimalWeight(
            prob.item.base_value,
            typeSettings.target_rtp,
            cardConfig.price
          );
          
          await supabase
            .from('scratch_card_probabilities')
            .update({ probability_weight: optimalWeight })
            .eq('id', prob.id);
        }
      }

      toast({
        title: "Pesos aplicados!",
        description: `Pesos otimizados para RTP ${typeSettings.target_rtp}% aplicados com sucesso`,
      });

      await loadProbabilities();
      onRefresh();
    } catch (error: any) {
      console.error('Erro ao aplicar pesos:', error);
      toast({
        title: "Erro ao aplicar pesos",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setApplyingWeights(false);
    }
  };

  const handleWeightChange = (probId: string, weight: number) => {
    setEditingWeights(prev => ({
      ...prev,
      [probId]: Math.max(0, weight)
    }));
  };

  const saveChanges = async () => {
    if (Object.keys(editingWeights).length === 0) return;
    
    setSaving(true);
    try {
      for (const [probId, weight] of Object.entries(editingWeights)) {
        await supabase
          .from('scratch_card_probabilities')
          .update({ probability_weight: weight })
          .eq('id', probId);
      }

      toast({
        title: "Alterações salvas!",
        description: "Pesos atualizados com sucesso.",
      });

      setEditingWeights({});
      loadProbabilities();
      onRefresh();
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const addItem = async (scratchType: ScratchCardType) => {
    if (!selectedItem) {
      toast({
        title: "Selecione um item",
        description: "Escolha um item para adicionar à raspadinha",
        variant: "destructive"
      });
      return;
    }

    // Verificar se item já existe
    const existing = probabilities[scratchType]?.find(p => p.item_id === selectedItem);
    if (existing) {
      toast({
        title: "Item já existe",
        description: "Este item já está configurado para esta raspadinha",
        variant: "destructive"
      });
      return;
    }

    try {
      // Calcular peso inicial baseado na RTP
      const selectedItemData = items.find(i => i.id === selectedItem);
      const typeSettings = rtpSettings[scratchType];
      const cardConfig = scratchCardTypes[scratchType];
      
      let initialWeight = 1;
      if (selectedItemData && typeSettings && cardConfig) {
        initialWeight = calculateOptimalWeight(
          selectedItemData.base_value,
          typeSettings.target_rtp,
          cardConfig.price
        );
      }

      const { error } = await supabase
        .from('scratch_card_probabilities')
        .insert({
          item_id: selectedItem,
          scratch_type: scratchType,
          probability_weight: initialWeight,
          min_quantity: 1,
          max_quantity: 1,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Item adicionado!",
        description: `Item adicionado com peso otimizado ${initialWeight}`,
      });

      setSelectedItem('');
      loadProbabilities();
      onRefresh();
    } catch (error: any) {
      console.error('Erro ao adicionar item:', error);
      toast({
        title: "Erro ao adicionar",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const removeItem = async (probId: string, itemName: string) => {
    if (!confirm(`Remover "${itemName}" desta raspadinha?`)) return;

    try {
      const { error } = await supabase
        .from('scratch_card_probabilities')
        .update({ is_active: false })
        .eq('id', probId);

      if (error) throw error;

      toast({
        title: "Item removido!",
        description: "Item removido da raspadinha",
      });

      loadProbabilities();
      onRefresh();
    } catch (error: any) {
      console.error('Erro ao remover:', error);
      toast({
        title: "Erro ao remover",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const createManualRelease = async (scratchType: ScratchCardType, itemId: string) => {
    try {
      // Buscar item
      const prob = probabilities[scratchType]?.find(p => p.item_id === itemId);
      if (!prob) {
        toast({
          title: "Erro",
          description: "Item não está configurado para este tipo de raspadinha",
          variant: "destructive"
        });
        return;
      }

      // Buscar usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive"
        });
        return;
      }

      const releaseData = {
        item_id: itemId,
        scratch_type: scratchType,
        released_by: user.id,
        status: 'pending',
        priority: 1,
        metadata: {
          manual_release: true,
          created_by_smart_config: true,
          item_name: prob.item?.name,
          item_value: prob.item?.base_value
        }
      };

      const { error } = await supabase
        .from('manual_scratch_releases')
        .insert(releaseData);

      if (error) throw error;

      toast({
        title: "✅ Liberação criada!",
        description: `${prob.item?.name} foi inserido no próximo sorteio de ${scratchCardTypes[scratchType].name}`,
      });

    } catch (error: any) {
      console.error('Erro ao criar liberação:', error);
      toast({
        title: "Erro ao criar liberação",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getAvailableItems = (scratchType: ScratchCardType) => {
    const usedItemIds = probabilities[scratchType]?.map(p => p.item_id) || [];
    return items.filter(item => !usedItemIds.includes(item.id));
  };

  const getStats = (scratchType: ScratchCardType) => {
    const typeProbs = probabilities[scratchType] || [];
    const drawable = typeProbs.filter(p => (editingWeights[p.id] ?? p.probability_weight) > 0);
    const visual = typeProbs.filter(p => (editingWeights[p.id] ?? p.probability_weight) === 0);
    const totalWeight = typeProbs.reduce((sum, p) => sum + (editingWeights[p.id] ?? p.probability_weight), 0);
    
    return {
      total: typeProbs.length,
      drawable: drawable.length,
      visual: visual.length,
      totalWeight,
      hasDrawable: drawable.length > 0
    };
  };

  const hasChanges = Object.keys(editingWeights).length > 0;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando configuração inteligente...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Configuração Inteligente de Itens</h2>
          <p className="text-muted-foreground">
            Sistema otimizado baseado na RTP configurada para cada raspadinha
          </p>
        </div>
        {hasChanges && (
          <div className="flex items-center gap-2">
            <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/20">
              {Object.keys(editingWeights).length} alteração(ões) pendente(s)
            </Badge>
            <Button 
              onClick={saveChanges}
              disabled={saving}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="pix" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          {Object.entries(scratchCardTypes).map(([key, config]) => {
            const stats = getStats(key as ScratchCardType);
            const rtpConfig = rtpSettings[key];
            return (
              <TabsTrigger key={key} value={key} className="flex flex-col gap-1">
                <span className="font-medium">{config.name}</span>
                <div className="flex gap-1 text-xs">
                  <Badge variant="secondary" className="px-1 py-0">
                    {stats.drawable}
                  </Badge>
                  {rtpConfig && (
                    <Badge variant="outline" className="px-1 py-0">
                      RTP {rtpConfig.target_rtp}%
                    </Badge>
                  )}
                </div>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {Object.entries(scratchCardTypes).map(([key, config]) => {
          const scratchType = key as ScratchCardType;
          const typeProbs = probabilities[scratchType] || [];
          const stats = getStats(scratchType);
          const availableItems = getAvailableItems(scratchType);
          const rtpConfig = rtpSettings[scratchType];

          return (
            <TabsContent key={key} value={key}>
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-3">
                      <span className={`w-4 h-4 rounded-full ${config.bgColor}`} />
                      {config.name}
                      <Badge>R$ {config.price.toFixed(2)}</Badge>
                      {rtpConfig && (
                        <Badge variant="outline">
                          RTP Alvo: {rtpConfig.target_rtp}%
                        </Badge>
                      )}
                    </CardTitle>
                    
                     <div className="flex items-center gap-2">
                       <Badge className="bg-green-500/20 text-green-300 gap-1 border-green-500/20">
                         <Target className="w-3 h-3" />
                         {stats.drawable} Sorteáveis
                       </Badge>
                       <Badge className="bg-gray-500/20 text-gray-300 gap-1 border-gray-500/20">
                         <Eye className="w-3 h-3" />
                         {stats.visual} Visuais
                       </Badge>
                     </div>
                  </div>
                  
                  {!rtpConfig && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Configure a RTP na aba "Controle RTP" para usar pesos inteligentes
                      </AlertDescription>
                    </Alert>
                  )}

                   {!stats.hasDrawable && stats.total > 0 && (
                     <Alert className="border-red-500/20 bg-red-500/10">
                       <AlertCircle className="h-4 w-4 text-red-400" />
                       <AlertDescription className="text-red-300">
                         ⚠️ <strong>ATENÇÃO:</strong> Todos os itens estão com peso 0 (apenas visuais). 
                         <br />Ninguém pode ganhar esta raspadinha! Configure pelo menos um item com peso maior que 0.
                       </AlertDescription>
                     </Alert>
                   )}
                   
                   {stats.visual > 0 && (
                     <Alert className="border-yellow-500/20 bg-yellow-500/10">
                       <Eye className="h-4 w-4 text-yellow-400" />
                       <AlertDescription className="text-yellow-300">
                         💡 <strong>Itens Visuais:</strong> Itens com peso 0 aparecem nas raspadinhas mas nunca são sorteados. 
                         Use para criar expectativa visual sem afetar a probabilidade real.
                       </AlertDescription>
                     </Alert>
                   )}
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Adicionar Item */}
                  <div className="flex gap-2">
                    <Select value={selectedItem} onValueChange={setSelectedItem}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Selecionar item para adicionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableItems.map(item => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name} - R$ {item.base_value.toFixed(2)} ({item.rarity})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={() => addItem(scratchType)}
                      disabled={!selectedItem || availableItems.length === 0}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar
                    </Button>
                  </div>

                  {/* Lista de Itens */}
                  <div className="space-y-3">
                    {typeProbs.length > 0 ? (
                      typeProbs
                        .sort((a, b) => (a.item?.base_value || 0) - (b.item?.base_value || 0))
                        .map(prob => {
                        const currentWeight = editingWeights[prob.id] ?? prob.probability_weight;
                        const isVisual = currentWeight === 0;
                        const probability = stats.totalWeight > 0 ? (currentWeight / stats.totalWeight * 100).toFixed(2) : '0';
                        
                        return (
                          <div key={prob.id} className={`border border-border rounded-lg p-3 ${isVisual ? 'bg-muted/50 border-yellow-500/20' : 'bg-card'}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {prob.item?.image_url && (
                                  <img
                                    src={prob.item.image_url}
                                    alt={prob.item.name}
                                    className="w-8 h-8 object-cover rounded"
                                  />
                                )}
                                <div>
                                   <div className="flex items-center gap-2">
                                     <span className="font-medium">{prob.item?.name}</span>
                                     <Badge 
                                       variant={isVisual ? "secondary" : "default"}
                                       className={isVisual ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/20" : ""}
                                       title={isVisual ? "Item visual - Peso 0 (não pode ser sorteado)" : `Probabilidade de sorteio: ${probability}%`}
                                     >
                                       {isVisual ? '👁️ Visual' : `🎯 ${probability}%`}
                                     </Badge>
                                   </div>
                                  <div className="text-sm text-muted-foreground">
                                    R$ {prob.item?.base_value?.toFixed(2)} • {prob.item?.rarity}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                 <Button
                                   size="sm"
                                   variant="outline"
                                   onClick={() => createManualRelease(scratchType, prob.item_id)}
                                   className="gap-1 border-purple-500/20 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20"
                                   title="Força este item a aparecer no próximo sorteio desta raspadinha"
                                 >
                                   <Gift className="w-3 h-3" />
                                   Inserir no Sorteio
                                 </Button>
                                
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-muted-foreground">Peso:</span>
                                  <Input
                                    type="number"
                                    min="0"
                                    value={currentWeight}
                                    onChange={(e) => handleWeightChange(prob.id, parseInt(e.target.value) || 0)}
                                    className="w-16 h-8 text-center"
                                  />
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeItem(prob.id, prob.item?.name || '')}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>Nenhum item configurado</p>
                        <p className="text-sm">Adicione itens usando o seletor acima</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default SmartItemConfiguration;