import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useItemManagement } from '@/hooks/useItemManagement';
import { useImageUpload } from '@/hooks/useImageUpload';
import { DatabaseItem } from '@/types/database';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Edit, Plus, Trash2, Save, X, Upload, Image } from 'lucide-react';

const ItemManagementTab = () => {
  const { toast } = useToast();
  const {
    items,
    loading,
    isAdmin,
    updateItem,
    createItem,
    deleteItem,
    refetchItems
  } = useItemManagement();
  
  const { uploadImage, uploading } = useImageUpload();
  
  const [editingItem, setEditingItem] = useState<DatabaseItem | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    base_value: '',
    rarity: 'common' as 'common' | 'rare' | 'epic' | 'legendary',
    category: 'product',
    delivery_type: 'digital' as 'digital' | 'physical',
    is_active: true,
    image_url: '',
    requires_address: false,
    requires_document: false
  });

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

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      base_value: '',
      rarity: 'common',
      category: 'product',
      delivery_type: 'digital',
      is_active: true,
      image_url: '',
      requires_address: false,
      requires_document: false
    });
  };

  const handleEdit = (item: DatabaseItem) => {
    console.log('Editando item:', item);
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      base_value: item.base_value.toString(),
      rarity: item.rarity,
      category: item.category,
      delivery_type: item.delivery_type || 'digital',
      is_active: item.is_active || true,
      image_url: item.image_url || '',
      requires_address: item.requires_address || false,
      requires_document: item.requires_document || false
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

    const itemData = {
      name: formData.name,
      description: formData.description || null,
      base_value: parseFloat(formData.base_value),
      rarity: formData.rarity,
      category: formData.category,
      delivery_type: formData.delivery_type,
      is_active: formData.is_active,
      image_url: formData.image_url || null,
      requires_address: formData.requires_address,
      requires_document: formData.requires_document
    };

    try {
      if (editingItem) {
        console.log('Salvando alterações no item:', editingItem.id);
        await updateItem(editingItem.id, itemData);
        setEditingItem(null);
      } else {
        console.log('Criando novo item');
        await createItem(itemData as Omit<DatabaseItem, 'id' | 'created_at' | 'updated_at'>);
        setIsCreateDialogOpen(false);
      }
      resetForm();
      
      // Aguardar um pouco e recarregar para garantir sincronização
      setTimeout(() => {
        refetchItems();
      }, 500);
    } catch (error) {
      console.error('Erro ao salvar item:', error);
    }
  };

  const handleDelete = async (itemId: string, itemName: string) => {
    if (confirm(`Tem certeza que deseja excluir o item "${itemName}"?`)) {
      console.log('Deletando item:', itemId);
      try {
        await deleteItem(itemId);
        
        // Aguardar um pouco e recarregar para garantir sincronização
        setTimeout(() => {
          refetchItems();
        }, 500);
      } catch (error) {
        console.error('Erro ao deletar item:', error);
      }
    }
  };

  const handleToggleActive = async (item: DatabaseItem) => {
    console.log('Alterando status ativo do item:', item.id, !item.is_active);
    try {
      await updateItem(item.id, { is_active: !item.is_active });
      
      // Aguardar um pouco e recarregar para garantir sincronização
      setTimeout(() => {
        refetchItems();
      }, 500);
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  };

  const handleImageUpload = async (file: File, itemId?: string) => {
    console.log('Fazendo upload de imagem...');
    const imageUrl = await uploadImage(file, itemId);
    if (imageUrl) {
      console.log('URL da imagem:', imageUrl);
      setFormData(prev => ({ ...prev, image_url: imageUrl }));
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
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
          <div className="flex justify-between items-center">
            <CardTitle>Gerenciar Itens ({items.length})</CardTitle>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Item</DialogTitle>
                </DialogHeader>
                <ItemForm 
                  formData={formData}
                  setFormData={setFormData}
                  onSave={handleSave}
                  onCancel={() => {
                    setIsCreateDialogOpen(false);
                    resetForm();
                  }}
                  onImageUpload={handleImageUpload}
                  uploading={uploading}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum item encontrado. Adicione seu primeiro item!</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Imagem</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Raridade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                            <Image className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{formatCurrency(item.base_value)}</TableCell>
                      <TableCell>
                        <Badge className={`text-white ${getRarityColor(item.rarity)}`}>
                          {item.rarity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={item.is_active}
                          onCheckedChange={() => handleToggleActive(item)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(item)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Editar Item</DialogTitle>
                              </DialogHeader>
                              <ItemForm 
                                formData={formData}
                                setFormData={setFormData}
                                onSave={handleSave}
                                onCancel={() => {
                                  setEditingItem(null);
                                  resetForm();
                                }}
                                onImageUpload={handleImageUpload}
                                uploading={uploading}
                              />
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(item.id, item.name)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const ItemForm = ({ 
  formData, 
  setFormData, 
  onSave, 
  onCancel, 
  onImageUpload, 
  uploading 
}: {
  formData: any;
  setFormData: (data: any) => void;
  onSave: () => void;
  onCancel: () => void;
  onImageUpload: (file: File) => void;
  uploading: boolean;
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Nome do item"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="base_value">Preço (R$) *</Label>
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

      <div className="md:col-span-2 space-y-2">
        <Label htmlFor="image">Imagem</Label>
        <div className="flex items-center space-x-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Enviando...' : 'Upload Imagem'}
          </Button>
          {formData.image_url && (
            <img
              src={formData.image_url}
              alt="Preview"
              className="w-16 h-16 object-cover rounded"
            />
          )}
        </div>
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
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
        />
        <Label htmlFor="is_active">Item Ativo</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="requires_address"
          checked={formData.requires_address}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requires_address: checked }))}
        />
        <Label htmlFor="requires_address">Requer Endereço</Label>
      </div>

      <div className="md:col-span-2 flex justify-end space-x-2 mt-6">
        <Button variant="outline" onClick={onCancel}>
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
        <Button onClick={onSave}>
          <Save className="w-4 h-4 mr-2" />
          Salvar
        </Button>
      </div>
    </div>
  );
};

export default ItemManagementTab;
