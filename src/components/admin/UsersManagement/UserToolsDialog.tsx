
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Settings, 
  UserCheck, 
  UserX, 
  DollarSign, 
  RotateCcw,
  AlertTriangle,
  Gift
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UserToolsDialogProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const UserToolsDialog = ({ user, isOpen, onClose, onUpdate }: UserToolsDialogProps) => {
  const [bonusAmount, setBonusAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleToggleUserStatus = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !user.is_active })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: user.is_active ? "Usuário bloqueado!" : "Usuário desbloqueado!",
        description: `O usuário foi ${user.is_active ? 'bloqueado' : 'desbloqueado'} com sucesso.`
      });

      onUpdate();
    } catch (error: any) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro ao alterar status",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddBonus = async () => {
    if (!user || !bonusAmount || parseFloat(bonusAmount) <= 0) {
      toast({
        title: "Valor inválido",
        description: "Por favor, insira um valor válido para o bônus.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const amount = parseFloat(bonusAmount);

      // Atualizar saldo da carteira
      const { error: walletError } = await supabase
        .from('user_wallets')
        .update({ 
          balance: user.balance + amount,
          total_deposited: (user.total_deposited || 0) + amount
        })
        .eq('user_id', user.id);

      if (walletError) throw walletError;

      // Registrar a transação
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          wallet_id: user.id, // Assumindo que wallet_id é o mesmo que user_id
          type: 'bonus',
          amount: amount,
          description: `Bônus adicionado pelo administrador`,
          status: 'completed'
        });

      if (transactionError) throw transactionError;

      toast({
        title: "Bônus adicionado!",
        description: `R$ ${amount.toFixed(2)} foram adicionados ao saldo do usuário.`
      });

      setBonusAmount('');
      onUpdate();
    } catch (error: any) {
      console.error('Erro ao adicionar bônus:', error);
      toast({
        title: "Erro ao adicionar bônus",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetUserData = async () => {
    if (!user) return;
    
    const confirmReset = confirm(
      `Tem certeza que deseja resetar todos os dados do usuário ${user.email}? Esta ação não pode ser desfeita.`
    );
    
    if (!confirmReset) return;

    setLoading(true);
    try {
      // Resetar carteira
      const { error: walletError } = await supabase
        .from('user_wallets')
        .update({ 
          balance: 0,
          total_deposited: 0,
          total_withdrawn: 0,
          total_spent: 0
        })
        .eq('user_id', user.id);

      if (walletError) throw walletError;

      // Resetar perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          chests_opened: 0,
          total_spent: 0,
          total_prizes_won: 0,
          experience_points: 0,
          level: 1
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      toast({
        title: "Dados resetados!",
        description: "Todos os dados do usuário foram resetados com sucesso."
      });

      onUpdate();
    } catch (error: any) {
      console.error('Erro ao resetar dados:', error);
      toast({
        title: "Erro ao resetar dados",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Ferramentas do Usuário: {user.email}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status do Usuário</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    Status Atual: 
                    <span className={`ml-2 ${user.is_active ? 'text-green-600' : 'text-red-600'}`}>
                      {user.is_active ? 'Ativo' : 'Bloqueado'}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    {user.is_active 
                      ? 'O usuário pode fazer login e usar o sistema normalmente'
                      : 'O usuário está bloqueado e não pode acessar o sistema'
                    }
                  </p>
                </div>
                <Button
                  onClick={handleToggleUserStatus}
                  disabled={loading}
                  variant={user.is_active ? "destructive" : "default"}
                >
                  {user.is_active ? (
                    <>
                      <UserX className="w-4 h-4 mr-2" />
                      Bloquear
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4 mr-2" />
                      Desbloquear
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Adicionar Saldo Bônus</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bonus">Valor do Bônus (R$)</Label>
                <Input
                  id="bonus"
                  type="number"
                  step="0.01"
                  value={bonusAmount}
                  onChange={(e) => setBonusAmount(e.target.value)}
                  placeholder="0.00"
                />
                <p className="text-sm text-gray-600">
                  Saldo atual: R$ {user.balance?.toFixed(2) || '0.00'}
                </p>
              </div>
              <Button onClick={handleAddBonus} disabled={loading || !bonusAmount}>
                <Gift className="w-4 h-4 mr-2" />
                Adicionar Bônus
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-red-600">Zona de Perigo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  As ações abaixo são permanentes e não podem ser desfeitas. Use com cuidado.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div>
                  <h4 className="font-medium mb-2">Resetar Dados do Usuário</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Remove todo o histórico, saldo, baús abertos e estatísticas do usuário.
                  </p>
                  <Button
                    onClick={handleResetUserData}
                    disabled={loading}
                    variant="destructive"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Resetar Todos os Dados
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserToolsDialog;
