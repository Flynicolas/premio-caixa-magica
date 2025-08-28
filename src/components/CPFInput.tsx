import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, CreditCard } from 'lucide-react';

interface CPFInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  validateRealTime?: boolean;
  className?: string;
}

export const CPFInput = ({
  value,
  onChange,
  label = "CPF",
  placeholder = "000.000.000-00",
  required = false,
  validateRealTime = true,
  className = ""
}: CPFInputProps) => {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const formatCPF = (cpf: string) => {
    const numbers = cpf.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const validateCPF = (cpf: string): boolean => {
    const cleanCPF = cpf.replace(/\D/g, '');
    
    if (cleanCPF.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF[i]) * (10 - i);
    }
    let digit = (sum * 10) % 11;
    if (digit === 10 || digit === 11) digit = 0;
    if (digit !== parseInt(cleanCPF[9])) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF[i]) * (11 - i);
    }
    digit = (sum * 10) % 11;
    if (digit === 10 || digit === 11) digit = 0;
    if (digit !== parseInt(cleanCPF[10])) return false;

    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCPF(e.target.value);
    onChange(formattedValue);
  };

  useEffect(() => {
    if (validateRealTime && value) {
      setIsChecking(true);
      const timeoutId = setTimeout(() => {
        const valid = validateCPF(value);
        setIsValid(valid);
        setIsChecking(false);
      }, 500); // Debounce de 500ms

      return () => clearTimeout(timeoutId);
    } else if (!value) {
      setIsValid(null);
      setIsChecking(false);
    }
  }, [value, validateRealTime]);

  const getValidationIcon = () => {
    if (isChecking) return null;
    if (isValid === true) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (isValid === false) return <XCircle className="w-4 h-4 text-red-500" />;
    return null;
  };

  const getValidationMessage = () => {
    if (isChecking) return "Validando CPF...";
    if (isValid === true) return "CPF válido";
    if (isValid === false) return "CPF inválido";
    return null;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="cpf" className="flex items-center gap-2 text-sm">
        <CreditCard className="w-4 h-4" />
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      <div className="relative">
        <Input
          id="cpf"
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          className={`h-11 pr-10 ${
            isValid === false 
              ? 'border-destructive' 
              : isValid === true 
                ? 'border-green-500' 
                : ''
          }`}
          maxLength={14} // 11 números + 3 caracteres de formatação
        />
        
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {getValidationIcon()}
        </div>
      </div>

      {validateRealTime && (
        <div className="min-h-[1rem]">
          {getValidationMessage() && (
            <p className={`text-sm ${
              isValid === true 
                ? 'text-green-600' 
                : isValid === false 
                  ? 'text-red-600' 
                  : 'text-muted-foreground'
            }`}>
              {getValidationMessage()}
            </p>
          )}
        </div>
      )}
    </div>
  );
};