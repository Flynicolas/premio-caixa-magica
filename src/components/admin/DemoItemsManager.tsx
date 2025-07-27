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
    { key: 'silver', name: 'Prata', color: 'bg-slate-400' },
    { key: 'gold', name: 'Ouro', color: 'bg-yellow-500' },
    { key: 'delas', name: 'Delas', color: 'bg-pink-500' },
    { key: 'diamond', name: 'Diamante', color: 'bg-blue-500' },
    { key: 'ruby', name: 'Rubi', color: 'bg-red-500' },
    { key: 'premium', name: 'Premium', color: 'bg-purple-600' }
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
          <DemoProbabilityManager />

        </CardContent>
      </Card>
    </div>
  );
};

export default DemoItemsManager;