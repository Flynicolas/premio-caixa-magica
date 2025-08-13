import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/hooks/useWalletProvider';
import { Calendar, Filter, ExternalLink, Search } from 'lucide-react';

export const TransactionHistoryTab = () => {
  const { transactions } = useWallet();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case "deposit": return "text-green-500";
      case "withdrawal": return "text-red-500";
      case "purchase": return "text-orange-500";
      case "prize": return "text-purple-500";
      case "money_redemption": return "text-blue-500";
      default: return "text-muted-foreground";
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit": return "💰";
      case "withdrawal": return "💸";
      case "purchase": return "🛒";
      case "prize": return "🏆";
      case "money_redemption": return "💵";
      default: return "•";
    }
  };

  const getTransactionTypeName = (type: string) => {
    switch (type) {
      case "deposit": return "Depósito";
      case "withdrawal": return "Saque";
      case "purchase": return "Compra";
      case "prize": return "Prêmio";
      case "money_redemption": return "Resgate";
      default: return type;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "pending": return "secondary";
      case "failed": return "destructive";
      case "cancelled": return "outline";
      default: return "secondary";
    }
  };

  const getStatusName = (status: string) => {
    switch (status) {
      case "completed": return "Concluído";
      case "pending": return "Pendente";
      case "failed": return "Falhou";
      case "cancelled": return "Cancelado";
      default: return status;
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Histórico de Transações</h3>
        <p className="text-muted-foreground">Acompanhe todas as movimentações da sua carteira</p>
      </div>

      {/* Filtros */}
      <Card className="p-4 bg-secondary/20 border-primary/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="deposit">Depósitos</SelectItem>
              <SelectItem value="withdrawal">Saques</SelectItem>
              <SelectItem value="purchase">Compras</SelectItem>
              <SelectItem value="prize">Prêmios</SelectItem>
              <SelectItem value="money_redemption">Resgates</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="failed">Falhou</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Lista de Transações */}
      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <Card className="p-8 text-center bg-secondary/20 border-primary/10">
            <Filter className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma transação encontrada</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                ? 'Tente ajustar os filtros de busca'
                : 'Suas transações aparecerão aqui'
              }
            </p>
          </Card>
        ) : (
          filteredTransactions.map((transaction) => (
            <Card key={transaction.id} className="p-4 bg-secondary/20 border-primary/10 hover:border-primary/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${
                    transaction.type === "deposit" ? "bg-green-500/20" :
                    transaction.type === "withdrawal" ? "bg-red-500/20" :
                    transaction.type === "purchase" ? "bg-orange-500/20" : 
                    transaction.type === "prize" ? "bg-purple-500/20" :
                    "bg-blue-500/20"
                  }`}>
                    <span className="text-xl">
                      {getTransactionIcon(transaction.type)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{transaction.description}</h4>
                      <Badge variant={getStatusVariant(transaction.status)} className="text-xs">
                        {getStatusName(transaction.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{getTransactionTypeName(transaction.type)}</span>
                      <span>•</span>
                      <span>
                        {new Date(transaction.created_at).toLocaleDateString('pt-BR')} às{" "}
                        {new Date(transaction.created_at).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex items-center gap-2">
                  <div>
                    <span className={`font-bold text-lg ${getTransactionTypeColor(transaction.type)}`}>
                      {transaction.type === "deposit" || transaction.type === "prize" ? "+" : "-"}
                      R$ {Math.abs(transaction.amount).toFixed(2)}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Paginação futura */}
      {filteredTransactions.length > 10 && (
        <div className="text-center">
          <Button variant="outline">
            Carregar mais transações
          </Button>
        </div>
      )}
    </div>
  );
};