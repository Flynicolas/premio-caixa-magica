import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  Wallet,
  Percent
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ScratchCardStatus {
  scratch_type: string;
  price: number;
  win_probability_global: number;
  pay_upto_percentage: number;
  bank_balance: number;
  min_bank_balance: number;
  total_sales: number;
  total_prizes_given: number;
  net_profit: number;
  cards_played: number;
  profit_margin: number;
}

const ScratchCard90TenStatus = () => {
  const [scratchCards, setScratchCards] = useState<ScratchCardStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState<'optimal' | 'warning' | 'critical'>('optimal');

  useEffect(() => {
    fetchScratchCardStatus();
  }, []);

  const fetchScratchCardStatus = async () => {
    try {
      setLoading(true);
      
      // Buscar dados das configurações e controle financeiro
      const { data: settings } = await supabase
        .from('scratch_card_settings')
        .select('scratch_type, price, win_probability_global')
        .eq('is_active', true);

      const { data: financial } = await supabase
        .from('scratch_card_financial_control')
        .select('*')
        .eq('date', new Date().toISOString().split('T')[0]);

      if (settings && financial) {
        const combined = settings.map(setting => {
          const finData = financial.find(f => f.scratch_type === setting.scratch_type);
          const profitMargin = finData?.total_sales > 0 
            ? ((finData.net_profit / finData.total_sales) * 100) 
            : 90; // Default esperado

          return {
            ...setting,
            pay_upto_percentage: finData?.pay_upto_percentage || 10,
            bank_balance: finData?.bank_balance || 0,
            min_bank_balance: finData?.min_bank_balance || 0,
            total_sales: finData?.total_sales || 0,
            total_prizes_given: finData?.total_prizes_given || 0,
            net_profit: finData?.net_profit || 0,
            cards_played: finData?.cards_played || 0,
            profit_margin: profitMargin
          };
        });

        setScratchCards(combined);
        
        // Determinar status do sistema
        const avgMargin = combined.reduce((acc, card) => acc + card.profit_margin, 0) / combined.length;
        if (avgMargin >= 85) setSystemStatus('optimal');
        else if (avgMargin >= 75) setSystemStatus('warning');
        else setSystemStatus('critical');
      }
    } catch (error) {
      console.error('Erro ao buscar status das raspadinhas:', error);
      toast.error('Erro ao carregar status do sistema');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (margin: number) => {
    if (margin >= 85) return 'text-green-600 bg-green-50';
    if (margin >= 75) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getStatusIcon = (margin: number) => {
    if (margin >= 85) return <CheckCircle className="h-4 w-4" />;
    if (margin >= 75) return <AlertTriangle className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalSales = scratchCards.reduce((acc, card) => acc + card.total_sales, 0);
  const totalPrizes = scratchCards.reduce((acc, card) => acc + card.total_prizes_given, 0);
  const totalProfit = scratchCards.reduce((acc, card) => acc + card.net_profit, 0);
  const overallMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 90;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header com Status Geral */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Sistema 90/10 - Status</h2>
          <p className="text-muted-foreground">
            Monitoramento em tempo real da margem de lucro das raspadinhas
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge 
            variant={systemStatus === 'optimal' ? 'default' : 'destructive'}
            className={`px-4 py-2 ${
              systemStatus === 'optimal' ? 'bg-green-500' :
              systemStatus === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
            }`}
          >
            {systemStatus === 'optimal' ? 'SISTEMA ÓTIMO' :
             systemStatus === 'warning' ? 'ATENÇÃO' : 'CRÍTICO'}
          </Badge>
          <Button onClick={fetchScratchCardStatus} variant="outline">
            <Activity className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Totais</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSales)}</div>
            <p className="text-xs text-muted-foreground">
              Hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prêmios Pagos</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPrizes)}</div>
            <p className="text-xs text-muted-foreground">
              {totalSales > 0 ? `${((totalPrizes / totalSales) * 100).toFixed(1)}%` : '0%'} das vendas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalProfit)}</div>
            <p className="text-xs text-muted-foreground">
              Meta: 90%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margem Geral</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(overallMargin).split(' ')[0]}`}>
              {overallMargin.toFixed(1)}%
            </div>
            <Progress value={overallMargin} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Detalhes por Tipo de Raspadinha */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {scratchCards.map((card) => (
          <Card key={card.scratch_type}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="capitalize">
                  Raspadinha {card.scratch_type}
                </CardTitle>
                <Badge className={getStatusColor(card.profit_margin)}>
                  {getStatusIcon(card.profit_margin)}
                  {card.profit_margin.toFixed(1)}%
                </Badge>
              </div>
              <CardDescription>
                Preço: {formatCurrency(card.price)} | Prob: {card.win_probability_global}%
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Vendas</p>
                  <p className="font-semibold">{formatCurrency(card.total_sales)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Prêmios</p>
                  <p className="font-semibold">{formatCurrency(card.total_prizes_given)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Jogadas</p>
                  <p className="font-semibold">{card.cards_played}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Saldo Banco</p>
                  <p className="font-semibold">{formatCurrency(card.bank_balance)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Margem de Lucro</span>
                  <span className={getStatusColor(card.profit_margin).split(' ')[0]}>
                    {card.profit_margin.toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={Math.min(card.profit_margin, 100)} 
                  className="h-2"
                />
              </div>

              <div className="flex gap-2 text-xs">
                <Badge variant="outline">
                  Max Payout: {card.pay_upto_percentage}%
                </Badge>
                <Badge variant="outline">
                  Win Rate: {card.win_probability_global}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alertas e Recomendações */}
      {systemStatus !== 'optimal' && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              Recomendações do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="text-yellow-800">
            <ul className="space-y-2">
              {scratchCards.filter(card => card.profit_margin < 85).map(card => (
                <li key={card.scratch_type} className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <strong>{card.scratch_type}:</strong> Margem de {card.profit_margin.toFixed(1)}% 
                  - Considere reduzir a probabilidade de vitória ou ajustar o payout máximo
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ScratchCard90TenStatus;