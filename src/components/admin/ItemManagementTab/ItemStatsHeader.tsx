import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DatabaseItem } from '@/types/database';
import { Package, DollarSign, Target, Activity } from 'lucide-react';

interface ItemStatsHeaderProps {
  items: DatabaseItem[];
}

const ItemStatsHeader: React.FC<ItemStatsHeaderProps> = ({ items }) => {
  const stats = React.useMemo(() => {
    const total = items.length;
    const active = items.filter(item => item.is_active).length;
    const inactive = total - active;
    
    const totalValue = items.reduce((sum, item) => sum + item.base_value, 0);
    const averageValue = total > 0 ? totalValue / total : 0;
    
    const rarityCount = items.reduce((acc, item) => {
      acc[item.rarity] = (acc[item.rarity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostExpensive = items.length > 0 
      ? items.reduce((max, item) => item.base_value > max.base_value ? item : max)
      : null;

    return {
      total,
      active,
      inactive,
      totalValue,
      averageValue,
      rarityCount,
      mostExpensive
    };
  }, [items]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Items */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Itens</p>
              <p className="text-xl font-semibold">{stats.total}</p>
              <div className="flex gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {stats.active} ativos
                </Badge>
                {stats.inactive > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {stats.inactive} inativos
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Value Stats */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valor Médio</p>
              <p className="text-xl font-semibold">{formatCurrency(stats.averageValue)}</p>
              <p className="text-xs text-muted-foreground">
                Total: {formatCurrency(stats.totalValue)}
              </p>
            </div>
          </div>

          {/* Most Expensive */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Target className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Mais Caro</p>
              <p className="text-xl font-semibold">{formatCurrency(stats.mostExpensive?.base_value || 0)}</p>
              <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                {stats.mostExpensive?.name || 'N/A'}
              </p>
            </div>
          </div>

          {/* Rarity Distribution */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Activity className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Distribuição</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {Object.entries(stats.rarityCount).map(([rarity, count]) => (
                  <Badge 
                    key={rarity}
                    className={`text-white text-xs ${getRarityColor(rarity)}`}
                  >
                    {rarity.charAt(0).toUpperCase()}: {count}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ItemStatsHeader;