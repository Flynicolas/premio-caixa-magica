import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAutoWeightCalculator } from '@/hooks/useAutoWeightCalculator';
import { supabase } from '@/integrations/supabase/client';
import { 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  EyeOff, 
  Target,
  Zap,
  TrendingUp
} from 'lucide-react';

interface DatabaseItem {
  id: string;
  name: string;
  base_value: number;
  rarity: string;
  category: string;
  image_url?: string;
  is_active: boolean;
}

interface AutoWeightSystemControlProps {
  items: DatabaseItem[];
  onRefresh: () => void;
}

const AutoWeightSystemControl: React.FC<AutoWeightSystemControlProps> = ({ items, onRefresh }) => {
  const [pixIssues, setPixIssues] = useState<{ item: DatabaseItem; weight: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [fixing, setFixing] = useState(false);
  const { 
    updating, 
    calculateAutoWeight, 
    applyAutoWeightsToScratchCards, 
    getWeightRecommendation 
  } = useAutoWeightCalculator();
  const { toast } = useToast();

  useEffect(() => {
    checkPixProblems();
  }, [items]);

  const checkPixProblems = async () => {
    try {
      setLoading(true);
      
      // Buscar probabilidades da raspadinha PIX
      const { data: pixProbs, error } = await supabase
        .from('scratch_card_probabilities')
        .select('item_id, probability_weight')
        .eq('scratch_type', 'pix')
        .eq('is_active', true);

      if (error) throw error;

      const problems: { item: DatabaseItem; weight: number }[] = [];
      
      // Verificar itens caros com peso > 0 no PIX
      pixProbs?.forEach(prob => {
        const item = items.find(i => i.id === prob.item_id);
        if (item) {
          // PIX R$ 0,50: itens > R$ 100 não deveriam ter peso > 0
          if (item.base_value > 100 && prob.probability_weight > 0) {
            problems.push({ item, weight: prob.probability_weight });
          }
          // Itens R$ 500 ou R$ 1000 definitivamente não deveriam ter peso
          if (item.base_value >= 500 && prob.probability_weight > 0) {
            problems.push({ item, weight: prob.probability_weight });
          }
        }
      });

      setPixIssues(problems);
    } catch (error) {
      console.error('Erro ao verificar problemas PIX:', error);
    } finally {
      setLoading(false);
    }
  };

  const fixPixProblems = async () => {
    try {
      setFixing(true);
      
      // 1. Aplicar pesos automáticos para corrigir distribuição
      const autoWeightSuccess = await applyAutoWeightsToScratchCards();
      
      if (autoWeightSuccess) {
        // 2. Zerar peso de itens críticos no PIX (>= R$ 200)
        for (const issue of pixIssues) {
          if (issue.item.base_value >= 200) {
            await supabase
              .from('scratch_card_probabilities')
              .update({ probability_weight: 0 })
              .eq('item_id', issue.item.id)
              .eq('scratch_type', 'pix');
          }
        }

        // 3. Verificar se há orçamento suficiente
        await supabase
          .from('scratch_card_financial_control')
          .upsert({
            scratch_type: 'pix',
            date: new Date().toISOString().split('T')[0],
            remaining_budget: 15.00, // Reset para valor seguro
            percentage_prizes: 0.20, // 20% dos valores
            pay_upto_percentage: 20
          }, {
            onConflict: 'scratch_type,date'
          });

        toast({
          title: "Problemas PIX Corrigidos!",
          description: `${pixIssues.length} problemas resolvidos. Sistema 80/20 ativado.`,
        });

        onRefresh();
        checkPixProblems();
      }
    } catch (error) {
      console.error('Erro ao corrigir problemas PIX:', error);
      toast({
        title: "Erro ao corrigir",
        description: "Falha ao aplicar correções automáticas",
        variant: "destructive"
      });
    } finally {
      setFixing(false);
    }
  };

  const makeItemVisualOnly = async (itemId: string, itemName: string) => {
    try {
      // Zerar peso em todas as raspadinhas
      await supabase
        .from('scratch_card_probabilities')
        .update({ probability_weight: 0 })
        .eq('item_id', itemId);

      // Zerar peso nos baús também
      await supabase
        .from('chest_item_probabilities')
        .update({ probability_weight: 0 })
        .eq('item_id', itemId);

      toast({
        title: "Item Tornado Visual",
        description: `${itemName} agora é apenas visual (peso = 0)`,
      });

      onRefresh();
      checkPixProblems();
    } catch (error) {
      console.error('Erro ao tornar item visual:', error);
      toast({
        title: "Erro",
        description: "Falha ao tornar item visual",
        variant: "destructive"
      });
    }
  };

  const weightRanges = [
    { category: 'Comum (R$ 1-10)', range: 'R$ 1 - 10', weight: 100, color: 'bg-green-500', count: items.filter(i => i.base_value <= 10).length },
    { category: 'Baixo (R$ 11-25)', range: 'R$ 11 - 25', weight: 50, color: 'bg-blue-500', count: items.filter(i => i.base_value > 10 && i.base_value <= 25).length },
    { category: 'Médio (R$ 26-50)', range: 'R$ 26 - 50', weight: 25, color: 'bg-yellow-500', count: items.filter(i => i.base_value > 25 && i.base_value <= 50).length },
    { category: 'Alto (R$ 51-100)', range: 'R$ 51 - 100', weight: 10, color: 'bg-orange-500', count: items.filter(i => i.base_value > 50 && i.base_value <= 100).length },
    { category: 'Premium (R$ 101-200)', range: 'R$ 101 - 200', weight: 5, color: 'bg-red-500', count: items.filter(i => i.base_value > 100 && i.base_value <= 200).length },
    { category: 'Luxo (R$ 201-500)', range: 'R$ 201 - 500', weight: 2, color: 'bg-purple-500', count: items.filter(i => i.base_value > 200 && i.base_value <= 500).length },
    { category: 'Visual Apenas (>R$ 500)', range: '> R$ 500', weight: 0, color: 'bg-gray-500', count: items.filter(i => i.base_value > 500).length }
  ];

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Verificando sistema 80/20...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Status do Sistema 80/20
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {pixIssues.length > 0 ? (
            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>
                    <strong>{pixIssues.length} problema(s) crítico(s) detectado(s)</strong> - Itens caros ainda podem ser sorteados no PIX
                  </span>
                  <Button 
                    onClick={fixPixProblems} 
                    disabled={fixing}
                    variant="destructive"
                    size="sm"
                  >
                    <Zap className="w-4 h-4 mr-1" />
                    {fixing ? 'Corrigindo...' : 'Corrigir Agora'}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <CheckCircle className="w-4 h-4" />
              <AlertDescription className="text-green-700">
                Sistema funcionando corretamente! Margem 80/20 ativa e itens com pesos adequados.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center p-3 bg-green-50 rounded">
              <div className="font-bold text-green-700 text-lg">80%</div>
              <div className="text-green-600">Lucro Garantido</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded">
              <div className="font-bold text-blue-700 text-lg">20%</div>
              <div className="text-blue-600">Orçamento Prêmios</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded">
              <div className="font-bold text-purple-700 text-lg">Auto</div>
              <div className="text-purple-600">Pesos por Valor</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Problemas Detectados */}
      {pixIssues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Problemas Críticos Detectados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pixIssues.map(issue => (
                <div key={issue.item.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded">
                  <div>
                    <div className="font-medium text-red-800">{issue.item.name}</div>
                    <div className="text-sm text-red-600">
                      R$ {issue.item.base_value.toFixed(2)} com peso {issue.weight} no PIX R$ 0,50
                    </div>
                    <div className="text-xs text-red-500">
                      Recomendado: {getWeightRecommendation(issue.item.base_value).category}
                    </div>
                  </div>
                  <Button
                    onClick={() => makeItemVisualOnly(issue.item.id, issue.item.name)}
                    size="sm"
                    variant="outline"
                    className="gap-1"
                  >
                    <EyeOff className="w-3 h-3" />
                    Tornar Visual
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Distribuição de Pesos Automáticos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Sistema de Pesos Automáticos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {weightRanges.map(range => (
              <div key={range.category} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${range.color}`} />
                  <div>
                    <div className="font-medium">{range.category}</div>
                    <div className="text-sm text-muted-foreground">{range.range}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">Peso: {range.weight}</div>
                  <div className="text-sm text-muted-foreground">{range.count} itens</div>
                </div>
              </div>
            ))}
          </div>

          <Alert className="mt-4">
            <Eye className="w-4 h-4" />
            <AlertDescription>
              Itens com <strong>peso 0</strong> são apenas visuais - aparecem no jogo mas nunca são sorteados. 
              Use isso para itens muito caros ou exclusivos.
            </AlertDescription>
          </Alert>

          <Button
            onClick={applyAutoWeightsToScratchCards}
            disabled={updating}
            className="w-full mt-4"
            size="lg"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            {updating ? 'Aplicando Pesos Automáticos...' : 'Aplicar Pesos Automáticos em Todos os Sistemas'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutoWeightSystemControl;