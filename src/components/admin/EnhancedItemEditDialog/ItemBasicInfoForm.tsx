
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ItemBasicInfoFormProps {
  formData: {
    name: string;
    description: string;
    base_value: string;
    rarity: string;
    category: string;
  };
  onFormDataChange: (updates: Partial<typeof formData>) => void;
}

const ItemBasicInfoForm: React.FC<ItemBasicInfoFormProps> = ({ formData, onFormDataChange }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do Item *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onFormDataChange({ name: e.target.value })}
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
          onChange={(e) => onFormDataChange({ base_value: e.target.value })}
          placeholder="0.00"
        />
        <p className="text-xs text-gray-500">Valor do item em reais</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="rarity">Raridade</Label>
        <Select value={formData.rarity} onValueChange={(value) => onFormDataChange({ rarity: value })}>
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
        <Select value={formData.category} onValueChange={(value) => onFormDataChange({ category: value })}>
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

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onFormDataChange({ description: e.target.value })}
          placeholder="Descrição detalhada do item..."
          rows={3}
        />
        <p className="text-xs text-gray-500">Descrição que aparecerá para os usuários</p>
      </div>
    </div>
  );
};

export default ItemBasicInfoForm;
