
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseItem } from '@/types/database';
import { Plus, Edit3, Trash2, Save, X, Upload, Image as ImageIcon } from 'lucide-react';
import ItemImageUploader from './ItemImageUploader';

interface AdminItemManagerProps {
  items: DatabaseItem[];
  onRefresh: () => void;
}

const AdminItemManager: React.FC<AdminItemManagerProps> = ({ items, onRefresh }) => {
  const [editingItem, setEditingItem] = useState<DatabaseItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<DatabaseItem>>({});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const rarityOptions = [
    { value: 'common', label: 'Comum', color: 'bg-gray-100 text-gray-800' },
    { value: 'rare', label: 'Raro', color: 'bg-blue-100 text-blue-800' },
    { value: 'epic', label: 'Épico', color: 'bg-purple-100 text-purple-800' },
    { value: 'legendary', label: 'Lendário', color: 'bg-yellow-100 text-yellow-800' }
  ];

  const categoryOptions = [
    { value: 'product', label: 'Produto' },
    { value: 'money', label: 'Dinheiro' },
    { value: 'voucher', label: 'Voucher' }
  ];

  const deliveryTypeOptions = [
    { value: 'digital', label: 'Digital' },
    { value: 'physical', label: 'Físico' }
  ];

  const initializeForm = (item?: DatabaseItem) => {
    if (item) {
      setFormData({ ...item });
      setEditingItem(item);
    } else {
      setFormData({
        name: '',
        description: '',
        base_value: 0,
        rarity: 'common',
        category: 'product',
        delivery_type: 'digital',
        is_active: true,
        requires_address: false,
        requires_document: false,
        chest_types: []
      });
      setIsCreating(true);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.base_value) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e valor são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        // Atualizar item existente
        const { error } = await supabase
          .from('items')
          .update({
            name: formData.name,
            description: formData.description,
            base_value: formData.base_value,
            rarity: formData.rarity,
            category: formData.category,
            delivery_type: formData.delivery_type,
            is_active: formData.is_active,
            requires_address: formData.requires_address,
            requires_document: formData.requires_document,
            chest_types: formData.chest_types || [],
            updated_at: new Date().toISOString()
          })
          .eq('id', editingItem.id);

        if (error) throw error;

        toast({
          title: "Item atualizado!",
          description: `${formData.name} foi atualizado com sucesso.`,
        });
      } else {
        // Criar novo item
        const { error } = await supabase
          .from('items')
          .insert([{
            name: formData.name,
            description: formData.description,
            base_value: formData.base_value,
            rarity: formData.rarity,
            category: formData.category,
            delivery_type: formData.delivery_type,
            is_active: formData.is_active,
            requires_address: formData.requires_address,
            requires_document: formData.requires_document,
            chest_types: formData.chest_types || []
          }]);

        if (error) throw error;

        toast({
          title: "Item criado!",
          description: `${formData.name} foi criado com sucesso.`,
        });
      }

      // Resetar formulário e atualizar lista
      setEditingItem(null);
      setIsCreating(false);
      setFormData({});
      onRefresh();

    } catch (error: any) {
      console.error('Erro ao salvar item:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: DatabaseItem) => {
    if (!confirm(`Tem certeza que deseja excluir "${item.name}"?`)) return;

    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', item.id);

      if (error) throw error;

      toast({
        title: "Item excluído!",
        description: `${item.name} foi removido com sucesso.`,
      });

      onRefresh();
    } catch (error: any) {
      console.error('Erro ao excluir item:', error);
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleImageUpload = async (itemId: string, imageUrl: string) => {
    try {
      const { error } = await supabase
        .from('items')
        .update({ 
          image_url: imageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: "Imagem atualizada!",
        description: "Imagem do item foi atualizada com sucesso.",
      });

      onRefresh();
    } catch (error: any) {
      console.error('Erro ao atualizar imagem:', error);
      throw error;
    }
  };

  const getRarityBadge = (rarity: string) => {
    const rarityInfo = rarityOptions.find(r => r.value === rarity);
    return (
      <Badge className={rarityInfo?.color || rarityOptions[0].color}>
        {rarityInfo?.label || 'Comum'}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Itens ({items.length})</h2>
        <Button onClick={() => initializeForm()}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Item
        </Button>
      </div>

      {/* Lista de Itens */}
      <div className="grid gap-4">
        {items.map((item) => (
          <Card key={item.id} className="relative">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  {/* Imagem */}
                  <div className="relative">
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 rounded-lg border-2 border-gray-300 flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Informações */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold">{item.name}</h3>
                      {getRarityBadge(item.rarity)}
                      <Badge variant={item.is_active ? "default" : "secondary"}>
                        {item.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-green-600">
                          R$ {Number(item.base_value).toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          {categoryOptions.find(c => c.value === item.category)?.label}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          {deliveryTypeOptions.find(d => d.value === item.delivery_type)?.label}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          ID: {item.id.slice(0, 8)}...
                        </span>
                      </div>
                    </div>
                    
                    {item.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Ações */}
                <div className="flex items-center space-x-2">
                  <ItemImageUploader
                    currentImageUrl={item.image_url || undefined}
                    onImageUploaded={(url) => handleImageUpload(item.id, url)}
                    itemId={item.id}
                    itemName={item.name}
                  />
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => initializeForm(item)}
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(item)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de Edição/Criação */}
      <Dialog open={editingItem !== null || isCreating} onOpenChange={(open) => {
        if (!open) {
          setEditingItem(null);
          setIsCreating(false);
          setFormData({});
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? `Editar: ${editingItem.name}` : 'Criar Novo Item'}
            </DialogTitle>
            <DialogDescription>
              {editingItem ? 'Modifique as informações do item abaixo.' : 'Preencha as informações do novo item.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium mb-1">Nome *</label>
              <Input
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome do item"
              />
            </div>
            
            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium mb-1">Descrição</label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição do item"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Valor */}
              <div>
                <label className="block text-sm font-medium mb-1">Valor (R$) *</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.base_value || 0}
                  onChange={(e) => setFormData({ ...formData, base_value: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
              
              {/* Raridade */}
              <div>
                <label className="block text-sm font-medium mb-1">Raridade</label>
                <Select
                  value={formData.rarity || 'common'}
                  onValueChange={(value) => setFormData({ ...formData, rarity: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {rarityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Categoria */}
              <div>
                <label className="block text-sm font-medium mb-1">Categoria</label>
                <Select
                  value={formData.category || 'product'}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Tipo de Entrega */}
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Entrega</label>
                <Select
                  value={formData.delivery_type || 'digital'}
                  onValueChange={(value) => setFormData({ ...formData, delivery_type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {deliveryTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setEditingItem(null);
                setIsCreating(false);
                setFormData({});
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Save className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {editingItem ? 'Salvar Alterações' : 'Criar Item'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminItemManager;
