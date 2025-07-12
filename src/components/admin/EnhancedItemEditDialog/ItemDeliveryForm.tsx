
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ItemDeliveryFormProps {
  formData: {
    delivery_type: string;
    is_active: boolean;
    requires_address: boolean;
    requires_document: boolean;
  };
  onFormDataChange: (updates: Partial<typeof formData>) => void;
}

const ItemDeliveryForm: React.FC<ItemDeliveryFormProps> = ({ formData, onFormDataChange }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Tipo de Entrega</Label>
        <Select value={formData.delivery_type} onValueChange={(value) => onFormDataChange({ delivery_type: value })}>
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
          onCheckedChange={(checked) => onFormDataChange({ is_active: checked })}
        />
        <Label htmlFor="is_active">Item Ativo</Label>
        <p className="text-xs text-gray-500">Se desabilitado, não aparecerá nos baús</p>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="requires_address"
          checked={formData.requires_address}
          onCheckedChange={(checked) => onFormDataChange({ requires_address: checked })}
        />
        <Label htmlFor="requires_address">Requer Endereço</Label>
        <p className="text-xs text-gray-500">Para itens físicos que precisam de entrega</p>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="requires_document"
          checked={formData.requires_document}
          onCheckedChange={(checked) => onFormDataChange({ requires_document: checked })}
        />
        <Label htmlFor="requires_document">Requer Documento</Label>
        <p className="text-xs text-gray-500">Para itens que precisam de documentação</p>
      </div>
    </div>
  );
};

export default ItemDeliveryForm;
