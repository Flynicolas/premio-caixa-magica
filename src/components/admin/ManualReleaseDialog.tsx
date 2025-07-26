import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, Clock, Crown, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ManualReleaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  probabilityId: string;
  itemName: string;
  chestType: string;
  onSuccess: () => void;
}

const ManualReleaseDialog = ({ 
  isOpen, 
  onClose, 
  probabilityId, 
  itemName, 
  chestType, 
  onSuccess 
}: ManualReleaseDialogProps) => {
  const [expiryHours, setExpiryHours] = useState(24);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleRelease = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Buscar dados do item e admin
      const { data: probabilityData, error: probError } = await supabase
        .from('chest_item_probabilities')
        .select('item_id')
        .eq('id', probabilityId)
        .single();

      if (probError) throw probError;

      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', user.id)
        .single();

      if (adminError) throw adminError;

      // Verificar se já existe liberação pendente para este item
      const { data: existingRelease, error: checkError } = await supabase
        .from('manual_item_releases')
        .select('id')
        .eq('probability_id', probabilityId)
        .eq('status', 'pending')
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingRelease) {
        toast({
          title: "Item já liberado",
          description: "Este item já possui uma liberação manual pendente.",
          variant: "destructive"
        });
        return;
      }

      // Criar liberação manual
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + expiryHours);

      const { error: insertError } = await supabase
        .from('manual_item_releases')
        .insert({
          probability_id: probabilityId,
          item_id: probabilityData.item_id,
          chest_type: chestType,
          released_by: adminData.user_id,
          expires_at: expiresAt.toISOString(),
          metadata: {
            admin_email: user.email,
            release_reason: 'Manual admin release',
            expected_expiry_hours: expiryHours
          }
        });

      if (insertError) throw insertError;

      toast({
        title: "Item liberado com sucesso!",
        description: `O item "${itemName}" foi liberado manualmente no baú ${chestType}. Expira em ${expiryHours} horas.`,
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erro ao liberar item:', error);
      toast({
        title: "Erro ao liberar item",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getChestTypeColor = (type: string) => {
    switch (type) {
      case 'silver': return 'bg-gray-400';
      case 'gold': return 'bg-yellow-400';
      case 'delas': return 'bg-green-400';
      case 'diamond': return 'bg-blue-400';
      case 'ruby': return 'bg-red-400';
      case 'premium': return 'bg-purple-400';
      default: return 'bg-gray-400';
    }
  };

  const calculateExpiryDate = () => {
    const date = new Date();
    date.setHours(date.getHours() + expiryHours);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            Liberação Manual de Item
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <div>
              <Label>Item selecionado:</Label>
              <div className="mt-1 p-3 border rounded-lg bg-muted/50">
                <p className="font-semibold">{itemName}</p>
                <Badge className={`${getChestTypeColor(chestType)} text-white mt-1`}>
                  Baú {chestType}
                </Badge>
              </div>
            </div>

            <div>
              <Label htmlFor="expiryHours">Tempo para expiração (horas):</Label>
              <Select value={expiryHours.toString()} onValueChange={(value) => setExpiryHours(Number(value))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hora</SelectItem>
                  <SelectItem value="6">6 horas</SelectItem>
                  <SelectItem value="12">12 horas</SelectItem>
                  <SelectItem value="24">24 horas (recomendado)</SelectItem>
                  <SelectItem value="48">48 horas</SelectItem>
                  <SelectItem value="72">72 horas</SelectItem>
                  <SelectItem value="168">1 semana</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                Expira em: {calculateExpiryDate()}
              </div>
            </div>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Como funciona:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• O item será priorizado nos próximos sorteios do baú {chestType}</li>
                <li>• Apenas UM usuário receberá este item</li>
                <li>• Após sorteado, o item será marcado como "sorteado"</li>
                <li>• Se não for sorteado até expirar, voltará ao sorteio normal</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleRelease}
              className="flex-1"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Liberando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  Liberar Item
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManualReleaseDialog;