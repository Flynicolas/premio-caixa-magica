
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit3, Check, X, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EditableItemFieldProps {
  value: string | number;
  onSave: (newValue: any) => Promise<void>;
  type?: 'text' | 'number' | 'select';
  selectOptions?: { value: string; label: string }[];
  fieldName?: string;
  disabled?: boolean;
  className?: string;
  prefix?: string;
}

const EditableItemField: React.FC<EditableItemFieldProps> = ({
  value,
  onSave,
  type = 'text',
  selectOptions,
  fieldName = 'Campo',
  disabled = false,
  className = '',
  prefix = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleStartEdit = () => {
    setTempValue(value);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
  };

  const handleConfirmSave = () => {
    if (tempValue === value) {
      setIsEditing(false);
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(tempValue);
      setIsEditing(false);
      setShowConfirmDialog(false);
      toast({
        title: "Campo atualizado!",
        description: `${fieldName} foi alterado com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a alteração.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderInput = () => {
    if (type === 'select' && selectOptions) {
      return (
        <Select value={String(tempValue)} onValueChange={setTempValue}>
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {selectOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    return (
      <Input
        type={type}
        value={String(tempValue)}
        onChange={(e) => setTempValue(type === 'number' ? Number(e.target.value) : e.target.value)}
        className="h-8"
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleConfirmSave();
          if (e.key === 'Escape') handleCancel();
        }}
      />
    );
  };

  if (!isEditing) {
    return (
      <div className={`flex items-center justify-between group ${className}`}>
        <span className="flex-1">{prefix}{String(value)}</span>
        {!disabled && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleStartEdit}
            className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
          >
            <Edit3 className="w-3 h-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center space-x-2">
        <div className="flex-1">
          {renderInput()}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleConfirmSave}
          disabled={isSaving}
        >
          <Check className="w-3 h-3 text-green-600" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          disabled={isSaving}
        >
          <X className="w-3 h-3 text-red-600" />
        </Button>
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Confirmar Alteração
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja alterar <strong>{fieldName}</strong> de 
              "<strong>{String(value)}</strong>" para "<strong>{String(tempValue)}</strong>"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Salvando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditableItemField;
