
import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
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
  const [date, setDate] = useState<Date | undefined>(
    value ? new Date(value) : undefined
  );

  const handleNativeDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    onChange(dateValue);
    setDate(dateValue ? new Date(dateValue) : undefined);
  };

  // Para desktop, usar input nativo que é muito mais fácil para navegar anos
  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}
      <Input
        id={id}
        type="date"
        value={value || ''}
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
