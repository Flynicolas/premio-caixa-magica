import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useRTPControl } from '@/hooks/useRTPControl';
import { useItemManagement } from '@/hooks/useItemManagement';
import { 
  Brain, 
  Users, 
  Target, 
  TrendingUp, 
  Clock, 
  Gift,
  Zap,
  BarChart3,
  Settings2,
  Calendar
} from 'lucide-react';

const IntelligentManagement = () => {
  const { rtpSettings, rtpMetrics, loading } = useRTPControl();
  const { items, stats } = useItemManagement();
  const [selectedScratchType, setSelectedScratchType] = useState<string>('');
  const [probabilities, setProbabilities] = useState<Record<string, number>>({});

  // Simulação de dados de comportamento (seria vindo do backend)
  const behaviorData = [
    { userId: '1', username: 'user1', totalGames: 45, totalSpent: 225.00, avgRtp: 48.5, lastActive: '2024-08-24' },
    { userId: '2', username: 'user2', totalGames: 32, totalSpent: 160.00, avgRtp: 52.1, lastActive: '2024-08-24' },
    { userId: '3', username: 'user3', totalGames: 28, totalSpent: 140.00, avgRtp: 45.8, lastActive: '2024-08-23' },
  ];

  // Simulação de log de decisões
  const systemDecisions = [
    { timestamp: '2024-08-24 10:30:15', scratchType: 'premium', action: 'RTP Adjusted', details: 'Increased to 55% due to low win rate', impact: 'Positive' },
    { timestamp: '2024-08-24 10:15:32', scratchType: 'basic', action: 'Prize Released', details: 'Manual release triggered for balance', impact: 'Neutral' },
    { timestamp: '2024-08-24 09:45:21', scratchType: 'vip', action: 'RTP Alert', details: 'Current RTP 68% above target 50%', impact: 'Warning' },
  ];

  const handleProbabilityUpdate = (itemId: string, probability: number) => {
    setProbabilities(prev => ({
      ...prev,
      [itemId]: probability
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6" />
            Gestão Inteligente
          </h2>
          <p className="text-muted-foreground">Sistema avançado com IA para otimização automática</p>
        </div>
      </div>

      <Tabs defaultValue="behavior" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="behavior">Análise Comportamental</TabsTrigger>
          <TabsTrigger value="decisions">Decisões do Sistema</TabsTrigger>
          <TabsTrigger value="probabilities">Gestão de Probabilidades</TabsTrigger>
          <TabsTrigger value="scheduled">Prêmios Programados</TabsTrigger>
        </TabsList>

        {/* Análise Comportamental */}
        <TabsContent value="behavior" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4" />
                  Usuários Ativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{behaviorData.length}</div>
                <div className="text-xs text-muted-foreground">nas últimas 24h</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <BarChart3 className="h-4 w-4" />
                  Padrão de Jogo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(behaviorData.reduce((sum, u) => sum + u.totalGames, 0) / behaviorData.length).toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">jogos por usuário</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Target className="h-4 w-4" />
                  RTP Médio Real
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(behaviorData.reduce((sum, u) => sum + u.avgRtp, 0) / behaviorData.length).toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">experiência do usuário</div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Top Usuários */}
          <Card>
            <CardHeader>
              <CardTitle>Top Usuários - Análise Detalhada</CardTitle>
              <CardDescription>Comportamento dos usuários mais ativos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {behaviorData.map((user) => (
                  <div key={user.userId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="font-medium">{user.username}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.totalGames} jogos • R$ {user.totalSpent.toFixed(2)} gastos
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={user.avgRtp > 50 ? "destructive" : "default"}>
                        RTP: {user.avgRtp.toFixed(1)}%
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        {user.lastActive}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Decisões do Sistema */}
        <TabsContent value="decisions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Log de Decisões em Tempo Real
              </CardTitle>
              <CardDescription>
                Acompanhe as decisões automáticas do sistema RTP
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemDecisions.map((decision, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full mt-2 ${
                        decision.impact === 'Positive' ? 'bg-green-500' :
                        decision.impact === 'Warning' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{decision.action}</div>
                        <Badge variant="outline">{decision.scratchType}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-1">
                        {decision.details}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {decision.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gestão de Probabilidades */}
        <TabsContent value="probabilities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                Ajuste de Probabilidades por Tipo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="scratch-select">Selecionar Tipo de Raspadinha</Label>
                <select 
                  id="scratch-select"
                  className="w-full p-2 border rounded-md mt-1"
                  value={selectedScratchType}
                  onChange={(e) => setSelectedScratchType(e.target.value)}
                >
                  <option value="">Escolha um tipo</option>
                  {rtpSettings.map((setting) => (
                    <option key={setting.scratch_type} value={setting.scratch_type}>
                      {setting.scratch_type} - R$ {setting.price.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              {selectedScratchType && (
                <div className="space-y-4">
                  <div className="text-lg font-semibold">
                    Itens para {selectedScratchType}
                  </div>
                  {items
                    .filter(item => item.chest_types?.includes(selectedScratchType))
                    .map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          {item.image_url && (
                            <img src={item.image_url} alt={item.name} className="w-12 h-12 object-cover rounded" />
                          )}
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-muted-foreground">
                              R$ {item.base_value?.toFixed(2) || '0.00'} • {item.rarity}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 min-w-[200px]">
                          <div className="flex-1">
                            <Label className="text-xs">Probabilidade (%)</Label>
                            <Slider
                              value={[probabilities[item.id] || item.probability_weight || 10]}
                              onValueChange={(value) => handleProbabilityUpdate(item.id, value[0])}
                              max={100}
                              step={1}
                              className="mt-1"
                            />
                          </div>
                          <div className="text-sm font-medium min-w-[40px]">
                            {(probabilities[item.id] || item.probability_weight || 10).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  
                  <Button className="w-full">
                    Salvar Probabilidades
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prêmios Programados */}
        <TabsContent value="scheduled" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Fila de Prêmios Programados
              </CardTitle>
              <CardDescription>
                Agende prêmios específicos para momentos estratégicos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="prize-type">Tipo de Prêmio</Label>
                  <select id="prize-type" className="w-full p-2 border rounded-md mt-1">
                    <option>Dinheiro</option>
                    <option>Item Premium</option>
                    <option>Item Comum</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="prize-value">Valor (R$)</Label>
                  <Input id="prize-value" type="number" placeholder="0.00" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="schedule-time">Agendar Para</Label>
                  <Input id="schedule-time" type="datetime-local" className="mt-1" />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="auto-trigger" />
                <Label htmlFor="auto-trigger">Liberar automaticamente quando RTP estiver baixo</Label>
              </div>

              <Button className="w-full">
                <Gift className="mr-2 h-4 w-4" />
                Agendar Prêmio
              </Button>

              {/* Lista vazia por enquanto */}
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum prêmio agendado</p>
                <p className="text-sm">Crie agendamentos para otimizar a experiência dos usuários</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntelligentManagement;