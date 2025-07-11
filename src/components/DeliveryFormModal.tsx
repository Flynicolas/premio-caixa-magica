import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Truck, MapPin, User, Phone, Mail, Hash } from 'lucide-react';

interface DeliveryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    name: string;
  };
}

interface FormData {
  nome_completo: string;
  cpf: string;
  telefone: string;
  email: string;
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  confirmar: boolean;
}

export const DeliveryFormModal = ({ isOpen, onClose, item }: DeliveryFormModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    nome_completo: '',
    cpf: '',
    telefone: '',
    email: user?.email || '',
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    confirmar: false
  });

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.slice(0, 11);
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 5) return numbers;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.slice(0, 11);
  };

  const isFormValid = () => {
    const requiredFields = [
      'nome_completo', 'cpf', 'telefone', 'email', 'cep', 
      'rua', 'numero', 'bairro', 'cidade', 'estado'
    ] as const;
    
    return requiredFields.every(field => formData[field].trim() !== '') && formData.confirmar;
  };

  const handleSubmit = async () => {
    if (!user || !isFormValid()) {
      toast({
        title: "Formulário incompleto",
        description: "Por favor, preencha todos os campos obrigatórios e confirme os dados.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Salvar dados na tabela entregas
      const { error } = await supabase.from('entregas').insert({
        user_id: user.id,
        item_id: item.id,
        item_nome: item.name,
        nome_completo: formData.nome_completo,
        cpf: formData.cpf,
        telefone: formData.telefone,
        email: formData.email,
        cep: formData.cep,
        rua: formData.rua,
        numero: formData.numero,
        complemento: formData.complemento || null,
        bairro: formData.bairro,
        cidade: formData.cidade,
        estado: formData.estado,
        status: 'Pendente'
      });

      if (error) throw error;

      toast({
        title: "Solicitação enviada!",
        description: "Sua solicitação de entrega foi registrada. Em breve entraremos em contato."
      });

      onClose();
      
      // Reset form
      setFormData({
        nome_completo: '',
        cpf: '',
        telefone: '',
        email: user?.email || '',
        cep: '',
        rua: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        confirmar: false
      });

    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a solicitação. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="w-6 h-6 text-primary" />
            Formulário de Entrega de Prêmio
          </DialogTitle>
          <DialogDescription>
            Preencha os dados para entrega do item: <span className="font-semibold text-foreground">{item.name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Dados Pessoais */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <User className="w-4 h-4" />
              Dados Pessoais
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome_completo">Nome Completo *</Label>
                <Input
                  id="nome_completo"
                  placeholder="Seu nome completo"
                  value={formData.nome_completo}
                  onChange={(e) => handleInputChange('nome_completo', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  placeholder="Apenas números"
                  value={formData.cpf}
                  onChange={(e) => handleInputChange('cpf', formatCPF(e.target.value))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="telefone">
                  <Phone className="w-4 h-4 inline mr-1" />
                  WhatsApp *
                </Label>
                <Input
                  id="telefone"
                  placeholder="WhatsApp com DDD"
                  value={formData.telefone}
                  onChange={(e) => handleInputChange('telefone', formatPhone(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="email">
                  <Mail className="w-4 h-4 inline mr-1" />
                  E-mail *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Seu melhor e-mail"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <MapPin className="w-4 h-4" />
              Endereço de Entrega
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="cep">
                  <Hash className="w-4 h-4 inline mr-1" />
                  CEP *
                </Label>
                <Input
                  id="cep"
                  placeholder="00000-000"
                  value={formData.cep}
                  onChange={(e) => handleInputChange('cep', formatCEP(e.target.value))}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="rua">Rua *</Label>
                <Input
                  id="rua"
                  placeholder="Nome da rua"
                  value={formData.rua}
                  onChange={(e) => handleInputChange('rua', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="numero">Número *</Label>
                <Input
                  id="numero"
                  placeholder="Número"
                  value={formData.numero}
                  onChange={(e) => handleInputChange('numero', e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="complemento">Complemento</Label>
                <Input
                  id="complemento"
                  placeholder="Apartamento, casa, etc."
                  value={formData.complemento}
                  onChange={(e) => handleInputChange('complemento', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="bairro">Bairro *</Label>
                <Input
                  id="bairro"
                  placeholder="Bairro"
                  value={formData.bairro}
                  onChange={(e) => handleInputChange('bairro', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="cidade">Cidade *</Label>
                <Input
                  id="cidade"
                  placeholder="Cidade"
                  value={formData.cidade}
                  onChange={(e) => handleInputChange('cidade', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="estado">Estado *</Label>
                <Input
                  id="estado"
                  placeholder="UF"
                  value={formData.estado}
                  onChange={(e) => handleInputChange('estado', e.target.value.toUpperCase())}
                  maxLength={2}
                />
              </div>
            </div>
          </div>

          {/* Item */}
          <div className="space-y-2">
            <Label>Item</Label>
            <Input value={item.name} disabled className="bg-muted" />
          </div>

          {/* Confirmação */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="confirmar"
              checked={formData.confirmar}
              onCheckedChange={(checked) => handleInputChange('confirmar', !!checked)}
            />
            <Label htmlFor="confirmar" className="text-sm">
              Confirmo que os dados estão corretos para envio *
            </Label>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!isFormValid() || isLoading}
            className="flex-1"
          >
            {isLoading ? "Enviando..." : "Enviar Solicitação"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};