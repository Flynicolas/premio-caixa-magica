
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { toISODate, debugDate, isValidDate } from '@/utils/dateUtils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DatePickerProps {
  id: string;
  label: string;
  value?: string;
  onChange: (date: string) => void;
  placeholder?: string;
}

const DatePicker = ({
  id,
  label,
  value,
  onChange,
  placeholder = "Selecione uma data"
}: DatePickerProps) => {
  const [internalValue, setInternalValue] = useState(value || '');

  // Sincronizar com prop value
  useEffect(() => {
    setInternalValue(value || '');
  }, [value]);

  const handleNativeDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    
    debugDate(`DatePicker input change for ${id}`, dateValue);
    
    setInternalValue(dateValue);
    
    // Converter para ISO e notificar
    const isoDate = toISODate(dateValue);
    if (isoDate || !dateValue) {
      onChange(dateValue); // Manter formato nativo do input
    } else {
      console.warn('Data inválida no DatePicker:', dateValue);
    }
  };

  // Para desktop, usar input nativo que é muito mais fácil para navegar anos
  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}
      <Input
        id={id}
        type="date"
        value={internalValue}
        onChange={handleNativeDateChange}
        max={new Date().toISOString().split('T')[0]}
        min="1900-01-01"
        className="w-full"
        placeholder={placeholder}
      />
    </div>
  );
};

export default DatePicker;
