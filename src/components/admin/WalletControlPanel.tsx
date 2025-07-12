
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useWalletAdmin } from '@/hooks/useWalletAdmin';
import ChestGoalsWidget from './ChestGoalsWidget';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Wallet, 
  CreditCard,
  AlertTriangle,
  Target,
  Calendar,
  BarChart3
} from 'lucide-react';

const WalletControlPanel = () => {
  const { 
    stats, 
    dailyStats, 
    monthlyStats, 
    recentTransactions, 
    topUsers, 
    loading 
  } = useWalletAdmin();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Carregando dados da carteira...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Widget de Metas */}
      <ChestGoalsWidget />
      
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total Sistema</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {stats.totalSystemBalance.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.activeUsers} usuários ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entradas Hoje</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {dailyStats.totalDeposits.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {dailyStats.depositsCount} transações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas de Baús</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              R$ {dailyStats.chestSales.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {dailyStats.chestsCount} baús vendidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            <Target className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${dailyStats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {dailyStats.netProfit.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {dailyStats.netProfit >= 0 ? 'Lucro' : 'Prejuízo'} do dia
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e Métricas Mensais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Resumo Mensal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Entradas do Mês</span>
                <span className="font-semibold text-green-600">
                  R$ {monthlyStats.totalDeposits.toFixed(2)}
                </span>
              </div>
              <Progress 
                value={(monthlyStats.totalDeposits / Math.max(monthlyStats.totalDeposits, monthlyStats.chestSales)) * 100} 
                className="h-2"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Vendas de Baús</span>
                <span className="font-semibold text-blue-600">
                  R$ {monthlyStats.chestSales.toFixed(2)}
                </span>
              </div>
              <Progress 
                value={(monthlyStats.chestSales / Math.max(monthlyStats.totalDeposits, monthlyStats.chestSales)) * 100} 
                className="h-2"
              />
            </div>

            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Lucro Mensal:</span>
                <span className={`font-bold ${monthlyStats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {monthlyStats.netProfit.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Top Usuários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topUsers.map((user, index) => (
                <div key={user.user_id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.transactions_count} transações
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">
                      R$ {user.total_spent.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Saldo: R$ {user.current_balance.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transações Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Transações Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    transaction.type === 'deposit' ? 'bg-green-100 text-green-600' :
                    transaction.type === 'purchase' ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {transaction.type === 'deposit' ? <TrendingUp className="w-4 h-4" /> :
                     transaction.type === 'purchase' ? <CreditCard className="w-4 h-4" /> :
                     <TrendingDown className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.user_email} • {new Date(transaction.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${
                    transaction.type === 'deposit' ? 'text-green-600' : 'text-blue-600'
                  }`}>
                    {transaction.type === 'deposit' ? '+' : '-'}R$ {transaction.amount.toFixed(2)}
                  </p>
                  <Badge variant={
                    transaction.status === 'completed' ? 'default' :
                    transaction.status === 'pending' ? 'secondary' : 'destructive'
                  }>
                    {transaction.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alertas e Status */}
      {stats.lowBalanceUsers > 0 && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="w-5 h-5" />
              Alertas do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                {stats.lowBalanceUsers}
              </Badge>
              <span>usuários com saldo baixo (menos de R$ 10,00)</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WalletControlPanel;
