
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Trash2, AlertTriangle, RefreshCw } from 'lucide-react';

interface ClearTableButtonProps {
  onTableCleared: () => void;
  totalItems: number;
}

const ClearTableButton: React.FC<ClearTableButtonProps> = ({ onTableCleared, totalItems }) => {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleClearTable = async () => {
    if (confirmation !== 'LIMPAR TABELA') {
      toast({
        title: "Confirmação incorreta",
        description: "Digite exatamente 'LIMPAR TABELA' para confirmar.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase.rpc('clear_items_table');
      
      if (error) throw error;
      
      const deletedCount = data?.[0]?.deleted_count || 0;
      
      toast({
        title: "Tabela limpa com sucesso!",
        description: `${deletedCount} itens foram removidos da tabela.`,
      });
      
      onTableCleared();
      setOpen(false);
      setConfirmation('');
      
    } catch (error: any) {
      console.error('Erro ao limpar tabela:', error);
      toast({
        title: "Erro ao limpar tabela",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="lg">
          <Trash2 className="w-4 h-4 mr-2" />
          Limpar Tabela
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Limpar Tabela de Itens
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>ATENÇÃO: Esta ação é irreversível!</strong>
              <br />
              • Todos os {totalItems} itens serão removidos permanentemente
              <br />
              • Todas as probabilidades de baús serão resetadas
              <br />
              • Não é possível desfazer esta operação
            </AlertDescription>
          </Alert>

          <div>
            <Label htmlFor="confirmation" className="text-sm font-medium">
              Para confirmar, digite: <strong>LIMPAR TABELA</strong>
            </Label>
            <Input
              id="confirmation"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="Digite a confirmação aqui..."
              className="mt-1"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={handleClearTable}
              disabled={confirmation !== 'LIMPAR TABELA' || loading}
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              {loading ? 'Limpando...' : 'Limpar Tabela'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClearTableButton;
