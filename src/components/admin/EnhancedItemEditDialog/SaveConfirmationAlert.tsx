
import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface SaveConfirmationAlertProps {
  isVisible: boolean;
  saving: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const SaveConfirmationAlert: React.FC<SaveConfirmationAlertProps> = ({
  isVisible,
  saving,
  onConfirm,
  onCancel
}) => {
  if (!isVisible) return null;

  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Tem certeza que deseja salvar as alterações? Esta ação atualizará o item no banco de dados.
        <div className="flex space-x-2 mt-3">
          <Button size="sm" onClick={onConfirm} disabled={saving}>
            {saving ? 'Salvando...' : 'Confirmar'}
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default SaveConfirmationAlert;
