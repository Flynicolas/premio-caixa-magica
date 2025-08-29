import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ArrowUpDown, Filter, LayoutGrid, List, Maximize2, Minimize2 } from 'lucide-react';

interface ItemSearchAndFiltersProps {
  onSearch: (term: string) => void;
  onSort: (sortBy: string, order: 'asc' | 'desc') => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  viewMode?: 'table' | 'grid';
  onViewModeChange?: (mode: 'table' | 'grid') => void;
  density?: 'compact' | 'normal' | 'comfortable';
  onDensityChange?: (density: 'compact' | 'normal' | 'comfortable') => void;
  rarityFilter?: string;
  onRarityFilter?: (rarity: string) => void;
  statusFilter?: string;
  onStatusFilter?: (status: string) => void;
}

const ItemSearchAndFilters: React.FC<ItemSearchAndFiltersProps> = ({
  onSearch,
  onSort,
  sortBy,
  sortOrder,
  viewMode = 'table',
  onViewModeChange,
  density = 'normal',
  onDensityChange,
  rarityFilter,
  onRarityFilter,
  statusFilter,
  onStatusFilter
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  const toggleSortOrder = () => {
    onSort(sortBy, sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const rarityOptions = [
    { value: 'all', label: 'Todas' },
    { value: 'common', label: 'Comum' },
    { value: 'rare', label: 'Raro' },
    { value: 'epic', label: 'Épico' },
    { value: 'legendary', label: 'Lendário' }
  ];

  const statusOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'active', label: 'Ativo' },
    { value: 'inactive', label: 'Inativo' }
  ];

  const sortOptions = [
    { value: 'name', label: 'Nome' },
    { value: 'base_value', label: 'Valor' },
    { value: 'rarity', label: 'Raridade' },
    { value: 'created_at', label: 'Data de Criação' }
  ];

  const densityIcons = {
    compact: <Minimize2 className="h-4 w-4" />,
    normal: <LayoutGrid className="h-4 w-4" />,
    comfortable: <Maximize2 className="h-4 w-4" />
  };

  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar itens por nome..."
          onChange={handleSearchChange}
          className="pl-10"
        />
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={(value) => onSort(value, sortOrder)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSortOrder}
              className="p-2"
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>

          {/* Rarity Filter */}
          {onRarityFilter && (
            <Select value={rarityFilter || 'all'} onValueChange={onRarityFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {rarityOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Status Filter */}
          {onStatusFilter && (
            <Select value={statusFilter || 'all'} onValueChange={onStatusFilter}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* View and Density Controls */}
        <div className="flex items-center gap-2">
          {/* Density Control */}
          {onDensityChange && (
            <div className="flex rounded-md border">
              {(['compact', 'normal', 'comfortable'] as const).map((d) => (
                <Button
                  key={d}
                  variant={density === d ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onDensityChange(d)}
                  className="rounded-none first:rounded-l-md last:rounded-r-md"
                  title={d === 'compact' ? 'Compacto' : d === 'normal' ? 'Normal' : 'Confortável'}
                >
                  {densityIcons[d]}
                </Button>
              ))}
            </div>
          )}

          {/* View Mode Control */}
          {onViewModeChange && (
            <div className="flex rounded-md border">
              <Button
                variant={viewMode === 'table' ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewModeChange('table')}
                className="rounded-none rounded-l-md"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewModeChange('grid')}
                className="rounded-none rounded-r-md"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemSearchAndFilters;