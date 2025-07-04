import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatabaseItem } from '@/types/database';
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Image as ImageIcon,
  Save,
  X
} from 'lucide-react';

interface ItemsSpreadsheetProps {
  items: DatabaseItem[];
  onUpdateItem: (id: string, updates: Partial<DatabaseItem>) => Promise<void>;
  onCreateItem: (item: Omit<DatabaseItem, 'id' | 'created_at' | 'updated_at'>) => Promise<DatabaseItem>;
  onDeleteItem: (id: string) => Promise<void>;
  onBulkUpdate: (ids: string[], updates: Partial<DatabaseItem>) => Promise<void>;
}

const ItemsSpreadsheet: React.FC<ItemsSpreadsheetProps> = ({
  items,
  onUpdateItem,
  onCreateItem,
  onDeleteItem,
  onBulkUpdate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [filterChest, setFilterChest] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<DatabaseItem>>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newItemForm, setNewItemForm] = useState<Partial<DatabaseItem>>({
    name: '',
    base_value: 0,
    rarity: 'common',
    category: 'product',
    delivery_type: 'digital',
    is_active: true
  });

  // Filtrar itens
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (item.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRarity = filterRarity === 'all' || item.rarity === filterRarity;
      
      const matchesChest = filterChest === 'all' || 
                          (item.chest_types && item.chest_types.includes(filterChest));

      return matchesSearch && matchesRarity && matchesChest;
    });
  }, [items, searchTerm, filterRarity, filterChest]);

  // Obter tipos de baú únicos
  const chestTypes = useMemo(() => {
    const types = new Set<string>();
    items.forEach(item => {
      if (item.chest_types && Array.isArray(item.chest_types)) {
        item.chest_types.forEach(type => types.add(type));
      }
    });
    return Array.from(types);
  }, [items]);

  // Cores por raridade
  const rarityColors = {
    common: 'bg-gray-100 text-gray-800',
    rare: 'bg-blue-100 text-blue-800',
    epic: 'bg-purple-100 text-purple-800',
    legendary: 'bg-yellow-100 text-yellow-800'
  };

  // Iniciar edição
  const startEditing = (item: DatabaseItem) => {
    setEditingItem(item.id);
    setEditForm(item);
  };

  // Salvar edição
  const saveEdit = async () => {
    if (!editingItem) return;
    
    await onUpdateItem(editingItem, editForm);
    setEditingItem(null);
    setEditForm({});
  };

  // Cancelar edição
  const cancelEdit = () => {
    setEditingItem(null);
    setEditForm({});
  };

  // Criar novo item
  const createNewItem = async () => {
    if (!newItemForm.name || !newItemForm.base_value) return;
    
    await onCreateItem(newItemForm as Omit<DatabaseItem, 'id' | 'created_at' | 'updated_at'>);
    setShowCreateModal(false);
    setNewItemForm({
      name: '',
      base_value: 0,
      rarity: 'common',
      category: 'product',
      delivery_type: 'digital',
      is_active: true
    });
  };

  // Toggle seleção
  const toggleSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Seleção em massa
  const toggleSelectAll = () => {
    setSelectedItems(prev => 
      prev.length === filteredItems.length ? [] : filteredItems.map(item => item.id)
    );
  };

  return (
    <div className="space-y-6">
      {/* Controles superiores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Gestão de Itens</span>
            <div className="flex items-center space-x-2">
              <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Criar Novo Item</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Nome do Item</Label>
                      <Input
                        value={newItemForm.name || ''}
                        onChange={(e) => setNewItemForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Nome do item"
                      />
                    </div>
                    <div>
                      <Label>Valor (R$)</Label>
                      <Input
                        type="number"
                        value={newItemForm.base_value || 0}
                        onChange={(e) => setNewItemForm(prev => ({ ...prev, base_value: Number(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <Label>Raridade</Label>
                      <Select 
                        value={newItemForm.rarity || 'common'} 
                        onValueChange={(value) => setNewItemForm(prev => ({ ...prev, rarity: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="common">Common</SelectItem>
                          <SelectItem value="rare">Rare</SelectItem>
                          <SelectItem value="epic">Epic</SelectItem>
                          <SelectItem value="legendary">Legendary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Categoria</Label>
                      <Input
                        value={newItemForm.category || ''}
                        onChange={(e) => setNewItemForm(prev => ({ ...prev, category: e.target.value }))}
                        placeholder="Categoria"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Descrição</Label>
                      <Textarea
                        value={newItemForm.description || ''}
                        onChange={(e) => setNewItemForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descrição do item"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>URL da Imagem</Label>
                      <Input
                        value={newItemForm.image_url || ''}
                        onChange={(e) => setNewItemForm(prev => ({ ...prev, image_url: e.target.value }))}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={createNewItem}>
                      Criar Item
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtros */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nome ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterRarity} onValueChange={setFilterRarity}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Raridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="common">Common</SelectItem>
                <SelectItem value="rare">Rare</SelectItem>
                <SelectItem value="epic">Epic</SelectItem>
                <SelectItem value="legendary">Legendary</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterChest} onValueChange={setFilterChest}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Baú" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {chestTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ações em massa */}
          {selectedItems.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-blue-700">
                {selectedItems.length} itens selecionados
              </span>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Editar em Massa
                </Button>
                <Button size="sm" variant="outline">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remover Selecionados
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabela de itens */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">
                    <Checkbox
                      checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </th>
                  <th className="p-3 text-left">Imagem</th>
                  <th className="p-3 text-left">Nome</th>
                  <th className="p-3 text-left">Valor</th>
                  <th className="p-3 text-left">Raridade</th>
                  <th className="p-3 text-left">Categoria</th>
                  <th className="p-3 text-left">Baús</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={() => toggleSelection(item.id)}
                      />
                    </td>
                    <td className="p-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        {item.image_url ? (
                          <img 
                            src={item.image_url} 
                            alt={item.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      {editingItem === item.id ? (
                        <Input
                          value={editForm.name || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full"
                        />
                      ) : (
                        <div>
                          <div className="font-medium">{item.name}</div>
                          {item.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {item.description}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      {editingItem === item.id ? (
                        <Input
                          type="number"
                          value={editForm.base_value || 0}
                          onChange={(e) => setEditForm(prev => ({ ...prev, base_value: Number(e.target.value) }))}
                          className="w-20"
                        />
                      ) : (
                        <span className="font-medium">R$ {Number(item.base_value).toFixed(2)}</span>
                      )}
                    </td>
                    <td className="p-3">
                      {editingItem === item.id ? (
                        <Select 
                          value={editForm.rarity || item.rarity} 
                          onValueChange={(value) => setEditForm(prev => ({ ...prev, rarity: value as any }))}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="common">Common</SelectItem>
                            <SelectItem value="rare">Rare</SelectItem>
                            <SelectItem value="epic">Epic</SelectItem>
                            <SelectItem value="legendary">Legendary</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className={rarityColors[item.rarity]}>
                          {item.rarity}
                        </Badge>
                      )}
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {item.category}
                    </td>
                    <td className="p-3">
                      {item.chest_types && item.chest_types.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {item.chest_types.slice(0, 2).map(type => (
                            <Badge key={type} variant="outline" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                          {item.chest_types.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{item.chest_types.length - 2}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="p-3">
                      <Badge variant={item.is_active ? "default" : "secondary"}>
                        {item.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </td>
                    <td className="p-3">
                      {editingItem === item.id ? (
                        <div className="flex items-center space-x-2">
                          <Button size="sm" onClick={saveEdit}>
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => startEditing(item)}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => onDeleteItem(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Resumo */}
      <div className="text-sm text-gray-500 text-center">
        Mostrando {filteredItems.length} de {items.length} itens
      </div>
    </div>
  );
};

export default ItemsSpreadsheet;
