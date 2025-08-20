import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Plus, Search, Package, Trash2, TrendingUp, Settings2, Link } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useItemManagement } from '@/hooks/useItemManagement';

interface ScratchCardProbability {
  id: string;
  scratch_type: string;
  item_id: string;
  probability_weight: number;
  min_quantity: number;
  max_quantity: number;
  is_active: boolean;
  item: {
    id: string;
    name: string;
    image_url?: string;
    category: string;
    rarity: string;
    base_value: number;
  } | null;
}

export const ScratchCardItemManagement: React.FC = () => {
  const { items } = useItemManagement();
  const [selectedScratchType, setSelectedScratchType] = useState<string>('');
  const [scratchTypes, setScratchTypes] = useState<string[]>([]);
  const [configuredItems, setConfiguredItems] = useState<ScratchCardProbability[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [rarityFilter, setRarityFilter] = useState<string>('all');

  // Carregar tipos de raspadinha
  const loadScratchTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('scratch_card_settings')
        .select('scratch_type, name')
        .eq('is_active', true)
        .order('scratch_type');

      if (error) throw error;

      const types = data?.map(s => s.scratch_type) || [];
      setScratchTypes(types);

      if (types.length > 0 && !selectedScratchType) {
        setSelectedScratchType(types[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar tipos de raspadinha:', error);
      toast.error('Erro ao carregar tipos de raspadinha');
    }
  };

  // Carregar itens configurados para a raspadinha selecionada
  const loadConfiguredItems = async () => {
    if (!selectedScratchType) return;

    try {
      const { data, error } = await supabase
        .from('scratch_card_probabilities')
        .select(`
          *,
          item:items (
            id,
            name,
            image_url,
            category,
            rarity,
            base_value
          )
        `)
        .eq('scratch_type', selectedScratchType)
        .order('probability_weight', { ascending: false });

      if (error) throw error;

      const formattedData = data?.map((prob: any) => ({
        ...prob,
        item: prob.item
      })) || [];

      setConfiguredItems(formattedData);
    } catch (error) {
      console.error('Erro ao carregar itens configurados:', error);
      toast.error('Erro ao carregar itens configurados');
    }
  };

  // Adicionar item à raspadinha
  const addItemToScratch = async (itemId: string) => {
    if (!selectedScratchType) return;

    // Verificar se já existe
    const exists = configuredItems.some(config => config.item_id === itemId);
    if (exists) {
      toast.error('Item já está configurado nesta raspadinha');
      return;
    }

    try {
      const { error } = await supabase
        .from('scratch_card_probabilities')
        .insert({
          scratch_type: selectedScratchType,
          item_id: itemId,
          probability_weight: 1,
          min_quantity: 1,
          max_quantity: 1,
          is_active: true
        });

      if (error) throw error;

      toast.success('Item adicionado à raspadinha');
      await loadConfiguredItems();
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      toast.error('Erro ao adicionar item');
    }
  };

  // Atualizar configuração do item
  const updateItemConfig = async (configId: string, field: string, value: any) => {
    try {
      const { error } = await supabase
        .from('scratch_card_probabilities')
        .update({ [field]: value })
        .eq('id', configId);

      if (error) throw error;

      // Atualizar estado local
      setConfiguredItems(prev => prev.map(config => 
        config.id === configId ? { ...config, [field]: value } : config
      ));

      toast.success('Configuração atualizada');
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      toast.error('Erro ao atualizar configuração');
    }
  };

  // Remover item da raspadinha
  const removeItemFromScratch = async (configId: string) => {
    try {
      const { error } = await supabase
        .from('scratch_card_probabilities')
        .delete()
        .eq('id', configId);

      if (error) throw error;

      toast.success('Item removido da raspadinha');
      await loadConfiguredItems();
    } catch (error) {
      console.error('Erro ao remover item:', error);
      toast.error('Erro ao remover item');
    }
  };

  // Filtrar itens disponíveis
  const availableItems = items.filter(item => {
    // Não mostrar itens já configurados
    const isConfigured = configuredItems.some(config => config.item_id === item.id);
    if (isConfigured) return false;

    // Filtros de busca
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesRarity = rarityFilter === 'all' || item.rarity === rarityFilter;

    return matchesSearch && matchesCategory && matchesRarity;
  });

  // Estatísticas
  const totalWeight = configuredItems.reduce((sum, config) => sum + config.probability_weight, 0);
  const activeItems = configuredItems.filter(config => config.is_active).length;

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      rare: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200',
      epic: 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200',
      legendary: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200'
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      dinheiro: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200',
      money: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200',
      product: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200',
      electronics: 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200',
      gift: 'bg-pink-100 text-pink-800 dark:bg-pink-800 dark:text-pink-200'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  };

  useEffect(() => {
    loadScratchTypes();
  }, []);

  useEffect(() => {
    if (selectedScratchType) {
      loadConfiguredItems();
    }
    setLoading(false);
  }, [selectedScratchType]);

  if (loading && scratchTypes.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com seletor de raspadinha */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Gestão de Itens por Raspadinha
            </CardTitle>
            <div className="flex items-center gap-3">
              <Select value={selectedScratchType} onValueChange={setSelectedScratchType}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Selecione uma raspadinha" />
                </SelectTrigger>
                <SelectContent>
                  {scratchTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" asChild>
                <a href="/admin?tab=items">
                  <Link className="h-4 w-4 mr-2" />
                  Ver Catálogo Completo
                </a>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {selectedScratchType && (
        <>
          {/* Layout principal com dois painéis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Painel esquerdo - Catálogo de itens */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Catálogo de Itens</CardTitle>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Buscar itens..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="product">Produto</SelectItem>
                      <SelectItem value="electronics">Eletrônicos</SelectItem>
                      <SelectItem value="gift">Presentes</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={rarityFilter} onValueChange={setRarityFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="common">Comum</SelectItem>
                      <SelectItem value="rare">Raro</SelectItem>
                      <SelectItem value="epic">Épico</SelectItem>
                      <SelectItem value="legendary">Lendário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {availableItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        {item.image_url && (
                          <img 
                            src={item.image_url} 
                            alt={item.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className={getCategoryColor(item.category)}>
                              {item.category}
                            </Badge>
                            <Badge className={getRarityColor(item.rarity)}>
                              {item.rarity}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              R$ {item.base_value.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => addItemToScratch(item.id)}
                        className="gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        Adicionar
                      </Button>
                    </div>
                  ))}
                  {availableItems.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Nenhum item disponível</p>
                      <p className="text-sm">Todos os itens já foram adicionados ou não há itens que correspondam aos filtros</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Painel direito - Itens configurados */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Itens Configurados</CardTitle>
                <div className="text-sm text-muted-foreground">
                  {configuredItems.length} itens • {activeItems} ativos
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {configuredItems.map(config => (
                    <div key={config.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {config.item?.image_url && (
                            <img 
                              src={config.item.image_url} 
                              alt={config.item.name}
                              className="w-8 h-8 rounded object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium text-sm">{config.item?.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className={getCategoryColor(config.item?.category || '')}>
                                {config.item?.category}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                R$ {config.item?.base_value.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={config.is_active}
                            onCheckedChange={(checked) => updateItemConfig(config.id, 'is_active', checked)}
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeItemFromScratch(config.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-xs text-muted-foreground">Peso</label>
                          <Input
                            type="number"
                            step="0.1"
                            value={config.probability_weight}
                            onChange={(e) => updateItemConfig(config.id, 'probability_weight', parseFloat(e.target.value) || 0)}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Min</label>
                          <Input
                            type="number"
                            value={config.min_quantity}
                            onChange={(e) => updateItemConfig(config.id, 'min_quantity', parseInt(e.target.value) || 0)}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Max</label>
                          <Input
                            type="number"
                            value={config.max_quantity}
                            onChange={(e) => updateItemConfig(config.id, 'max_quantity', parseInt(e.target.value) || 0)}
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>
                      
                      {totalWeight > 0 && (
                        <div className="text-xs text-muted-foreground">
                          Probabilidade: {((config.probability_weight / totalWeight) * 100).toFixed(2)}%
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {configuredItems.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Settings2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Nenhum item configurado</p>
                      <p className="text-sm">Adicione itens do catálogo para configurar esta raspadinha</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rodapé com estatísticas */}
          {configuredItems.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span>Total de itens: <strong>{configuredItems.length}</strong></span>
                    </div>
                    <div>
                      <span>Itens ativos: <strong>{activeItems}</strong></span>
                    </div>
                    <div>
                      <span>Peso total: <strong>{totalWeight.toFixed(1)}</strong></span>
                    </div>
                  </div>
                  <div className="text-muted-foreground">
                    Raspadinha: <strong>{selectedScratchType}</strong>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};