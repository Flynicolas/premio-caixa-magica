import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ChestGoal {
  id: string;
  nome_bau: string;
  meta_valor: number;
  valor_atual: number;
  notificacao_enviada: boolean;
  created_at: string;
  updated_at: string;
}

const ChestGoalsWidget = () => {
  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['chest-goals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('metas_baus')
        .select('*')
        .order('nome_bau');
      
      if (error) throw error;
      return data as ChestGoal[];
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Metas dos Baús
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTotalProgress = () => {
    if (goals.length === 0) return 0;
    const totalProgress = goals.reduce((acc, goal) => {
      return acc + Math.min(100, (goal.valor_atual / goal.meta_valor) * 100);
    }, 0);
    return totalProgress / goals.length;
  };

  const getGoalsStatus = () => {
    const completed = goals.filter(goal => goal.valor_atual >= goal.meta_valor).length;
    const inProgress = goals.filter(goal => goal.valor_atual > 0 && goal.valor_atual < goal.meta_valor).length;
    const notStarted = goals.filter(goal => goal.valor_atual === 0).length;
    return { completed, inProgress, notStarted };
  };

  const status = getGoalsStatus();
  const overallProgress = getTotalProgress();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Resumo Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Resumo das Metas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              {overallProgress.toFixed(1)}%
            </div>
            <p className="text-sm text-muted-foreground">Progresso Geral</p>
            <Progress value={overallProgress} className="mt-2" />
          </div>
          
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="text-center p-2 rounded-lg bg-green-500/10">
              <div className="text-lg font-bold text-green-600">{status.completed}</div>
              <div className="text-xs text-muted-foreground">Concluídas</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-yellow-500/10">
              <div className="text-lg font-bold text-yellow-600">{status.inProgress}</div>
              <div className="text-xs text-muted-foreground">Em Andamento</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-gray-500/10">
              <div className="text-lg font-bold text-gray-600">{status.notStarted}</div>
              <div className="text-xs text-muted-foreground">Não Iniciadas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detalhes das Metas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Detalhes por Baú
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {goals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma meta configurada</p>
              </div>
            ) : (
              goals.map((goal) => {
                const progress = Math.min(100, (goal.valor_atual / goal.meta_valor) * 100);
                const isCompleted = goal.valor_atual >= goal.meta_valor;
                
                return (
                  <div key={goal.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm capitalize">
                          Baú {goal.nome_bau}
                        </span>
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : progress > 0 ? (
                          <AlertCircle className="w-4 h-4 text-yellow-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <Badge 
                        variant={isCompleted ? "default" : progress > 0 ? "secondary" : "outline"}
                        className="text-xs"
                      >
                        {progress.toFixed(0)}%
                      </Badge>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>R$ {goal.valor_atual.toFixed(2)}</span>
                        <span>R$ {goal.meta_valor.toFixed(2)}</span>
                      </div>
                      <Progress value={progress} className="h-1.5" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChestGoalsWidget;