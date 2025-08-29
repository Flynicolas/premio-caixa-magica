import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseItem, ChestItemProbability } from '@/types/database';
import { 
  Crown, Archive, Search, Settings, Trash2, Gift, Eye, Plus, 
  TrendingUp, Package, Coins, Filter, RefreshCw, Edit, Copy, MoreHorizontal,
  Maximize2, Minimize2
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ManualReleaseDialog from '../ManualReleaseDialog';
import CompactManualReleaseHistory from './CompactManualReleaseHistory';
import ItemSelectorDialog from './ItemSelectorDialog';
import ChestManagerToolbar from './ChestManagerToolbar';
import EnhancedItemEditDialog from '../EnhancedItemEditDialog';

interface CompactChestManagerProps {
  items: DatabaseItem[];
  onRefresh: () => void;
}

const CHEST_TYPES = [
  { value: 'silver', label: 'Prata', color: 'hsl(var(--muted-foreground))', bgColor: 'hsl(var(--muted))' },
  { value: 'gold', label: 'Ouro', color: 'hsl(45 93% 47%)', bgColor: 'hsl(45 93% 95%)' },
  { value: 'delas', label: 'Delas', color: 'hsl(142 76% 36%)', bgColor: 'hsl(142 76% 95%)' },
  { value: 'diamond', label: 'Diamante', color: 'hsl(221 83% 53%)', bgColor: 'hsl(221 83% 95%)' },
  { value: 'ruby', label: 'Ruby', color: 'hsl(0 84% 60%)', bgColor: 'hsl(0 84% 95%)' },
  { value: 'premium', label: 'Premium', color: 'hsl(271 91% 65%)', bgColor: 'hsl(271 91% 95%)' }
];

const CompactChestManager = ({ items, onRefresh }: CompactChestManagerProps) => {
  const [probabilities, setProbabilities] = useState<Record<string, ChestItemProbability[]>>({});
  const [editingValues, setEditingValues] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChest, setSelectedChest] = useState<string>('all');
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  const [isCompactView, setIsCompactView] = useState(true);
  const [densityMode, setDensityMode] = useState<'compact' | 'normal' | 'expanded'>('compact');
  const [showNavSidebar, setShowNavSidebar] = useState(true);
  const [manualReleaseDialog, setManualReleaseDialog] = useState<{
    isOpen: boolean;
    probabilityId: string;
    itemName: string;
    chestType: string;
  }>({
    isOpen: false,
    probabilityId: '',
    itemName: '',
    chestType: ''
  });
  const [itemSelectorDialog, setItemSelectorDialog] = useState<{
    isOpen: boolean;
    chestType: string;
    chestName: string;
  }>({
    isOpen: false,
    chestType: '',
    chestName: ''
  });
  const [itemEditDialog, setItemEditDialog] = useState<{
    isOpen: boolean;
    item: DatabaseItem | null;
  }>({
    isOpen: false,
    item: null
  });
  
  const { toast } = useToast();

  useEffect(() => {
    fetchProbabilities();
    
    const channel = supabase
      .channel('compact-chest-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'chest_item_probabilities' },
        () => fetchProbabilities()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchProbabilities = async () => {
    try {
      const { data, error } = await supabase
        .from('chest_item_probabilities')
        .select(`
          *,
          item:items(*)
        `)
        .eq('is_active', true)
        .order('chest_type')
        .order('probability_weight', { ascending: false });

      if (error) throw error;

      const grouped = (data || []).reduce((acc, prob) => {
        const typedProb: ChestItemProbability = {
          ...prob,
          chest_type: prob.chest_type as 'silver' | 'gold' | 'delas' | 'diamond' | 'ruby' | 'premium',
          item: prob.item ? {
            ...prob.item,
            rarity: prob.item.rarity as 'common' | 'rare' | 'epic' | 'legendary',
            delivery_type: prob.item.delivery_type as 'digital' | 'physical'
          } : undefined
        };

        if (!acc[typedProb.chest_type]) {
          acc[typedProb.chest_type] = [];
        }
        acc[typedProb.chest_type].push(typedProb);
        return acc;
      }, {} as Record<string, ChestItemProbability[]>);

      setProbabilities(grouped);
    } catch (error: any) {
      console.error('Erro ao buscar probabilidades:', error);
      toast({
        title: "Erro ao carregar probabilidades",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleProbabilityUpdate = async (probId: string, newWeight: number) => {
    try {
      const { error } = await supabase
        .from('chest_item_probabilities')
        .update({ probability_weight: newWeight })
        .eq('id', probId);

      if (error) throw error;

      toast({
        title: "Peso atualizado!",
        description: newWeight === 0 ? "Item removido do sorteio (apenas liberação manual)" : "Peso da probabilidade atualizado",
      });

      fetchProbabilities();
      onRefresh();
    } catch (error: any) {
      console.error('Erro ao atualizar peso:', error);
      toast({
        title: "Erro ao atualizar peso",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const removeItemFromChest = async (probabilityId: string) => {
    if (!confirm('Tem certeza que deseja remover este item do baú?')) return;

    try {
      const { error } = await supabase
        .from('chest_item_probabilities')
        .update({ is_active: false })
        .eq('id', probabilityId);

      if (error) throw error;

      toast({
        title: "Item removido!",
        description: "Item removido do baú com sucesso",
      });

      fetchProbabilities();
      onRefresh();
    } catch (error: any) {
      console.error('Erro ao remover item:', error);
      toast({
        title: "Erro ao remover item",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const addItemToChest = async (itemId: string, chestType: string) => {
    try {
      const { error } = await supabase
        .from('chest_item_probabilities')
        .insert([{
          chest_type: chestType,
          item_id: itemId,
          probability_weight: 1,
          min_quantity: 1,
          max_quantity: 1,
          is_active: true
        }]);

      if (error) throw error;

      toast({
        title: "Item adicionado!",
        description: "Item adicionado ao baú com sucesso",
      });

      fetchProbabilities();
      onRefresh();
    } catch (error: any) {
      console.error('Erro ao adicionar item:', error);
      toast({
        title: "Erro ao adicionar item",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleEditItem = (item: DatabaseItem) => {
    setItemEditDialog({
      isOpen: true,
      item
    });
  };

  const handleSaveItem = async (itemData: Partial<DatabaseItem>) => {
    try {
      const { error } = await supabase
        .from('items')
        .update(itemData)
        .eq('id', itemEditDialog.item?.id);

      if (error) throw error;

      toast({
        title: "Item atualizado!",
        description: "Item atualizado com sucesso",
      });

      setItemEditDialog({ isOpen: false, item: null });
      fetchProbabilities();
      onRefresh();
    } catch (error: any) {
      console.error('Erro ao atualizar item:', error);
      toast({
        title: "Erro ao atualizar item",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleCreateItem = async (itemData: Partial<DatabaseItem>) => {
    try {
      const { data, error } = await supabase
        .from('items')
        .insert(itemData as any)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Item criado!",
        description: "Item criado com sucesso",
      });

      setItemEditDialog({ isOpen: false, item: null });
      fetchProbabilities();
      onRefresh();
    } catch (error: any) {
      console.error('Erro ao criar item:', error);
      toast({
        title: "Erro ao criar item",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getAvailableItemsForChest = (chestType: string) => {
    const chestItems = probabilities[chestType] || [];
    const usedItemIds = chestItems.map(p => p.item_id);
    return items.filter(item => item.is_active && !usedItemIds.includes(item.id));
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'hsl(45 93% 47%)';
      case 'epic': return 'hsl(271 91% 65%)';
      case 'rare': return 'hsl(221 83% 53%)';
      default: return 'hsl(var(--muted-foreground))';
    }
  };

  // Statistics
  const stats = React.useMemo(() => {
    const allProbs = Object.values(probabilities).flat();
    const totalItems = allProbs.length;
    const totalValue = allProbs.reduce((sum, prob) => sum + (prob.item?.base_value || 0), 0);
    
    const chestStats = CHEST_TYPES.map(chest => {
      const chestProbs = probabilities[chest.value] || [];
      return {
        type: chest.value,
        label: chest.label,
        count: chestProbs.length,
        value: chestProbs.reduce((sum, prob) => sum + (prob.item?.base_value || 0), 0)
      };
    });

    return { totalItems, totalValue, chestStats };
  }, [probabilities]);

  // Filtered data
  const filteredProbabilities = Object.entries(probabilities).reduce((acc, [chestType, probs]) => {
    if (selectedChest !== 'all' && chestType !== selectedChest) return acc;
    
    const filtered = probs.filter(prob => {
      if (!prob.item) return false;
      
      const matchesSearch = searchTerm === '' || 
        prob.item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prob.item.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRarity = rarityFilter === 'all' || prob.item.rarity === rarityFilter;
      
      return matchesSearch && matchesRarity;
    });
    
    if (filtered.length > 0) {
      acc[chestType] = filtered;
    }
    
    return acc;
  }, {} as Record<string, ChestItemProbability[]>);

  // Create flat list with chest info for better density
  const flatProbabilities = Object.entries(filteredProbabilities).flatMap(([chestType, probs], chestIndex) =>
    probs.map((prob, itemIndex) => ({
      ...prob,
      chestType,
      chestInfo: CHEST_TYPES.find(c => c.value === chestType),
      chestIndex,
      itemIndex,
      isFirstInChest: itemIndex === 0
    }))
  );

  const getRowColorClass = (chestIndex: number) => {
    return chestIndex % 2 === 0 ? 'bg-background' : 'bg-muted/20';
  };

  const scrollToChest = (chestType: string) => {
    const element = document.getElementById(`chest-${chestType}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="w-5 h-5" />
            Gerenciamento de Baús e Itens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChestManagerToolbar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedChest={selectedChest}
            setSelectedChest={setSelectedChest}
            rarityFilter={rarityFilter}
            setRarityFilter={setRarityFilter}
            isCompactView={isCompactView}
            setIsCompactView={setIsCompactView}
            densityMode={densityMode}
            setDensityMode={setDensityMode}
            onNewItem={() => setItemEditDialog({ isOpen: true, item: null })}
            onRefresh={() => {
              fetchProbabilities();
              onRefresh();
            }}
            stats={stats}
          />

          {/* Quick Navigation Bar */}
          <div className="flex flex-wrap items-center gap-2 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Navegação rápida:</span>
            </div>
            {CHEST_TYPES.map(chest => {
              const chestProbs = filteredProbabilities[chest.value];
              if (!chestProbs || chestProbs.length === 0) return null;
              
              return (
                <Button
                  key={chest.value}
                  variant="outline"
                  size="sm"
                  onClick={() => scrollToChest(chest.value)}
                  className="flex items-center gap-2 h-8"
                  style={{ 
                    borderColor: chest.color,
                    color: chest.color
                  }}
                >
                  <Badge 
                    className="w-3 h-3 p-0 rounded-full"
                    style={{ backgroundColor: chest.color }}
                  />
                  {chest.label} ({chestProbs.length})
                </Button>
              );
            })}
          </div>

          <Tabs defaultValue="table" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="table">Tabela Otimizada</TabsTrigger>
              <TabsTrigger value="history">Histórico Liberações</TabsTrigger>
            </TabsList>
            
            <TabsContent value="table" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead className="w-24">Baú</TableHead>
                      <TableHead>Item</TableHead>
                      {!isCompactView && <TableHead>Categoria</TableHead>}
                      <TableHead className="w-20">Raridade</TableHead>
                      <TableHead className="w-24">Valor</TableHead>
                      <TableHead className="w-16">Peso</TableHead>
                      <TableHead className="w-16">%</TableHead>
                      <TableHead className="w-32">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {flatProbabilities.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={isCompactView ? 7 : 8}>
                          <div className="text-center py-8">
                            <div className="flex flex-col items-center gap-4 text-muted-foreground">
                              <Package className="w-12 h-12" />
                              <div>
                                <h3 className="text-lg font-medium">Nenhum item encontrado</h3>
                                <p className="text-sm">Ajuste os filtros ou adicione itens aos baús</p>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  onClick={() => setItemEditDialog({ isOpen: true, item: null })}
                                  className="flex items-center gap-2"
                                >
                                  <Plus className="w-4 h-4" />
                                  Criar Item
                                </Button>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      flatProbabilities.map((prob) => {
                        const totalWeight = probabilities[prob.chestType]?.reduce((sum, p) => sum + p.probability_weight, 0) || 1;
                        const percentage = ((prob.probability_weight / totalWeight) * 100).toFixed(1);
                        
                        return (
                          <TableRow 
                            key={prob.id}
                            id={prob.isFirstInChest ? `chest-${prob.chestType}` : undefined}
                            className={`${getRowColorClass(prob.chestIndex)} hover:bg-muted/40 transition-colors ${
                              densityMode === 'compact' ? 'h-12' : densityMode === 'normal' ? 'h-16' : 'h-20'
                            }`}
                          >
                            <TableCell className="p-2">
                              <div className="flex items-center gap-2">
                                {prob.isFirstInChest && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setItemSelectorDialog({
                                      isOpen: true,
                                      chestType: prob.chestType,
                                      chestName: prob.chestInfo?.label || prob.chestType
                                    })}
                                    className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                )}
                                <Badge 
                                  className="text-xs px-2 py-1 font-medium"
                                  style={{ 
                                    backgroundColor: prob.chestInfo?.color,
                                    color: 'white'
                                  }}
                                >
                                  {prob.chestInfo?.label}
                                </Badge>
                              </div>
                            </TableCell>
                            
                            <TableCell className="p-2">
                              <div className="flex items-center gap-3">
                                {prob.item?.image_url && densityMode !== 'compact' && (
                                  <img 
                                    src={prob.item.image_url} 
                                    alt={prob.item.name}
                                    className={`object-cover rounded ${
                                      densityMode === 'expanded' ? 'w-12 h-12' : 'w-8 h-8'
                                    }`}
                                  />
                                )}
                                <div className="min-w-0 flex-1">
                                  <div className="font-medium truncate">{prob.item?.name}</div>
                                  {densityMode === 'expanded' && prob.item?.description && (
                                    <div className="text-xs text-muted-foreground truncate">
                                      {prob.item.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            
                            {!isCompactView && (
                              <TableCell className="p-2">
                                <Badge variant="outline" className="text-xs">
                                  {prob.item?.category}
                                </Badge>
                              </TableCell>
                            )}
                            
                            <TableCell className="p-2">
                              <Badge 
                                className="text-xs"
                                style={{ 
                                  backgroundColor: getRarityColor(prob.item?.rarity || 'common'),
                                  color: 'white'
                                }}
                              >
                                {prob.item?.rarity}
                              </Badge>
                            </TableCell>
                            
                            <TableCell className="p-2 font-mono text-sm">
                              R$ {prob.item?.base_value?.toFixed(2)}
                            </TableCell>
                            
                            <TableCell className="p-2">
                              <Input
                                type="number"
                                value={editingValues[prob.id] ?? prob.probability_weight}
                                onChange={(e) => setEditingValues({
                                  ...editingValues,
                                  [prob.id]: parseFloat(e.target.value) || 0
                                })}
                                onBlur={() => {
                                  const newValue = editingValues[prob.id];
                                  if (newValue !== undefined && newValue !== prob.probability_weight) {
                                    handleProbabilityUpdate(prob.id, newValue);
                                  }
                                }}
                                className="w-16 h-8 text-xs text-center"
                                min="0"
                                step="0.1"
                              />
                            </TableCell>
                            
                            <TableCell className="p-2 font-mono text-xs">
                              {percentage}%
                            </TableCell>
                            
                            <TableCell className="p-2">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-background border shadow-lg">
                                  <DropdownMenuItem onClick={() => handleEditItem(prob.item!)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar Item
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => setManualReleaseDialog({
                                      isOpen: true,
                                      probabilityId: prob.id,
                                      itemName: prob.item?.name || '',
                                      chestType: prob.chestType
                                    })}
                                  >
                                    <Gift className="mr-2 h-4 w-4" />
                                    Liberar Manual
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => removeItemFromChest(prob.id)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Remover do Baú
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="history">
              <CompactManualReleaseHistory />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Manual Release Dialog */}
      <ManualReleaseDialog
        isOpen={manualReleaseDialog.isOpen}
        onClose={() => setManualReleaseDialog({
          isOpen: false,
          probabilityId: '',
          itemName: '',
          chestType: ''
        })}
        onSuccess={() => {
          fetchProbabilities();
          onRefresh();
        }}
        probabilityId={manualReleaseDialog.probabilityId}
        itemName={manualReleaseDialog.itemName}
        chestType={manualReleaseDialog.chestType}
      />

      {/* Item Selector Dialog */}
      <ItemSelectorDialog
        isOpen={itemSelectorDialog.isOpen}
        onClose={() => setItemSelectorDialog({
          isOpen: false,
          chestType: '',
          chestName: ''
        })}
        chestType={itemSelectorDialog.chestType}
        chestName={itemSelectorDialog.chestName}
        availableItems={getAvailableItemsForChest(itemSelectorDialog.chestType)}
        onAddItem={addItemToChest}
      />

      {/* Item Edit Dialog */}
      <EnhancedItemEditDialog
        item={itemEditDialog.item}
        isOpen={itemEditDialog.isOpen}
        onClose={() => setItemEditDialog({ isOpen: false, item: null })}
        onSave={itemEditDialog.item ? handleSaveItem : handleCreateItem}
      />
    </div>
  );
};

export default CompactChestManager;