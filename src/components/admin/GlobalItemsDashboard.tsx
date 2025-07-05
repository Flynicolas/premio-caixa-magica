
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useRealtimeItems } from '@/hooks/useRealtimeItems';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseItem } from '@/types/database';
import { 
  Crown, 
  Diamond, 
  Star, 
  Sparkles, 
  TrendingUp,
  Package,
  Target,
  Zap,
  Image as ImageIcon
} from 'lucide-react';

const GlobalItemsDashboard = () => {
  const { items, loading, updateItemRealtime } = useRealtimeItems();
  const { toast } = useToast();
  const [selectedChest, setSelectedChest] = useState<string>('');
  const [releaseItemId, setReleaseItemId] = useState<string>('');
  const [showReleaseModal, setShowReleaseModal] = useState(false);

  // Estatísticas globais
  const globalStats = useMemo(() => {
    const rarityStats = items.reduce((acc, item) => {
      acc[item.rarity] = (acc[item.rarity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalValue = items.reduce((sum, item) => sum + Number(item.base_value), 0);
    const avgValue = items.length > 0 ? totalValue / items.length : 0;

    const mostExpensive = items.length > 0 ? items.reduce((max, item) => 
      Number(item.base_value) > Number(max.base_value || 0) ? item : max
    ) : null;

    const rareItems = items.filter(item => ['epic', 'legendary'].includes(item.rarity));
    const missingImages = items.filter(item => !item.image_url).length;

    return {
      total: items.length,
      rarityStats,
      totalValue,
      avgValue,
      mostExpensive,
      rareItems: rareItems.length,
      missingImages
    };
  }, [items]);

  const rarityColors = {
    common: { bg: 'bg-gray-100', text: 'text-gray-800', icon: Package },
    rare: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Star },
    epic: { bg: 'bg-purple-100', text: 'text-purple-800', icon: Diamond },
    legendary: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Crown }
  };

  const chestTypes = ['silver', 'gold', 'delas', 'diamond', 'ruby', 'premium'];

  // Liberar item único para baú específico
  const releaseItemToChest = async () => {
    if (!releaseItemId || !selectedChest) {
      toast({
        title: "Erro",
        description: "Selecione um item e um tipo de baú",
        variant: "destructive"
      });
      return;
    }

    try {
      // Adicionar item às probabilidades do baú com peso especial
      const { error } = await supabase
        .from('chest_item_probabilities')
        .insert({
          chest_type: selectedChest,
          item_id: releaseItemId,
          probability_weight: 1000, // Peso alto para garantir que seja sorteado
          min_quantity: 1,
          max_quantity: 1,
          is_active: true
        });

      if (error) throw error;

      const selectedItem = items.find(item => item.id === releaseItemId);
      
      toast({
        title: "Item liberado!",
        description: `${selectedItem?.name} foi liberado no baú ${selectedChest}`,
      });

      setShowReleaseModal(false);
      setReleaseItemId('');
      setSelectedChest('');
    } catch (error: any) {
      console.error('Erro ao liberar item:', error);
      toast({
        title: "Erro ao liberar item",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Atualização rápida de imagem
  const quickUpdateImage = async (itemId: string, imageUrl: string) => {
    const result = await updateItemRealtime(itemId, { image_url: imageUrl });
    if (result.success) {
      toast({
        title: "Imagem atualizada!",
        description: "A imagem foi atualizada em tempo real",
      });
    }
  };

  // Atualização rápida de raridade
  const quickUpdateRarity = async (itemId: string, rarity: string) => {
    const result = await updateItemRealtime(itemId, { rarity: rarity as any });
    if (result.success) {
      toast({
        title: "Raridade atualizada!",
        description: "A raridade foi atualizada em tempo real",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Carregando dashboard global...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas Globais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Itens</p>
                <p className="text-2xl font-bold">{globalStats.total}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold">R$ {globalStats.totalValue.toFixed(2)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Itens Raros+</p>
                <p className="text-2xl font-bold">{globalStats.rareItems}</p>
              </div>
              <Sparkles className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sem Imagem</p>
                <p className="text-2xl font-bold text-red-600">{globalStats.missingImages}</p>
              </div>
              <ImageIcon className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição por Raridade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Distribuição por Raridade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(globalStats.rarityStats).map(([rarity, count]) => {
              const config = rarityColors[rarity as keyof typeof rarityColors];
              const IconComponent = config?.icon || Package;
              
              return (
                <div key={rarity} className={`p-4 rounded-lg ${config?.bg || 'bg-gray-100'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${config?.text || 'text-gray-800'}`}>
                        {rarity.toUpperCase()}
                      </p>
                      <p className={`text-xl font-bold ${config?.text || 'text-gray-800'}`}>
                        {count}
                      </p>
                    </div>
                    <IconComponent className={`w-6 h-6 ${config?.text?.replace('text-', 'text-') || 'text-gray-600'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Item Mais Caro */}
      {globalStats.mostExpensive && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              Item Mais Valioso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              {globalStats.mostExpensive.image_url && (
                <img
                  src={globalStats.mostExpensive.image_url}
                  alt={globalStats.mostExpensive.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{globalStats.mostExpensive.name}</h3>
                <p className="text-2xl font-bold text-green-600">
                  R$ {Number(globalStats.mostExpensive.base_value).toFixed(2)}
                </p>
                <Badge className={rarityColors[globalStats.mostExpensive.rarity]?.bg}>
                  {globalStats.mostExpensive.rarity}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sistema de Liberação de Item */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-500" />
              Sistema de Liberação Única
            </span>
            <Dialog open={showReleaseModal} onOpenChange={setShowReleaseModal}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                  <Zap className="w-4 h-4 mr-2" />
                  Liberar Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Liberar Item para Baú Específico</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Selecionar Item:</label>
                    <Select value={releaseItemId} onValueChange={setReleaseItemId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha um item..." />
                      </SelectTrigger>
                      <SelectContent>
                        {items.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name} - R$ {Number(item.base_value).toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Tipo de Baú:</label>
                    <Select value={selectedChest} onValueChange={setSelectedChest}>
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha um baú..." />
                      </SelectTrigger>
                      <SelectContent>
                        {chestTypes.map((chest) => (
                          <SelectItem key={chest} value={chest}>
                            Baú {chest.charAt(0).toUpperCase() + chest.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-700">
                      💡 <strong>Como funciona:</strong> O item será adicionado com alta probabilidade 
                      no baú selecionado para ser sorteado na próxima abertura, sem afetar as 
                      probabilidades dos outros itens.
                    </p>
                  </div>
                  
                  <Button 
                    onClick={releaseItemToChest} 
                    className="w-full"
                    disabled={!releaseItemId || !selectedChest}
                  >
                    Confirmar Liberação
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Use esta funcionalidade para liberar um item específico que será sorteado 
            na próxima abertura do baú escolhido, sem alterar as probabilidades dos demais itens.
          </p>
        </CardContent>
      </Card>

      {/* Lista de Itens com Edição Rápida */}
      <Card>
        <CardHeader>
          <CardTitle>Itens - Edição em Tempo Real</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {items.slice(0, 10).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      R$ {Number(item.base_value).toFixed(2)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge className={rarityColors[item.rarity]?.bg}>
                    {item.rarity}
                  </Badge>
                  
                  <Input
                    placeholder="URL da imagem..."
                    className="w-48 h-8"
                    onBlur={(e) => {
                      if (e.target.value && e.target.value !== item.image_url) {
                        quickUpdateImage(item.id, e.target.value);
                      }
                    }}
                  />
                  
                  <Select
                    value={item.rarity}
                    onValueChange={(value) => quickUpdateRarity(item.id, value)}
                  >
                    <SelectTrigger className="w-32 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="common">Common</SelectItem>
                      <SelectItem value="rare">Rare</SelectItem>
                      <SelectItem value="epic">Epic</SelectItem>
                      <SelectItem value="legendary">Legendary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GlobalItemsDashboard;
