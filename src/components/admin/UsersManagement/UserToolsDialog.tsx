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
  Gift,
  Plus,
  Minus,
  ArrowUpDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface UserToolsDialogProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const UserToolsDialog = ({ user, isOpen, onClose, onUpdate }: UserToolsDialogProps) => {
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceOperation, setBalanceOperation] = useState<'add' | 'subtract' | 'set'>('add');
  const [balanceReason, setBalanceReason] = useState('');
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

  const handleBalanceAdjustment = async () => {
    if (!user || !balanceAmount || parseFloat(balanceAmount) <= 0) {
      toast({
        title: "Valor inválido",
        description: "Por favor, insira um valor válido.",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(balanceAmount);
    let newBalance: number;
    let transactionType: string;
    let description: string;

    switch (balanceOperation) {
      case 'add':
        newBalance = user.balance + amount;
        transactionType = 'bonus';
        description = `Bônus adicionado pelo administrador${balanceReason ? `: ${balanceReason}` : ''}`;
        break;
      case 'subtract':
        newBalance = Math.max(0, user.balance - amount);
        transactionType = 'admin_deduction';
        description = `Dedução pelo administrador${balanceReason ? `: ${balanceReason}` : ''}`;
        break;
      case 'set':
        newBalance = amount;
        transactionType = 'admin_adjustment';
        description = `Saldo definido pelo administrador${balanceReason ? `: ${balanceReason}` : ''}`;
        break;
      default:
        return;
    }

    if (balanceOperation === 'subtract' && amount > user.balance) {
      toast({
        title: "Aviso",
        description: `O saldo será zerado pois o valor a deduzir (R$ ${amount.toFixed(2)}) é maior que o saldo atual (R$ ${user.balance.toFixed(2)}).`,
      });
    }

    setLoading(true);
    try {
      // Atualizar saldo da carteira
      const updateData: any = { balance: newBalance };
      
      if (balanceOperation === 'add') {
        updateData.total_deposited = (user.total_deposited || 0) + amount;
      }

      const { error: walletError } = await supabase
        .from('user_wallets')
        .update(updateData)
        .eq('user_id', user.id);

      if (walletError) throw walletError;

      // Registrar a transação
      const transactionAmount = balanceOperation === 'set' 
        ? newBalance - user.balance 
        : (balanceOperation === 'add' ? amount : -amount);

      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          wallet_id: user.id,
          type: transactionType,
          amount: Math.abs(transactionAmount),
          description: description,
          status: 'completed'
        });

      if (transactionError) {
        console.warn('Erro ao registrar transação:', transactionError);
      }

      const operationLabels = {
        add: 'adicionado',
        subtract: 'deduzido',
        set: 'definido'
      };

      toast({
        title: "Saldo atualizado!",
        description: `Saldo ${operationLabels[balanceOperation]} com sucesso. Novo saldo: R$ ${newBalance.toFixed(2)}`
      });

      setBalanceAmount('');
      setBalanceReason('');
      onUpdate();
    } catch (error: any) {
      console.error('Erro ao ajustar saldo:', error);
      toast({
        title: "Erro ao ajustar saldo",
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                  <p className="text-sm text-muted-foreground">
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
              <CardTitle className="text-lg flex items-center gap-2">
                <ArrowUpDown className="w-5 h-5" />
                Ajustar Saldo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-muted-foreground">Saldo atual:</span>
                  <span className="text-xl font-bold text-green-600">
                    R$ {user.balance?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Operação</Label>
                  <Select value={balanceOperation} onValueChange={(v: 'add' | 'subtract' | 'set') => setBalanceOperation(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="add">
                        <div className="flex items-center gap-2">
                          <Plus className="w-4 h-4 text-green-600" />
                          Adicionar saldo
                        </div>
                      </SelectItem>
                      <SelectItem value="subtract">
                        <div className="flex items-center gap-2">
                          <Minus className="w-4 h-4 text-red-600" />
                          Remover saldo
                        </div>
                      </SelectItem>
                      <SelectItem value="set">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-blue-600" />
                          Definir saldo exato
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Valor (R$)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={balanceAmount}
                    onChange={(e) => setBalanceAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Motivo (opcional)</Label>
                <Textarea
                  id="reason"
                  value={balanceReason}
                  onChange={(e) => setBalanceReason(e.target.value)}
                  placeholder="Ex: Compensação por erro, bônus promocional, correção de saldo..."
                  rows={2}
                />
              </div>

              {balanceAmount && parseFloat(balanceAmount) > 0 && (
                <div className="p-3 bg-muted/50 rounded-lg border">
                  <p className="text-sm">
                    <strong>Prévia:</strong>{' '}
                    {balanceOperation === 'add' && (
                      <span className="text-green-600">
                        R$ {user.balance?.toFixed(2)} + R$ {parseFloat(balanceAmount).toFixed(2)} = R$ {(user.balance + parseFloat(balanceAmount)).toFixed(2)}
                      </span>
                    )}
                    {balanceOperation === 'subtract' && (
                      <span className="text-red-600">
                        R$ {user.balance?.toFixed(2)} - R$ {parseFloat(balanceAmount).toFixed(2)} = R$ {Math.max(0, user.balance - parseFloat(balanceAmount)).toFixed(2)}
                      </span>
                    )}
                    {balanceOperation === 'set' && (
                      <span className="text-blue-600">
                        Novo saldo: R$ {parseFloat(balanceAmount).toFixed(2)}
                      </span>
                    )}
                  </p>
                </div>
              )}

              <Button 
                onClick={handleBalanceAdjustment} 
                disabled={loading || !balanceAmount || parseFloat(balanceAmount) <= 0}
                className="w-full"
              >
                {balanceOperation === 'add' && <Plus className="w-4 h-4 mr-2" />}
                {balanceOperation === 'subtract' && <Minus className="w-4 h-4 mr-2" />}
                {balanceOperation === 'set' && <DollarSign className="w-4 h-4 mr-2" />}
                {balanceOperation === 'add' && 'Adicionar Saldo'}
                {balanceOperation === 'subtract' && 'Remover Saldo'}
                {balanceOperation === 'set' && 'Definir Saldo'}
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
                  <p className="text-sm text-muted-foreground mb-3">
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
