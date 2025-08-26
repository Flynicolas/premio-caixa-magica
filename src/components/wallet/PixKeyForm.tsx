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
      case 'document':
        // Format CPF/CNPJ
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 11) {
          // CPF: 000.000.000-00
          return numbers.slice(0, 11).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        } else {
          // CNPJ: 00.000.000/0000-00
          return numbers.slice(0, 14).replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
        }
      case 'phoneNumber':
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
      case 'document':
        return '000.000.000-00 ou 00.000.000/0000-00';
      case 'phoneNumber':
        return '(11) 99999-9999';
      case 'email':
        return 'seu@email.com';
      case 'randomKey':
        return 'Chave aleatória gerada pelo banco';
      case 'paymentCode':
        return 'Cole o código do QR Code';
      default:
        return 'Digite sua chave PIX';
    }
  };

  const validatePixKey = (value: string, type: string) => {
    switch (type) {
      case 'document':
        const numbers = value.replace(/\D/g, '');
        return numbers.length === 11 || numbers.length === 14; // CPF ou CNPJ
      case 'phoneNumber':
        const phoneNumbers = value.replace(/\D/g, '');
        return phoneNumbers.length >= 10 && phoneNumbers.length <= 11;
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'randomKey':
        return value.length >= 32; // Chaves aleatórias são UUID
      case 'paymentCode':
        return value.length > 10; // Códigos QR geralmente são longos
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
            <SelectItem value="document">CPF/CNPJ</SelectItem>
            <SelectItem value="phoneNumber">Telefone</SelectItem>
            <SelectItem value="email">E-mail</SelectItem>
            <SelectItem value="randomKey">Chave Aleatória</SelectItem>
            <SelectItem value="paymentCode">QR Code</SelectItem>
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
              {pixKeyType === 'document' && 'CPF deve ter 11 dígitos ou CNPJ 14 dígitos'}
              {pixKeyType === 'phoneNumber' && 'Telefone deve ter 10 ou 11 dígitos'}
              {pixKeyType === 'email' && 'Digite um e-mail válido'}
              {pixKeyType === 'randomKey' && 'Chave aleatória inválida'}
              {pixKeyType === 'paymentCode' && 'Código QR inválido'}
            </p>
          )}
          
          <div className="mt-2 text-xs text-muted-foreground">
            {pixKeyType === 'document' && 'Digite apenas os números do CPF ou CNPJ'}
            {pixKeyType === 'phoneNumber' && 'Digite o telefone com DDD'}
            {pixKeyType === 'email' && 'Digite o e-mail cadastrado como chave PIX'}
            {pixKeyType === 'randomKey' && 'Cole a chave aleatória gerada pelo seu banco'}
            {pixKeyType === 'paymentCode' && 'Cole o código completo do QR Code PIX'}
          </div>
        </div>
      )}
    </div>
  );
};