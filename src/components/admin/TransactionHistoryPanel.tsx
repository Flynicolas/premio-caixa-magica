import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  CreditCard, 
  TrendingUp, 
  TrendingDown,
  Wallet,
  ShoppingCart,
  DollarSign,
  RefreshCw
} from 'lucide-react';

interface TransactionData {
  id: string;
  user_id: string;
  amount: number;
  type: string;
  description: string;
  status: string;
  created_at: string;
  payment_provider?: string;
  source?: string;
  profiles?: {
    full_name: string;
    email: string;
  } | null;
}

const TransactionHistoryPanel = () => {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalAmount: 0,
    totalDeposits: 0,
    totalPurchases: 0,
    totalRedemptions: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      
      // Buscar transações principais
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .select(`
          *,
          profiles!transactions_user_id_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(1000);

      if (transactionError) throw transactionError;

      // Buscar transações da carteira para completar os dados
      const { data: walletData, error: walletError } = await supabase
        .from('wallet_transactions')
        .select(`
          *,
          profiles!wallet_transactions_user_id_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(500);

      if (walletError) throw walletError;

      // Combinar e formatar dados
      const allTransactions = [
        ...(transactionData || []).map(t => ({ ...t, source: 'transactions' })),
        ...(walletData || []).map(t => ({ ...t, source: 'wallet_transactions', status: 'completed' }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setTransactions(allTransactions);

      // Calcular estatísticas
      const totalAmount = allTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const deposits = allTransactions.filter(t => t.type === 'deposit');
      const purchases = allTransactions.filter(t => t.type === 'purchase');
      const redemptions = allTransactions.filter(t => t.type === 'money_redemption' || t.type === 'prize_conversion');

      setStats({
        totalTransactions: allTransactions.length,
        totalAmount,
        totalDeposits: deposits.reduce((sum, t) => sum + t.amount, 0),
        totalPurchases: Math.abs(purchases.reduce((sum, t) => sum + t.amount, 0)),
        totalRedemptions: redemptions.reduce((sum, t) => sum + t.amount, 0)
      });

    } catch (error: any) {
      console.error('Erro ao buscar transações:', error);
      toast({
        title: "Erro ao carregar transações",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = (range: string) => {
    const now = new Date();
    switch (range) {
      case 'today':
        return { start: new Date(now.getFullYear(), now.getMonth(), now.getDate()) };
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 7);
        return { start: weekStart };
      case 'month':
        return { start: new Date(now.getFullYear(), now.getMonth(), 1) };
      default:
        return null;
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;

    let matchesDate = true;
    if (dateFilter !== 'all') {
      const dateRange = getDateRange(dateFilter);
      if (dateRange) {
        const transactionDate = new Date(transaction.created_at);
        matchesDate = transactionDate >= dateRange.start;
      }
    }

    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'purchase': return <ShoppingCart className="w-4 h-4 text-blue-500" />;
      case 'money_redemption':
      case 'prize_conversion': return <DollarSign className="w-4 h-4 text-yellow-500" />;
      default: return <CreditCard className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTransactionTypeText = (type: string) => {
    switch (type) {
      case 'deposit': return 'Depósito';
      case 'purchase': return 'Compra';
      case 'money_redemption': return 'Resgate Dinheiro';
      case 'prize_conversion': return 'Conversão Prêmio';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const exportToCSV = () => {
    const csvHeaders = ['Data', 'Usuário', 'Email', 'Tipo', 'Valor', 'Status', 'Descrição'];
    const csvData = filteredTransactions.map(t => [
      format(new Date(t.created_at), 'dd/MM/yyyy HH:mm'),
      t.profiles?.full_name || 'N/A',
      t.profiles?.email || 'N/A',
      getTransactionTypeText(t.type),
      `R$ ${t.amount.toFixed(2)}`,
      t.status,
      t.description || 'N/A'
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transacoes_${format(new Date(), 'dd-MM-yyyy')}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.totalTransactions}</p>
              </div>
              <CreditCard className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Depósitos</p>
                <p className="text-lg font-bold text-green-600">R$ {stats.totalDeposits.toFixed(2)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Compras</p>
                <p className="text-lg font-bold text-blue-600">R$ {stats.totalPurchases.toFixed(2)}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resgates</p>
                <p className="text-lg font-bold text-yellow-600">R$ {stats.totalRedemptions.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Volume Total</p>
                <p className="text-lg font-bold">R$ {stats.totalAmount.toFixed(2)}</p>
              </div>
              <Wallet className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Histórico de Transações ({filteredTransactions.length})
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={fetchTransactions} size="sm" variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
              <Button onClick={exportToCSV} size="sm" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>
        
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar transações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="deposit">Depósitos</SelectItem>
                <SelectItem value="purchase">Compras</SelectItem>
                <SelectItem value="money_redemption">Resgates</SelectItem>
                <SelectItem value="prize_conversion">Conversões</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="failed">Falhou</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Períodos</SelectItem>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">Última Semana</SelectItem>
                <SelectItem value="month">Último Mês</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={() => {
              setSearchTerm('');
              setTypeFilter('all');
              setStatusFilter('all');
              setDateFilter('all');
            }} variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Limpar
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma transação encontrada</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTransactions.slice(0, 100).map((transaction) => (
                <div
                  key={`${transaction.id}-${transaction.source}`}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <p className="font-medium">{transaction.profiles?.full_name || 'Usuário Anônimo'}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.profiles?.email || 'Email não disponível'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="font-medium">{getTransactionTypeText(transaction.type)}</p>
                    <p className="text-sm text-muted-foreground">{transaction.description}</p>
                  </div>
                  
                  <div className="text-center">
                    <p className={`font-bold ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.amount >= 0 ? '+' : ''}R$ {transaction.amount.toFixed(2)}
                    </p>
                    <Badge className={`${getStatusColor(transaction.status)} text-white text-xs`}>
                      {transaction.status}
                    </Badge>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm">
                      {format(new Date(transaction.created_at), 'dd/MM/yyyy')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(transaction.created_at), 'HH:mm')}
                    </p>
                  </div>
                </div>
              ))}
              
              {filteredTransactions.length > 100 && (
                <div className="text-center py-4 text-muted-foreground">
                  <p>Mostrando 100 de {filteredTransactions.length} transações</p>
                  <p className="text-sm">Use os filtros para refinar a busca</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionHistoryPanel;