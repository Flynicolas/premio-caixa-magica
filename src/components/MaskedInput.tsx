
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface MaskedInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type: 'cpf' | 'phone' | 'text';
  placeholder?: string;
  required?: boolean;
}

const MaskedInput = ({
  id,
  label,
  value,
  onChange,
  type,
  placeholder,
  required = false
}: MaskedInputProps) => {
  const formatValue = (inputValue: string, maskType: string) => {
    const numbers = inputValue.replace(/\D/g, '');
    
    switch (maskType) {
      case 'cpf':
        if (numbers.length <= 11) {
          return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        }
        return inputValue;
      
      case 'phone':
        if (numbers.length <= 10) {
          return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        } else if (numbers.length <= 11) {
          return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        }
        return inputValue;
      
      default:
        return inputValue;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatValue(e.target.value, type);
    onChange(formattedValue);
  };

  return (
    <div>
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input
        id={id}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
      />
    </div>
  );
};

export default MaskedInput;
