import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PixKeyFormProps {
  pixKeyType: string;
  pixKey: string;
  onPixKeyTypeChange: (value: string) => void;
  onPixKeyChange: (value: string) => void;
}

export const PixKeyForm = ({ 
  pixKeyType, 
  pixKey, 
  onPixKeyTypeChange, 
  onPixKeyChange 
}: PixKeyFormProps) => {
  
  const formatPixKey = (value: string, type: string) => {
    switch (type) {
      case 'cpf':
        // Format CPF: 000.000.000-00
        const cpf = value.replace(/\D/g, '').slice(0, 11);
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      case 'cnpj':
        // Format CNPJ: 00.000.000/0000-00
        const cnpj = value.replace(/\D/g, '').slice(0, 14);
        return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
      case 'telefone':
        // Format phone: (00) 00000-0000
        const phone = value.replace(/\D/g, '').slice(0, 11);
        if (phone.length <= 10) {
          return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      default:
        return value;
    }
  };

  const getPlaceholder = (type: string) => {
    switch (type) {
      case 'cpf':
        return '000.000.000-00';
      case 'cnpj':
        return '00.000.000/0000-00';
      case 'email':
        return 'seu@email.com';
      case 'telefone':
        return '(11) 99999-9999';
      case 'aleatoria':
        return 'Chave aleatória gerada pelo banco';
      default:
        return 'Digite sua chave PIX';
    }
  };

  const validatePixKey = (value: string, type: string) => {
    switch (type) {
      case 'cpf':
        const cpfNumbers = value.replace(/\D/g, '');
        return cpfNumbers.length === 11;
      case 'cnpj':
        const cnpjNumbers = value.replace(/\D/g, '');
        return cnpjNumbers.length === 14;
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'telefone':
        const phoneNumbers = value.replace(/\D/g, '');
        return phoneNumbers.length >= 10 && phoneNumbers.length <= 11;
      case 'aleatoria':
        return value.length >= 32; // Chaves aleatórias são UUID
      default:
        return value.length > 0;
    }
  };

  const handlePixKeyChange = (value: string) => {
    const formatted = formatPixKey(value, pixKeyType);
    onPixKeyChange(formatted);
  };

  const isValid = pixKey && validatePixKey(pixKey, pixKeyType);

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-medium">Tipo da Chave PIX</Label>
        <Select value={pixKeyType} onValueChange={onPixKeyTypeChange}>
          <SelectTrigger className="mt-2 h-12 border-primary/30">
            <SelectValue placeholder="Selecione o tipo da chave" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cpf">CPF</SelectItem>
            <SelectItem value="cnpj">CNPJ</SelectItem>
            <SelectItem value="email">E-mail</SelectItem>
            <SelectItem value="telefone">Telefone</SelectItem>
            <SelectItem value="aleatoria">Chave Aleatória</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {pixKeyType && (
        <div>
          <Label className="text-base font-medium">
            Chave PIX ({pixKeyType.charAt(0).toUpperCase() + pixKeyType.slice(1)})
          </Label>
          <div className="mt-2 relative">
            <Input
              type="text"
              value={pixKey}
              onChange={(e) => handlePixKeyChange(e.target.value)}
              placeholder={getPlaceholder(pixKeyType)}
              className={`h-12 border-primary/30 ${
                pixKey && !isValid ? 'border-red-500' : 
                pixKey && isValid ? 'border-green-500' : ''
              }`}
            />
            {pixKey && (
              <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                isValid ? 'text-green-500' : 'text-red-500'
              }`}>
                {isValid ? '✓' : '✗'}
              </div>
            )}
          </div>
          {pixKey && !isValid && (
            <p className="text-sm text-red-500 mt-1">
              {pixKeyType === 'cpf' && 'CPF deve ter 11 dígitos'}
              {pixKeyType === 'cnpj' && 'CNPJ deve ter 14 dígitos'}
              {pixKeyType === 'email' && 'Digite um e-mail válido'}
              {pixKeyType === 'telefone' && 'Telefone deve ter 10 ou 11 dígitos'}
              {pixKeyType === 'aleatoria' && 'Chave aleatória inválida'}
            </p>
          )}
          
          <div className="mt-2 text-xs text-muted-foreground">
            {pixKeyType === 'cpf' && 'Digite apenas os números do CPF'}
            {pixKeyType === 'cnpj' && 'Digite apenas os números do CNPJ'}
            {pixKeyType === 'email' && 'Digite o e-mail cadastrado como chave PIX'}
            {pixKeyType === 'telefone' && 'Digite o telefone com DDD'}
            {pixKeyType === 'aleatoria' && 'Cole a chave aleatória gerada pelo seu banco'}
          </div>
        </div>
      )}
    </div>
  );
};