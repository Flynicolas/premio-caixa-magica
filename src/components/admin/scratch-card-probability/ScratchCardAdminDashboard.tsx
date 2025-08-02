import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Settings2, BarChart3, TrendingUp, Sparkles } from 'lucide-react';
import ScratchCardProbabilityManager from './ScratchCardProbabilityManager';
import ScratchCardFinancialControl from './ScratchCardFinancialControl';
import { ScratchCard90TenControl } from './ScratchCard90TenControl';
import { ScratchCardConfigurationPanel } from './ScratchCardConfigurationPanel';
import { useScratchCardManagement } from '@/hooks/useScratchCardManagement';
import { useScratchCardAdministration } from '@/hooks/useScratchCardAdministration';
import { scratchCardTypes } from '@/types/scratchCard';

const ScratchCardAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { probabilities, loading, getTotalWeight, getProbabilitiesByType } = useScratchCardManagement();
  const { settings, loading: settingsLoading } = useScratchCardAdministration();

  // Criar stats dinâmicos baseados nos dados do banco
  const getDynamicOverviewStats = () => {
    // Combinar dados do frontend e backend
    const dynamicTypes = settings.map(setting => {
      const frontendType = Object.entries(scratchCardTypes).find(
        ([key]) => key === setting.scratch_type
      );
      
      const typeProbs = getProbabilitiesByType(setting.scratch_type);
      const totalWeight = getTotalWeight(setting.scratch_type);
      
      return {
        value: setting.scratch_type,
        label: setting.name,
        price: setting.price,
        color: frontendType ? frontendType[1].bgColor : 'bg-gray-500',
        description: frontendType ? frontendType[1].name : setting.name,
        itemCount: typeProbs.length,
        totalWeight,
        isConfigured: typeProbs.length > 0,
        isActive: setting.is_active
      };
    });

    return {
      totalTypes: dynamicTypes.length,
      configuredTypes: dynamicTypes.filter(s => s.isConfigured).length,
      totalItems: probabilities.length,
      averageItemsPerType: dynamicTypes.length > 0 ? Math.round(probabilities.length / dynamicTypes.length) : 0,
      stats: dynamicTypes
    };
  };

  const overview = getDynamicOverviewStats();

  if (loading || settingsLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando dashboard...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
            <Sparkles className="w-8 h-8" />
            Administração de Raspadinhas
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie tipos, itens, probabilidades e controle financeiro
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            {overview.configuredTypes}/{overview.totalTypes} Tipos Configurados
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="types" className="gap-2">
            <Settings2 className="w-4 h-4" />
            Tipos de Raspadinha
          </TabsTrigger>
          <TabsTrigger value="manage" className="gap-2">
            <Settings2 className="w-4 h-4" />
            Gerenciar Itens
          </TabsTrigger>
          <TabsTrigger value="financial" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Controle Financeiro
          </TabsTrigger>
          <TabsTrigger value="system-90-10" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Sistema 90/10
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings2 className="w-4 h-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          {/* Estatísticas gerais */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{overview.totalTypes}</div>
                  <div className="text-sm text-muted-foreground">Tipos de Raspadinha</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{overview.configuredTypes}</div>
                  <div className="text-sm text-muted-foreground">Tipos Configurados</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{overview.totalItems}</div>
                  <div className="text-sm text-muted-foreground">Total de Itens</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{overview.averageItemsPerType}</div>
                  <div className="text-sm text-muted-foreground">Média por Tipo</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status por tipo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {overview.stats.map((type) => (
              <Card key={type.value} className={`border-l-4 ${type.isConfigured ? 'border-l-green-500' : 'border-l-orange-500'}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${type.color}`} />
                      {type.label}
                    </div>
                    <Badge variant={type.isConfigured ? 'default' : 'secondary'}>
                      {type.isConfigured ? 'Configurado' : 'Pendente'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Preço:</span>
                      <span className="font-medium">R$ {type.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Itens configurados:</span>
                      <span className="font-medium">{type.itemCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Peso total:</span>
                      <span className="font-medium">{type.totalWeight}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {type.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tipos de Raspadinha */}
        <TabsContent value="types">
          <ScratchCardConfigurationPanel />
        </TabsContent>

        {/* Gerenciar Itens */}
        <TabsContent value="manage">
          <ScratchCardProbabilityManager />
        </TabsContent>

        {/* Controle Financeiro */}
        <TabsContent value="financial">
          <ScratchCardFinancialControl />
        </TabsContent>

        {/* Sistema 90/10 */}
        <TabsContent value="system-90-10">
          <ScratchCard90TenControl />
        </TabsContent>

        {/* Configurações */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Settings2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Configurações avançadas serão implementadas em breve</p>
                <p className="text-sm mt-2">
                  Aqui você poderá configurar tipos de raspadinha, margem da casa, 
                  probabilidades globais e outras configurações do sistema.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScratchCardAdminDashboard;