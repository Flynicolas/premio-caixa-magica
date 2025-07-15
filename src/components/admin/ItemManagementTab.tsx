import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useItemManagement } from '@/hooks/useItemManagement';
import { DatabaseItem } from '@/types/database';
import { 
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus } from 'lucide-react';
import ItemSearchAndFilters from './ItemSearchAndFilters';
import EnhancedItemEditDialog from './EnhancedItemEditDialog';
import ItemTableRow from './ItemManagementTab/ItemTableRow';

const ItemManagementTab = () => {
  const {
    items,
    loading,
    isAdmin,
    updateItem,
    createItem,
    deleteItem,
    refetchItems
  } = useItemManagement();
  
  const [editingItem, setEditingItem] = useState<DatabaseItem | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Estados para busca e filtros
  const [filteredItems, setFilteredItems] = useState<DatabaseItem[]>(items);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  React.useEffect(() => {
    applyFiltersAndSorting();
  }, [items, searchTerm, sortBy, sortOrder]);

  const applyFiltersAndSorting = () => {
    let filtered = [...items];

    // Aplicar busca
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Aplicar ordenação
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'base_value':
          comparison = a.base_value - b.base_value;
          break;
        case 'rarity':
          // Ordenação por raridade ponderada pelo valor
          const rarityOrder = { 'legendary': 4, 'epic': 3, 'rare': 2, 'common': 1 };
          const aScore = rarityOrder[a.rarity] * a.base_value;
          const bScore = rarityOrder[b.rarity] * b.base_value;
          comparison = bScore - aScore; // Decrescente por padrão para raridade
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    setFilteredItems(filtered);
  };

  // Verificar se o usuário é admin
  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
            <p className="text-muted-foreground">Você não tem permissão para gerenciar itens.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleEdit = (item: DatabaseItem) => {
    setEditingItem(item);
    setIsEditDialogOpen(true);
  };

  const handleSave = async (itemData: Partial<DatabaseItem>) => {
    try {
      if (editingItem) {
        await updateItem(editingItem.id, itemData);
      } else {
        await createItem(itemData as Omit<DatabaseItem, 'id' | 'created_at' | 'updated_at'>);
      }
      
      setTimeout(() => {
        refetchItems();
      }, 500);
    } catch (error) {
      console.error('Erro ao salvar item:', error);
      throw error;
    }
  };

  const handleDelete = async (itemId: string, itemName: string) => {
    if (confirm(`Tem certeza que deseja excluir o item "${itemName}"?`)) {
      try {
        await deleteItem(itemId);
        setTimeout(() => {
          refetchItems();
        }, 500);
      } catch (error) {
        console.error('Erro ao deletar item:', error);
      }
    }
  };

  const handleToggleActive = async (item: DatabaseItem) => {
    try {
      await updateItem(item.id, { is_active: !item.is_active });
      setTimeout(() => {
        refetchItems();
      }, 500);
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  };

  const handleSearch = (searchTerm: string) => {
    setSearchTerm(searchTerm);
  };

  const handleSort = (newSortBy: string, newSortOrder: 'asc' | 'desc') => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-3">Carregando itens...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
<CardHeader>
  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
    <CardTitle className="text-lg sm:text-2xl">Gerenciar Itens ({filteredItems.length})</CardTitle>
    <Button onClick={() => setIsCreateDialogOpen(true)} className="w-full sm:w-auto">
      <Plus className="w-4 h-4 mr-2" />
      Adicionar Item
    </Button>
  </div>
</CardHeader>

        <CardContent>
          <ItemSearchAndFilters
            onSearch={handleSearch}
            onSort={handleSort}
            sortBy={sortBy}
            sortOrder={sortOrder}
          />

          {filteredItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm ? 'Nenhum item encontrado para a busca.' : 'Nenhum item encontrado. Adicione seu primeiro item!'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table className="min-w-[700px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Imagem</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Raridade</TableHead>
                    <TableHead>Baús Atribuídos</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <ItemTableRow
                      key={item.id}
                      item={item}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggleActive={handleToggleActive}
                      onUpdate={refetchItems}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <EnhancedItemEditDialog
        item={editingItem}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSave}
      />

      <EnhancedItemEditDialog
        item={null}
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
};

export default ItemManagementTab;
