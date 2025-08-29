import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  Package, 
  Settings,
  TrendingUp,
  Eye,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface ChestManagerToolbarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedChest: string;
  setSelectedChest: (value: string) => void;
  rarityFilter: string;
  setRarityFilter: (value: string) => void;
  isCompactView: boolean;
  setIsCompactView: (value: boolean) => void;
  densityMode: 'compact' | 'normal' | 'expanded';
  setDensityMode: (mode: 'compact' | 'normal' | 'expanded') => void;
  onNewItem: () => void;
  onRefresh: () => void;
  stats: {
    totalItems: number;
    totalValue: number;
    chestStats: Array<{ type: string; label: string; count: number; value: number; }>;
  };
}

const CHEST_TYPES = [
  { value: 'silver', label: 'Prata', color: 'hsl(var(--muted-foreground))' },
  { value: 'gold', label: 'Ouro', color: 'hsl(45 93% 47%)' },
  { value: 'delas', label: 'Delas', color: 'hsl(142 76% 36%)' },
  { value: 'diamond', label: 'Diamante', color: 'hsl(221 83% 53%)' },
  { value: 'ruby', label: 'Ruby', color: 'hsl(0 84% 60%)' },
  { value: 'premium', label: 'Premium', color: 'hsl(271 91% 65%)' }
];

const ChestManagerToolbar = ({
  searchTerm,
  setSearchTerm,
  selectedChest,
  setSelectedChest,
  rarityFilter,
  setRarityFilter,
  isCompactView,
  setIsCompactView,
  densityMode,
  setDensityMode,
  onNewItem,
  onRefresh,
  stats
}: ChestManagerToolbarProps) => {
  return (
    <div className="space-y-4">
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button onClick={onNewItem} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Novo Item
          </Button>
          <Button variant="outline" onClick={onRefresh} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCompactView(!isCompactView)}
            className="flex items-center gap-2"
          >
            {isCompactView ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            {isCompactView ? 'Expandir' : 'Compactar'}
          </Button>
          
          <Select value={densityMode} onValueChange={(value: 'compact' | 'normal' | 'expanded') => setDensityMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="compact">Compacto</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="expanded">Expandido</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-card border rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Total Itens</span>
          </div>
          <div className="text-2xl font-bold">{stats.totalItems}</div>
        </div>
        
        <div className="bg-card border rounded-lg p-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Valor Total</span>
          </div>
          <div className="text-2xl font-bold">R$ {stats.totalValue.toFixed(0)}</div>
        </div>

        {stats.chestStats.slice(0, 4).map((chest) => (
          <div key={chest.type} className="bg-card border rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Badge 
                style={{ backgroundColor: CHEST_TYPES.find(c => c.value === chest.type)?.color }}
                className="text-white text-xs px-2 py-0"
              >
                {chest.label}
              </Badge>
            </div>
            <div className="text-lg font-bold">{chest.count} itens</div>
            <div className="text-xs text-muted-foreground">R$ {chest.value.toFixed(0)}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar itens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={selectedChest} onValueChange={setSelectedChest}>
          <SelectTrigger>
            <SelectValue placeholder="Todos os baús" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os baús</SelectItem>
            {CHEST_TYPES.map(chest => (
              <SelectItem key={chest.value} value={chest.value}>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: chest.color }}
                  />
                  {chest.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={rarityFilter} onValueChange={setRarityFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Todas as raridades" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as raridades</SelectItem>
            <SelectItem value="common">Comum</SelectItem>
            <SelectItem value="rare">Raro</SelectItem>
            <SelectItem value="epic">Épico</SelectItem>
            <SelectItem value="legendary">Lendário</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {stats.totalItems} resultado(s)
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChestManagerToolbar;