
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Save, Target, TrendingUp } from 'lucide-react';

interface ChestGoal {
  chest_type: string;
  profit_goal: number;
  current_profit: number;
  goal_reached: boolean;
}

const CHEST_TYPES = [
  { value: 'silver', label: 'Baú Prata', color: 'bg-gray-500' },
  { value: 'gold', label: 'Baú Ouro', color: 'bg-yellow-500' },
  { value: 'diamond', label: 'Baú Diamante', color: 'bg-blue-500' },
  { value: 'ruby', label: 'Baú Ruby', color: 'bg-red-500' },
  { value: 'premium', label: 'Baú Premium', color: 'bg-purple-500' },
  { value: 'delas', label: 'Baú Delas', color: 'bg-green-500' }
];

const ChestGoalsManager = () => {
  const [goals, setGoals] = useState<ChestGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('chest_profit_goals')
        .select('*')
        .order('chest_type');

      if (error) throw error;

      // Garantir que todos os tipos de baú tenham uma meta
      const goalsMap = new Map(data?.map(goal => [goal.chest_type, goal]) || []);
      
      const allGoals = CHEST_TYPES.map(chestType => 
        goalsMap.get(chestType.value) || {
          chest_type: chestType.value,
          profit_goal: 100.00,
          current_profit: 0.00,
          goal_reached: false
        }
      );

      setGoals(allGoals);
    } catch (error: any) {
      console.error('Erro ao buscar metas:', error);
      toast({
        title: "Erro ao carregar metas",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoalChange = (chestType: string, newGoal: number) => {
    setGoals(prev => prev.map(goal => 
      goal.chest_type === chestType 
        ? { ...goal, profit_goal: newGoal }
        : goal
    ));
  };

  const saveGoals = async () => {
    setSaving(true);
    try {
      const updates = goals.map(goal => ({
        chest_type: goal.chest_type,
        profit_goal: goal.profit_goal,
        current_profit: goal.current_profit,
        goal_reached: goal.goal_reached
      }));

      for (const goal of updates) {
        const { error } = await supabase
          .from('chest_profit_goals')
          .upsert(goal);

        if (error) throw error;
      }

      toast({
        title: "Metas salvas!",
        description: "Todas as metas foram atualizadas com sucesso.",
      });

    } catch (error: any) {
      console.error('Erro ao salvar metas:', error);
      toast({
        title: "Erro ao salvar metas",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const getChestTypeLabel = (chestType: string) => {
    return CHEST_TYPES.find(c => c.value === chestType)?.label || chestType;
  };

  const getChestTypeColor = (chestType: string) => {
    return CHEST_TYPES.find(c => c.value === chestType)?.color || 'bg-gray-500';
  };

  const getProgressPercentage = (current: number, goal: number) => {
    return goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="ml-3">Carregando metas...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Metas dos Baús
          </CardTitle>
          <Button onClick={saveGoals} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Metas'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <Card key={goal.chest_type} className="border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded ${getChestTypeColor(goal.chest_type)}`}></div>
                    <h3 className="font-semibold">{getChestTypeLabel(goal.chest_type)}</h3>
                  </div>
                  {goal.goal_reached && (
                    <div className="flex items-center text-green-600 text-sm">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      Meta Atingida
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`goal-${goal.chest_type}`}>Meta de Lucro (R$)</Label>
                  <Input
                    id={`goal-${goal.chest_type}`}
                    type="number"
                    step="0.01"
                    value={goal.profit_goal}
                    onChange={(e) => handleGoalChange(goal.chest_type, parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso</span>
                    <span>R$ {goal.current_profit.toFixed(2)} / R$ {goal.profit_goal.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        goal.goal_reached ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${getProgressPercentage(goal.current_profit, goal.profit_goal)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {getProgressPercentage(goal.current_profit, goal.profit_goal).toFixed(1)}% da meta
                  </p>
                </div>

                <div className="pt-2 border-t">
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lucro Atual:</span>
                      <span className={goal.current_profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                        R$ {goal.current_profit.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2">ℹ️ Informações sobre as Metas</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• As metas servem apenas como parâmetros administrativos e alertas</li>
            <li>• Não alteram valores reais de caixa ou sorteios</li>
            <li>• Permitem acompanhar performance de cada tipo de baú</li>
            <li>• Atualizadas automaticamente conforme as vendas</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChestGoalsManager;
