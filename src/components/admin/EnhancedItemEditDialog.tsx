
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, X, Upload, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DatabaseItem } from '@/types/database';
import { useImageUpload } from '@/hooks/useImageUpload';
import ItemChestAssignment from './ItemChestAssignment';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EnhancedItemEditDialogProps {
  item: DatabaseItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: Partial<DatabaseItem>) => Promise<void>;
  uploading?: boolean;
}

const EnhancedItemEditDialog = ({ 
  item, 
  isOpen, 
  onClose, 
  onSave, 
  uploading = false 
}: EnhancedItemEditDialogProps) => {
  const { toast } = useToast();
  const { uploadImage } = useImageUpload();
  const [formData, setFormData] = useState(() => ({
    name: '',
    description: '',
    base_value: '',
    rarity: 'common' as 'common' | 'rare' | 'epic' | 'legendary',
    category: 'product',
    delivery_type: 'digital' as 'digital' | 'physical',
    is_active: true,
    image_url: '',
    requires_address: false,
    requires_document: false,
    delivery_instructions: ''
  }));
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [saving, setSaving] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Atualizar formData quando o item mudar
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        base_value: item.base_value?.toString() || '',
        rarity: item.rarity || 'common',
        category: item.category || 'product',
        delivery_type: item.delivery_type || 'digital',
        is_active: item.is_active ?? true,
        image_url: item.image_url || '',
        requires_address: item.requires_address || false,
        requires_document: item.requires_document || false,
        delivery_instructions: item.delivery_instructions || ''
      });
    } else {
      // Resetar para valores padrão quando criar novo item
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
        requires_document: false,
        delivery_instructions: ''
      });
    }
  }, [item, isOpen]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = await uploadImage(file, item?.id);
      if (imageUrl) {
        setFormData(prev => ({ ...prev, image_url: imageUrl }));
      }
    }
  };

  const handleSaveConfirm = async () => {
    if (!formData.name || !formData.base_value) {
      toast({
        title: "Erro",
        description: "Nome e valor são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
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
        requires_document: formData.requires_document,
        delivery_instructions: formData.delivery_instructions || null
      };

      await onSave(itemData);
      setShowConfirmation(false);
      onClose();
      
      toast({
        title: "Item salvo!",
        description: "Todas as alterações foram salvas com sucesso.",
      });
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {item ? `Editar Item: ${item.name}` : 'Novo Item'}
          </DialogTitle>
        </DialogHeader>

        {showConfirmation && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Tem certeza que deseja salvar as alterações? Esta ação atualizará o item no banco de dados.
              <div className="flex space-x-2 mt-3">
                <Button size="sm" onClick={handleSaveConfirm} disabled={saving}>
                  {saving ? 'Salvando...' : 'Confirmar'}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowConfirmation(false)}>
                  Cancelar
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Item *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Digite o nome do item"
              />
              <p className="text-xs text-gray-500">Nome que aparecerá para os usuários</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="base_value">Valor Base (R$) *</Label>
              <Input
                id="base_value"
                type="number"
                step="0.01"
                value={formData.base_value}
                onChange={(e) => setFormData(prev => ({ ...prev, base_value: e.target.value }))}
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500">Valor do item em reais</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rarity">Raridade</Label>
              <Select value={formData.rarity} onValueChange={(value) => setFormData(prev => ({ ...prev, rarity: value as any }))}>
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
              <p className="text-xs text-gray-500">Define a raridade e cor do item</p>
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
              <p className="text-xs text-gray-500">Tipo de item para organização</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image">Imagem do Item</Label>
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
              <p className="text-xs text-gray-500">Imagem que será exibida no item</p>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Entrega</Label>
              <Select value={formData.delivery_type} onValueChange={(value) => setFormData(prev => ({ ...prev, delivery_type: value as any }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="digital">Digital</SelectItem>
                  <SelectItem value="physical">Físico</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">Como o item será entregue ao usuário</p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="is_active">Item Ativo</Label>
              <p className="text-xs text-gray-500">Se desabilitado, não aparecerá nos baús</p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="requires_address"
                checked={formData.requires_address}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requires_address: checked }))}
              />
              <Label htmlFor="requires_address">Requer Endereço</Label>
              <p className="text-xs text-gray-500">Para itens físicos que precisam de entrega</p>
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição detalhada do item..."
                rows={3}
              />
              <p className="text-xs text-gray-500">Descrição que aparecerá para os usuários</p>
            </div>

            {item && (
              <ItemChestAssignment itemId={item.id} />
            )}
          </div>

          <div className="md:col-span-2 flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={() => setShowConfirmation(true)} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              Salvar Alterações
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedItemEditDialog;
