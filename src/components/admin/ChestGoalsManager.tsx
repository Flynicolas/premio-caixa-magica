
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RefreshCw, Edit, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ChestGoal {
  id: string;
  nome_bau: string;
  meta_valor: number;
  valor_atual: number;
  notificacao_enviada: boolean;
}

const ChestGoalsManager = () => {
  const [goals, setGoals] = useState<ChestGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGoal, setEditingGoal] = useState<ChestGoal | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('metas_baus')
        .select('*')
        .order('nome_bau');

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Erro ao buscar metas:', error);
      toast.error('Erro ao carregar metas de baús');
    } finally {
      setLoading(false);
    }
  };

  const handleResetGoal = async (goalId: string, goalName: string) => {
    if (!confirm(`Tem certeza que deseja resetar a meta do baú "${goalName}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('metas_baus')
        .update({ 
          valor_atual: 0,
          notificacao_enviada: false 
        })
        .eq('id', goalId);

      if (error) throw error;
      
      toast.success('Meta resetada com sucesso!');
      fetchGoals();
    } catch (error) {
      console.error('Erro ao resetar meta:', error);
      toast.error('Erro ao resetar meta');
    }
  };

  const handleEditGoal = async (goalData: { meta_valor: number }) => {
    if (!editingGoal) return;

    try {
      const { error } = await supabase
        .from('metas_baus')
        .update({ meta_valor: goalData.meta_valor })
        .eq('id', editingGoal.id);

      if (error) throw error;
      
      toast.success('Meta atualizada com sucesso!');
      setIsEditDialogOpen(false);
      setEditingGoal(null);
      fetchGoals();
    } catch (error) {
      console.error('Erro ao atualizar meta:', error);
      toast.error('Erro ao atualizar meta');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-3">Carregando metas...</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Metas de Baús</CardTitle>
          <Button onClick={fetchGoals} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Baú</TableHead>
                <TableHead>Meta</TableHead>
                <TableHead>Valor Atual</TableHead>
                <TableHead>Progresso</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {goals.map((goal) => {
                const progress = getProgressPercentage(goal.valor_atual, goal.meta_valor);
                const isCompleted = goal.valor_atual >= goal.meta_valor;
                
                return (
                  <TableRow key={goal.id}>
                    <TableCell className="font-medium capitalize">
                      {goal.nome_bau}
                    </TableCell>
                    <TableCell>{formatCurrency(goal.meta_valor)}</TableCell>
                    <TableCell>{formatCurrency(goal.valor_atual)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              isCompleted ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{progress.toFixed(1)}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {isCompleted ? (
                        <span className="text-green-600 font-medium">
                          {goal.notificacao_enviada ? 'Notificado' : 'Meta Atingida'}
                        </span>
                      ) : (
                        <span className="text-gray-600">Em Progresso</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Dialog 
                          open={isEditDialogOpen && editingGoal?.id === goal.id}
                          onOpenChange={(open) => {
                            setIsEditDialogOpen(open);
                            if (!open) setEditingGoal(null);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingGoal(goal)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Editar Meta - {goal.nome_bau}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="meta_valor">Valor da Meta (R$)</Label>
                                <Input
                                  id="meta_valor"
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  defaultValue={goal.meta_valor}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      const value = parseFloat((e.target as HTMLInputElement).value);
                                      if (value > 0) {
                                        handleEditGoal({ meta_valor: value });
                                      }
                                    }
                                  }}
                                />
                              </div>
                              <Button 
                                onClick={() => {
                                  const input = document.getElementById('meta_valor') as HTMLInputElement;
                                  const value = parseFloat(input.value);
                                  if (value > 0) {
                                    handleEditGoal({ meta_valor: value });
                                  }
                                }}
                                className="w-full"
                              >
                                Salvar Meta
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResetGoal(goal.id, goal.nome_bau)}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChestGoalsManager;
