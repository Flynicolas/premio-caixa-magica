
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Save, X, History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UserEditDialogProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const UserEditDialog = ({ user, isOpen, onClose, onSave }: UserEditDialogProps) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    bio: ''
  });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        bio: user.bio || ''
      });
      fetchUserTransactions();
    }
  }, [user, isOpen]);

  const fetchUserTransactions = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar transações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name || null,
          bio: formData.bio || null
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Usuário atualizado!",
        description: "As informações foram salvas com sucesso."
      });

      onSave();
    } catch (error: any) {
      console.error('Erro ao salvar usuário:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getTransactionTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'deposit': 'Depósito',
      'purchase': 'Compra',
      'withdrawal': 'Saque',
      'bonus': 'Bônus'
    };
    return types[type] || type;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'completed': 'text-green-600',
      'pending': 'text-yellow-600',
      'failed': 'text-red-600',
      'cancelled': 'text-gray-600'
    };
    return colors[status] || 'text-gray-600';
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Usuário: {user.email}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={formData.email}
                    disabled
                    className="bg-gray-100"
                  />
                  <p className="text-xs text-gray-500">O email não pode ser alterado</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_name">Nome Completo</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Nome completo do usuário"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Biografia</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Biografia do usuário..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estatísticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Saldo Atual:</p>
                    <p className="font-semibold text-green-600">R$ {user.balance?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Gasto:</p>
                    <p className="font-semibold">R$ {user.total_spent?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Baús Abertos:</p>
                    <p className="font-semibold">{user.chests_opened || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Cadastro:</p>
                    <p className="font-semibold">{formatDate(user.created_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Histórico de Transações
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="ml-2">Carregando...</p>
                  </div>
                ) : transactions.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Nenhuma transação encontrada</p>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="border-b pb-3 last:border-b-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{getTransactionTypeLabel(transaction.type)}</p>
                            <p className="text-sm text-gray-600">{transaction.description}</p>
                            <p className="text-xs text-gray-500">{formatDate(transaction.created_at)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              R$ {Number(transaction.amount).toFixed(2)}
                            </p>
                            <p className={`text-xs capitalize ${getStatusColor(transaction.status)}`}>
                              {transaction.status}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserEditDialog;
