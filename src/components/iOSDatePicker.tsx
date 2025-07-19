import { useState, useEffect, useRef, useCallback } from 'react';
import { Label } from '@/components/ui/label';

interface iOSDatePickerProps {
  id: string;
  label: string;
  value?: string;
  onChange: (date: string) => void;
}

const IOSDatePicker = ({ id, label, value, onChange }: iOSDatePickerProps) => {
  const [selectedDay, setSelectedDay] = useState('01');
  const [selectedMonth, setSelectedMonth] = useState('01');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [isInitialized, setIsInitialized] = useState(false);

  const dayColumnRef = useRef<HTMLDivElement>(null);
  const monthColumnRef = useRef<HTMLDivElement>(null);
  const yearColumnRef = useRef<HTMLDivElement>(null);

  const dayListRef = useRef<HTMLUListElement>(null);
  const monthListRef = useRef<HTMLUListElement>(null);
  const yearListRef = useRef<HTMLUListElement>(null);

  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  const months = [
    { name: "Jan", value: "01" },
    { name: "Fev", value: "02" },
    { name: "Mar", value: "03" },
    { name: "Abr", value: "04" },
    { name: "Mai", value: "05" },
    { name: "Jun", value: "06" },
    { name: "Jul", value: "07" },
    { name: "Ago", value: "08" },
    { name: "Set", value: "09" },
    { name: "Out", value: "10" },
    { name: "Nov", value: "11" },
    { name: "Dez", value: "12" }
  ];

  // Gerar anos de 1900 até ano atual
  const years = Array.from({ length: new Date().getFullYear() - 1900 + 1 }, (_, i) => 
    (new Date().getFullYear() - i).toString()
  );

  // Gerar dias baseado no mês/ano selecionado
  const getDaysInMonth = useCallback(() => {
    const year = parseInt(selectedYear);
    const month = parseInt(selectedMonth);
    const daysInMonth = new Date(year, month, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString().padStart(2, '0'));
  }, [selectedYear, selectedMonth]);

  const days = getDaysInMonth();

  // Inicializar com valor existente
  useEffect(() => {
    if (value && !isInitialized) {
      const dateParts = value.split('-');
      if (dateParts.length === 3) {
        const [year, month, day] = dateParts;
        setSelectedYear(year);
        setSelectedMonth(month);
        setSelectedDay(day);
      }
      setIsInitialized(true);
    } else if (!value && !isInitialized) {
      setIsInitialized(true);
    }
  }, [value, isInitialized]);

  // Ajustar dia se exceder o máximo do mês
  useEffect(() => {
    if (isInitialized) {
      const maxDay = getDaysInMonth().length;
      const currentDay = parseInt(selectedDay);
      if (currentDay > maxDay) {
        setSelectedDay(maxDay.toString().padStart(2, '0'));
      }
    }
  }, [selectedMonth, selectedYear, selectedDay, getDaysInMonth, isInitialized]);

  // Notificar mudanças
  useEffect(() => {
    if (isInitialized && selectedDay && selectedMonth && selectedYear) {
      const newDate = `${selectedYear}-${selectedMonth}-${selectedDay}`;
      onChange(newDate);
    }
  }, [selectedDay, selectedMonth, selectedYear, onChange, isInitialized]);

  const handleScroll = useCallback((
    column: HTMLDivElement,
    list: HTMLUListElement,
    setter: (value: string) => void,
    items: string[] | { name: string; value: string }[]
  ) => {
    // Limpar timeout anterior
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Debounce para suavizar a experiência
    scrollTimeoutRef.current = setTimeout(() => {
      const itemHeight = 44;
      const scrollCenter = column.scrollTop + column.offsetHeight / 2;
      const index = Math.round((scrollCenter - itemHeight * 1.5) / itemHeight);
      const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
      
      // Scroll suave para o item mais próximo
      const targetScroll = clampedIndex * itemHeight;
      if (Math.abs(column.scrollTop - targetScroll) > 5) {
        column.scrollTo({
          top: targetScroll,
          behavior: 'smooth'
        });
      }

      // Atualizar visual e valor
      const children = Array.from(list.children) as HTMLElement[];
      children.forEach((li, i) => {
        li.classList.toggle('selected', i === clampedIndex);
      });

      // Atualizar estado
      if (typeof items[0] === 'string') {
        setter(items[clampedIndex] as string);
      } else {
        setter((items[clampedIndex] as { value: string }).value);
      }
    }, 50);
  }, []);

  // Função para inicializar posição e visual
  const initializePositions = useCallback(() => {
    const dayColumn = dayColumnRef.current;
    const monthColumn = monthColumnRef.current;
    const yearColumn = yearColumnRef.current;
    const dayList = dayListRef.current;
    const monthList = monthListRef.current;
    const yearList = yearListRef.current;

    if (!dayColumn || !monthColumn || !yearColumn || !dayList || !monthList || !yearList) return;

    const itemHeight = 44;

    // Calcular posições baseado nos valores selecionados
    const dayIndex = days.indexOf(selectedDay);
    const monthIndex = months.findIndex(m => m.value === selectedMonth);
    const yearIndex = years.indexOf(selectedYear);

    // Definir scroll inicial sem animação
    if (dayIndex >= 0) {
      dayColumn.scrollTop = dayIndex * itemHeight;
      const dayChildren = Array.from(dayList.children) as HTMLElement[];
      dayChildren.forEach((li, i) => li.classList.toggle('selected', i === dayIndex));
    }
    
    if (monthIndex >= 0) {
      monthColumn.scrollTop = monthIndex * itemHeight;
      const monthChildren = Array.from(monthList.children) as HTMLElement[];
      monthChildren.forEach((li, i) => li.classList.toggle('selected', i === monthIndex));
    }
    
    if (yearIndex >= 0) {
      yearColumn.scrollTop = yearIndex * itemHeight;
      const yearChildren = Array.from(yearList.children) as HTMLElement[];
      yearChildren.forEach((li, i) => li.classList.toggle('selected', i === yearIndex));
    }
  }, [days, months, years, selectedDay, selectedMonth, selectedYear]);

  useEffect(() => {
    const dayColumn = dayColumnRef.current;
    const monthColumn = monthColumnRef.current;
    const yearColumn = yearColumnRef.current;
    const dayList = dayListRef.current;
    const monthList = monthListRef.current;
    const yearList = yearListRef.current;

    if (!dayColumn || !monthColumn || !yearColumn || !dayList || !monthList || !yearList || !isInitialized) return;

    const handleDayScroll = () => handleScroll(dayColumn, dayList, setSelectedDay, days);
    const handleMonthScroll = () => handleScroll(monthColumn, monthList, setSelectedMonth, months);
    const handleYearScroll = () => handleScroll(yearColumn, yearList, setSelectedYear, years);

    dayColumn.addEventListener('scroll', handleDayScroll);
    monthColumn.addEventListener('scroll', handleMonthScroll);
    yearColumn.addEventListener('scroll', handleYearScroll);

    // Inicializar posições apenas após a inicialização completa
    initializePositions();

    return () => {
      dayColumn.removeEventListener('scroll', handleDayScroll);
      monthColumn.removeEventListener('scroll', handleMonthScroll);
      yearColumn.removeEventListener('scroll', handleYearScroll);
    };
  }, [isInitialized]);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="dob-ios-container">
        <div className="dob-ios-picker">
          <div 
            className="picker-column" 
            ref={dayColumnRef}
          >
            <ul ref={dayListRef} className="picker-list">
              {days.map((day) => (
                <li key={day} className="picker-item">
                  {day}
                </li>
              ))}
            </ul>
          </div>
          <div 
            className="picker-column" 
            ref={monthColumnRef}
          >
            <ul ref={monthListRef} className="picker-list">
              {months.map((month) => (
                <li key={month.value} className="picker-item">
                  {month.name}
                </li>
              ))}
            </ul>
          </div>
          <div 
            className="picker-column" 
            ref={yearColumnRef}
          >
            <ul ref={yearListRef} className="picker-list">
              {years.map((year) => (
                <li key={year} className="picker-item">
                  {year}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        .dob-ios-container {
          width: 100%;
          max-width: 380px;
          margin: 0 auto;
        }

        .dob-ios-picker {
          display: flex;
          justify-content: space-between;
          border: 1px solid hsl(var(--border));
          border-radius: 16px;
          overflow: hidden;
          height: 160px;
          position: relative;
          background: hsl(var(--background));
          box-shadow: 0 4px 12px hsla(var(--foreground) / 0.1);
        }

        .picker-column {
          flex: 1;
          overflow-y: scroll;
          scroll-snap-type: y mandatory;
          -webkit-overflow-scrolling: touch;
          text-align: center;
          scrollbar-width: none;
          padding: 48px 0;
          position: relative;
        }
        
        .picker-column::-webkit-scrollbar {
          display: none;
        }

        .picker-column:not(:last-child) {
          border-right: 1px solid hsl(var(--border));
        }

        .picker-list {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .picker-item {
          padding: 12px 8px;
          font-size: 17px;
          scroll-snap-align: center;
          color: hsl(var(--muted-foreground));
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          user-select: none;
          cursor: pointer;
        }

        .picker-item:hover {
          color: hsl(var(--foreground));
        }

        /* Gradiente fade nas bordas */
        .picker-column::before,
        .picker-column::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          height: 48px;
          pointer-events: none;
          z-index: 2;
        }

        .picker-column::before {
          top: 0;
          background: linear-gradient(to bottom, hsl(var(--background)), transparent);
        }

        .picker-column::after {
          bottom: 0;
          background: linear-gradient(to top, hsl(var(--background)), transparent);
        }

        /* Área de seleção central */
        .dob-ios-picker::after {
          content: "";
          position: absolute;
          top: 50%;
          left: 8px;
          right: 8px;
          height: 44px;
          transform: translateY(-50%);
          background: hsla(var(--primary) / 0.08);
          border: 1px solid hsla(var(--primary) / 0.2);
          border-radius: 8px;
          pointer-events: none;
          z-index: 1;
        }

        .picker-item.selected {
          color: hsl(var(--primary));
          font-weight: 600;
          font-size: 19px;
          transform: scale(1.05);
        }

        /* Responsividade mobile */
        @media (max-width: 640px) {
          .dob-ios-container {
            max-width: 100%;
            padding: 0 16px;
          }
          
          .dob-ios-picker {
            height: 140px;
            border-radius: 12px;
          }
          
          .picker-item {
            font-size: 16px;
            padding: 10px 4px;
          }
          
          .picker-item.selected {
            font-size: 18px;
          }
        }
      `}</style>
    </div>
  );
};

export default IOSDatePicker;
