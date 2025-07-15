
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, SortAsc, SortDesc, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ItemSearchAndFiltersProps {
  onSearch: (searchTerm: string) => void;
  onSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const ItemSearchAndFilters = ({ onSearch, onSort, sortBy, sortOrder }: ItemSearchAndFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const toggleSortOrder = () => {
    onSort(sortBy, sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleSortByChange = (newSortBy: string) => {
    onSort(newSortBy, sortOrder);
  };

  return (
    <div className="flex flex-col space-y-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar itens por nome..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
<div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-start">
          <Select value={sortBy} onValueChange={handleSortByChange}>
           <SelectTrigger className="w-full sm:w-48">

              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SelectItem value="name" className="flex items-center justify-between">
                      Nome
                      <Info className="w-3 h-3 ml-2" />
                    </SelectItem>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Ordena os itens alfabeticamente pelo nome</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SelectItem value="base_value" className="flex items-center justify-between">
                      Valor
                      <Info className="w-3 h-3 ml-2" />
                    </SelectItem>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Ordena por preço: crescente ou decrescente</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SelectItem value="rarity" className="flex items-center justify-between">
                      Raridade
                      <Info className="w-3 h-3 ml-2" />
                    </SelectItem>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Ordena por raridade ponderada pelo valor (lendário → comum)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSortOrder}
            className="flex items-center space-x-1"
          >
            {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            <span>{sortOrder === 'asc' ? 'Crescente' : 'Decrescente'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ItemSearchAndFilters;
