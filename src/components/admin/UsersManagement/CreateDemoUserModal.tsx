
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAdminCheck } from '@/hooks/useAdminCheck';

interface CreateDemoUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateDemoUserModal = ({ isOpen, onClose, onSuccess }: CreateDemoUserModalProps) => {
  const { user } = useAuth();
  const { isAdmin } = useAdminCheck();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    avatar_url: '',
    balance: '0',
    simulate_actions: false
  });
  
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAdmin) {
      toast({
        title: "Acesso negado",
        description: "Apenas administradores podem criar usuários DEMO.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe o nome do usuário.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Gerar um ID único para o usuário demo
      const demoUserId = crypto.randomUUID();
      
      // Criar perfil do usuário demo
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: demoUserId,
          email: `demo_${Date.now()}@demo.local`,
          full_name: formData.name,
          avatar_url: formData.avatar_url || null,
          is_demo: true,
          simulate_actions: formData.simulate_actions,
          is_active: true
        });

      if (profileError) throw profileError;

      // Criar carteira para o usuário demo
      const { error: walletError } = await supabase
        .from('user_wallets')
        .insert({
          user_id: demoUserId,
          balance: parseFloat(formData.balance) || 0,
          total_deposited: parseFloat(formData.balance) || 0
        });

      if (walletError) throw walletError;

      toast({
        title: "Usuário DEMO criado com sucesso ✅",
        description: `${formData.name} foi adicionado como usuário de demonstração.`
      });

      // Reset form
      setFormData({
        name: '',
        avatar_url: '',
        balance: '0',
        simulate_actions: false
      });

      onSuccess();
      onClose();

    } catch (error: any) {
      console.error('Erro ao criar usuário DEMO:', error);
      toast({
        title: "Erro ao criar usuário DEMO",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            ➕ Criar Usuário DEMO
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome de usuário *</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Digite o nome do usuário"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar_url">Avatar URL (opcional)</Label>
            <Input
              id="avatar_url"
              type="url"
              value={formData.avatar_url}
              onChange={(e) => handleInputChange('avatar_url', e.target.value)}
              placeholder="https://exemplo.com/avatar.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="balance">Saldo inicial (R$)</Label>
            <Input
              id="balance"
              type="number"
              min="0"
              step="0.01"
              value={formData.balance}
              onChange={(e) => handleInputChange('balance', e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="simulate_actions"
              checked={formData.simulate_actions}
              onCheckedChange={(checked) => handleInputChange('simulate_actions', checked === true)}
            />
            <Label htmlFor="simulate_actions" className="text-sm">
              Simulação automática ativada?
            </Label>
          </div>
          <p className="text-xs text-muted-foreground">
            Se marcado, entrará na lógica de roleta automática fake visual
          </p>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Criando...' : 'Salvar e Criar DEMO'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDemoUserModal;
