import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DatabaseItem } from '@/types/database';
import { useImageUpload } from '@/hooks/useImageUpload';
import ItemChestAssignment from './ItemChestAssignment';
import ItemBasicInfoForm from './EnhancedItemEditDialog/ItemBasicInfoForm';
import ItemImageUploadForm from './EnhancedItemEditDialog/ItemImageUploadForm';
import ItemDeliveryForm from './EnhancedItemEditDialog/ItemDeliveryForm';
import SaveConfirmationAlert from './EnhancedItemEditDialog/SaveConfirmationAlert';

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
    rarity: 'common',
    category: 'product',
    delivery_type: 'digital',
    is_active: true,
    image_url: '',
    requires_address: false,
    requires_document: false,
    delivery_instructions: ''
  }));
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [saving, setSaving] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

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

  const handleFormDataChange = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
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

        <SaveConfirmationAlert
          isVisible={showConfirmation}
          saving={saving}
          onConfirm={handleSaveConfirm}
          onCancel={() => setShowConfirmation(false)}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ItemBasicInfoForm
            formData={{
              name: formData.name,
              description: formData.description,
              base_value: formData.base_value,
              rarity: formData.rarity,
              category: formData.category
            }}
            onFormDataChange={handleFormDataChange}
          />

          <div className="space-y-4">
            <ItemImageUploadForm
              imageUrl={formData.image_url}
              uploading={uploading}
              onImageChange={handleImageChange}
              fileInputRef={fileInputRef}
            />

            <ItemDeliveryForm
              formData={{
                delivery_type: formData.delivery_type,
                is_active: formData.is_active,
                requires_address: formData.requires_address,
                requires_document: formData.requires_document
              }}
              onFormDataChange={handleFormDataChange}
            />
          </div>

          <div className="md:col-span-2">
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
