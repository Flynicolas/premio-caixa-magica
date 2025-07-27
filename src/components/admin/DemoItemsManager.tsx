import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TestTube, Package, Settings, Crown } from 'lucide-react';
import DemoSettingsPanel from './DemoSettingsPanel';
import DemoProbabilityManager from './demo/DemoProbabilityManager';

interface DatabaseItem {
  id: string;
  name: string;
  image_url: string | null;
  rarity: string;
  base_value: number;
  chest_types: string[];
  is_active: boolean;
}

const DemoItemsManager = () => {
  const [items, setItems] = useState<DatabaseItem[]>([]);
  const [demoSettings, setDemoSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const chestTypes = [
    { key: 'basic', name: 'Básico', color: 'bg-gray-500' },
    { key: 'silver', name: 'Prata', color: 'bg-slate-400' },
    { key: 'gold', name: 'Ouro', color: 'bg-yellow-500' },
    { key: 'diamond', name: 'Diamante', color: 'bg-blue-500' }
  ];

  const rarityColors = {
    common: 'bg-gray-500',
    uncommon: 'bg-green-500',
    rare: 'bg-blue-500',
    epic: 'bg-purple-500',
    legendary: 'bg-orange-500'
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Buscar itens ativos
      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (itemsError) throw itemsError;

      // Buscar configurações demo
      const { data: settingsData, error: settingsError } = await supabase
        .from('demo_settings')
        .select('*')
        .limit(1)
        .single();

      if (settingsError) throw settingsError;

      setItems(itemsData || []);
      setDemoSettings(settingsData);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getItemsByChestType = (chestType: string) => {
    return items.filter(item => 
      item.chest_types && item.chest_types.includes(chestType)
    );
  };

  const getRarityName = (rarity: string) => {
    const rarityMap: Record<string, string> = {
      common: 'Comum',
      uncommon: 'Incomum',
      rare: 'Raro',
      epic: 'Épico',
      legendary: 'Lendário'
    };
    return rarityMap[rarity] || rarity;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Gerenciamento Demo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Carregando dados...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Gerenciamento Demo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="probabilities" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="probabilities" className="flex items-center gap-2">
                <Crown className="w-4 h-4" />
                Probabilidades
              </TabsTrigger>
              <TabsTrigger value="items" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Itens por Baú
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Configurações
              </TabsTrigger>
            </TabsList>

            <TabsContent value="probabilities">
              <DemoProbabilityManager />
            </TabsContent>

            <TabsContent value="items" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {chestTypes.map(chest => {
                  const chestItems = getItemsByChestType(chest.key);
                  
                  return (
                    <Card key={chest.key}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded ${chest.color}`}></div>
                            Baú {chest.name}
                          </span>
                          <Badge variant="outline">{chestItems.length} itens</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {chestItems.length === 0 ? (
                            <p className="text-muted-foreground text-center py-4">
                              Nenhum item configurado para este baú
                            </p>
                          ) : (
                            chestItems.map(item => (
                              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                  <img 
                                    src={item.image_url || '/placeholder.svg'} 
                                    alt={item.name}
                                    className="w-10 h-10 object-cover rounded"
                                  />
                                  <div>
                                    <p className="font-medium text-sm">{item.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      R$ {item.base_value.toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                                <Badge 
                                  className={`text-white ${rarityColors[item.rarity as keyof typeof rarityColors] || 'bg-gray-500'}`}
                                >
                                  {getRarityName(item.rarity)}
                                </Badge>
                              </div>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Probabilidade Demo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {chestTypes.map(chest => {
                      const config = demoSettings?.probabilidades_chest?.[chest.key];
                      return (
                        <div key={chest.key} className="p-4 border rounded-lg">
                          <h3 className="font-medium mb-2">{chest.name}</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Taxa de Vitória:</span>
                              <Badge variant="outline">
                                {((config?.win_rate || 0.8) * 100).toFixed(0)}%
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Taxa de Raros:</span>
                              <Badge variant="outline">
                                {((config?.rare_rate || 0.3) * 100).toFixed(0)}%
                              </Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <DemoSettingsPanel />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DemoItemsManager;