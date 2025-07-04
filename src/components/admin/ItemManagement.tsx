
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseItem } from '@/types/database';
import { Plus, Edit, Eye, EyeOff } from 'lucide-react';

interface ItemManagementProps {
  items: DatabaseItem[];
  onRefresh: () => void;
}

const ItemManagement = ({ items, onRefresh }: ItemManagementProps) => {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DatabaseItem | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    category: 'product',
    rarity: 'common',
    base_value: '',
    delivery_type: 'digital',
    requires_address: false,
    requires_document: false,
    is_active: true
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image_url: '',
      category: 'product',
      rarity: 'common',
      base_value: '',
      delivery_type: 'digital',
      requires_address: false,
      requires_document: false,
      is_active: true
    });
  };

  const handleEdit = (item: DatabaseItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      image_url: item.image_url || '',
      category: item.category,
      rarity: item.rarity,
      base_value: item.base_value.toString(),
      delivery_type: item.delivery_type || 'digital',
      requires_address: item.requires_address || false,
      requires_document: item.requires_document || false,
      is_active: item.is_active || true
    });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.base_value) {
      toast({
        title: "Erro",
        description: "Nome e valor são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const itemData = {
        name: formData.name,
        description: formData.description || null,
        image_url: formData.image_url || null,
        category: formData.category,
        rarity: formData.rarity,
        base_value: parseFloat(formData.base_value),
        delivery_type: formData.delivery_type,
        requires_address: formData.requires_address,
        requires_document: formData.requires_document,
        is_active: formData.is_active,
        updated_at: new Date().toISOString()
      };

      let error;
      if (editingItem) {
        ({ error } = await supabase
          .from('items')
          .update(itemData)
          .eq('id', editingItem.id));
      } else {
        ({ error } = await supabase
          .from('items')
          .insert([itemData]));
      }

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Item ${editingItem ? 'atualizado' : 'criado'} com sucesso`,
        variant: "default"
      });

      resetForm();
      setEditingItem(null);
      setIsAddDialogOpen(false);
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleItemStatus = async (item: DatabaseItem) => {
    try {
      const { error } = await supabase
        .from('items')
        .update({ is_active: !item.is_active, updated_at: new Date().toISOString() })
        .eq('id', item.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Item ${!item.is_active ? 'ativado' : 'desativado'} com sucesso`,
        variant: "default"
      });

      onRefresh();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
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

  const ItemDialog = ({ children }: { children: React.ReactNode }) => (
    <Dialog open={isAddDialogOpen || !!editingItem} onOpenChange={(open) => {
      if (!open) {
        setIsAddDialogOpen(false);
        setEditingItem(null);
        resetForm();
      }
    }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? 'Editar Item' : 'Adicionar Novo Item'}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: iPhone 15"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="base_value">Valor (R$) *</Label>
            <Input
              id="base_value"
              type="number"
              step="0.01"
              value={formData.base_value}
              onChange={(e) => setFormData(prev => ({ ...prev, base_value: e.target.value }))}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="product">Produto</SelectItem>
                <SelectItem value="money">Dinheiro</SelectItem>
                <SelectItem value="voucher">Voucher</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rarity">Raridade</Label>
            <Select value={formData.rarity} onValueChange={(value) => setFormData(prev => ({ ...prev, rarity: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="common">Comum</SelectItem>
                <SelectItem value="rare">Raro</SelectItem>
                <SelectItem value="epic">Épico</SelectItem>
                <SelectItem value="legendary">Lendário</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery_type">Tipo de Entrega</Label>
            <Select value={formData.delivery_type} onValueChange={(value) => setFormData(prev => ({ ...prev, delivery_type: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="digital">Digital</SelectItem>
                <SelectItem value="physical">Físico</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">URL da Imagem</Label>
            <Input
              id="image_url"
              value={formData.image_url}
              onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
              placeholder="https://exemplo.com/imagem.jpg"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição do item..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="requires_address"
              checked={formData.requires_address}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requires_address: checked }))}
            />
            <Label htmlFor="requires_address">Requer Endereço</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="requires_document"
              checked={formData.requires_document}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requires_document: checked }))}
            />
            <Label htmlFor="requires_document">Requer Documento</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
            <Label htmlFor="is_active">Item Ativo</Label>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button
            variant="outline"
            onClick={() => {
              setIsAddDialogOpen(false);
              setEditingItem(null);
              resetForm();
            }}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Salvando...' : (editingItem ? 'Atualizar' : 'Criar')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Gestão de Itens ({items.length})</CardTitle>
          <ItemDialog>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Item
            </Button>
          </ItemDialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                )}
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold">{item.name}</h3>
                    <Badge className={`text-white ${getRarityColor(item.rarity)}`}>
                      {item.rarity}
                    </Badge>
                    {!item.is_active && (
                      <Badge variant="secondary">Inativo</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    R$ {item.base_value.toFixed(2)} • {item.category} • {item.delivery_type}
                  </p>
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.description.substring(0, 100)}...
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleItemStatus(item)}
                >
                  {item.is_active ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
                <ItemDialog>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(item)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </ItemDialog>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum item cadastrado ainda.</p>
              <p className="text-sm">Clique em "Adicionar Item" para começar.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ItemManagement;
