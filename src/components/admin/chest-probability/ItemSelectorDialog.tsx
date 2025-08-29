import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Package } from 'lucide-react';
import { DatabaseItem } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

interface ItemSelectorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  chestType: string;
  chestName: string;
  availableItems: DatabaseItem[];
  onAddItem: (itemId: string, chestType: string) => Promise<void>;
}

const ItemSelectorDialog = ({ 
  isOpen, 
  onClose, 
  chestType, 
  chestName, 
  availableItems, 
  onAddItem 
}: ItemSelectorDialogProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);
  const { toast } = useToast();

  const filteredItems = availableItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesRarity = rarityFilter === 'all' || item.rarity === rarityFilter;
    
    return matchesSearch && matchesCategory && matchesRarity;
  });

  const categories = [...new Set(availableItems.map(item => item.category))];
  const rarities = [...new Set(availableItems.map(item => item.rarity))];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'hsl(45 93% 47%)';
      case 'epic': return 'hsl(271 91% 65%)';
      case 'rare': return 'hsl(221 83% 53%)';
      default: return 'hsl(var(--muted-foreground))';
    }
  };

  const toggleItemSelection = (itemId: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedItems(newSelection);
  };

  const handleAddSelected = async () => {
    if (selectedItems.size === 0) {
      toast({
        title: "Nenhum item selecionado",
        description: "Selecione pelo menos um item para adicionar ao baú",
        variant: "destructive"
      });
      return;
    }

    setAdding(true);
    try {
      for (const itemId of selectedItems) {
        await onAddItem(itemId, chestType);
      }
      
      toast({
        title: "Itens adicionados!",
        description: `${selectedItems.size} item(s) adicionado(s) ao ${chestName}`,
      });
      
      setSelectedItems(new Set());
      onClose();
    } catch (error: any) {
      console.error('Erro ao adicionar itens:', error);
      toast({
        title: "Erro ao adicionar itens",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setAdding(false);
    }
  };

  const handleClose = () => {
    setSelectedItems(new Set());
    setSearchTerm('');
    setCategoryFilter('all');
    setRarityFilter('all');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Adicionar Itens ao {chestName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar itens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'dinheiro' ? 'Dinheiro' : 
                     category === 'product' ? 'Produto' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={rarityFilter} onValueChange={setRarityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Raridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as raridades</SelectItem>
                {rarities.map(rarity => (
                  <SelectItem key={rarity} value={rarity}>
                    <Badge style={{ backgroundColor: getRarityColor(rarity), color: 'white' }}>
                      {rarity === 'common' ? 'Comum' :
                       rarity === 'rare' ? 'Raro' :
                       rarity === 'epic' ? 'Épico' : 'Lendário'}
                    </Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Estatísticas */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {filteredItems.length} item(s) disponível(is) | {selectedItems.size} selecionado(s)
            </span>
            <span>
              Valor total selecionado: R$ {
                Array.from(selectedItems)
                  .reduce((total, itemId) => {
                    const item = availableItems.find(i => i.id === itemId);
                    return total + (item?.base_value || 0);
                  }, 0)
                  .toFixed(2)
              }
            </span>
          </div>

          {/* Tabela de Itens */}
          <div className="border rounded-lg overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead className="w-12">Sel.</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Raridade</TableHead>
                    <TableHead>Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Nenhum item disponível com os filtros aplicados
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item) => (
                      <TableRow
                        key={item.id}
                        className={`cursor-pointer hover:bg-muted/50 ${
                          selectedItems.has(item.id) ? 'bg-primary/10' : ''
                        }`}
                        onClick={() => toggleItemSelection(item.id)}
                      >
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedItems.has(item.id)}
                            onChange={() => toggleItemSelection(item.id)}
                            className="w-4 h-4"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {item.image_url && (
                              <img 
                                src={item.image_url} 
                                alt={item.name}
                                className="w-8 h-8 object-cover rounded"
                              />
                            )}
                            <div>
                              <div className="font-medium">{item.name}</div>
                              {item.description && (
                                <div className="text-xs text-muted-foreground truncate max-w-xs">
                                  {item.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {item.category === 'dinheiro' ? 'Dinheiro' : 
                             item.category === 'product' ? 'Produto' : item.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge style={{ backgroundColor: getRarityColor(item.rarity), color: 'white' }}>
                            {item.rarity === 'common' ? 'Comum' :
                             item.rarity === 'rare' ? 'Raro' :
                             item.rarity === 'epic' ? 'Épico' : 'Lendário'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono">
                          R$ {item.base_value.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Ações */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAddSelected}
              disabled={selectedItems.size === 0 || adding}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {adding ? 'Adicionando...' : `Adicionar ${selectedItems.size} item(s)`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ItemSelectorDialog;