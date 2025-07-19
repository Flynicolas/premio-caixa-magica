
import { useState, useEffect, useRef } from 'react';
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

  const dayColumnRef = useRef<HTMLDivElement>(null);
  const monthColumnRef = useRef<HTMLDivElement>(null);
  const yearColumnRef = useRef<HTMLDivElement>(null);

  const dayListRef = useRef<HTMLUListElement>(null);
  const monthListRef = useRef<HTMLUListElement>(null);
  const yearListRef = useRef<HTMLUListElement>(null);

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

  // Gerar dias (1-31)
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));

  // Inicializar com valor existente
  useEffect(() => {
    if (value) {
      const [year, month, day] = value.split('-');
      if (year && month && day) {
        setSelectedYear(year);
        setSelectedMonth(month);
        setSelectedDay(day);
      }
    }
  }, [value]);

  // Atualizar valor quando seleção muda
  useEffect(() => {
    if (selectedDay && selectedMonth && selectedYear) {
      onChange(`${selectedYear}-${selectedMonth}-${selectedDay}`);
    }
  }, [selectedDay, selectedMonth, selectedYear, onChange]);

  const handleScroll = (
    column: HTMLDivElement,
    list: HTMLUListElement,
    setter: (value: string) => void,
    items: string[] | { name: string; value: string }[]
  ) => {
    const scrollCenter = column.scrollTop + column.offsetHeight / 2;
    let closest: HTMLElement | null = null;
    let minDistance = Infinity;

    const children = Array.from(list.children) as HTMLElement[];
    children.forEach((li) => {
      const liCenter = li.offsetTop + li.offsetHeight / 2;
      const distance = Math.abs(scrollCenter - liCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closest = li;
      }
    });

    if (closest) {
      children.forEach((li) => li.classList.remove('selected'));
      closest.classList.add('selected');
      
      const index = children.indexOf(closest);
      if (typeof items[0] === 'string') {
        setter(items[index] as string);
      } else {
        setter((items[index] as { value: string }).value);
      }
    }
  };

  useEffect(() => {
    const dayColumn = dayColumnRef.current;
    const monthColumn = monthColumnRef.current;
    const yearColumn = yearColumnRef.current;
    const dayList = dayListRef.current;
    const monthList = monthListRef.current;
    const yearList = yearListRef.current;

    if (!dayColumn || !monthColumn || !yearColumn || !dayList || !monthList || !yearList) return;

    const handleDayScroll = () => handleScroll(dayColumn, dayList, setSelectedDay, days);
    const handleMonthScroll = () => handleScroll(monthColumn, monthList, setSelectedMonth, months);
    const handleYearScroll = () => handleScroll(yearColumn, yearList, setSelectedYear, years);

    dayColumn.addEventListener('scroll', handleDayScroll);
    monthColumn.addEventListener('scroll', handleMonthScroll);
    yearColumn.addEventListener('scroll', handleYearScroll);

    // Inicializar posições
    setTimeout(() => {
      const dayIndex = days.indexOf(selectedDay);
      const monthIndex = months.findIndex(m => m.value === selectedMonth);
      const yearIndex = years.indexOf(selectedYear);

      if (dayIndex >= 0) {
        dayColumn.scrollTo(0, dayIndex * 44);
        handleDayScroll();
      }
      if (monthIndex >= 0) {
        monthColumn.scrollTo(0, monthIndex * 44);
        handleMonthScroll();
      }
      if (yearIndex >= 0) {
        yearColumn.scrollTo(0, yearIndex * 44);
        handleYearScroll();
      }
    }, 100);

    return () => {
      dayColumn.removeEventListener('scroll', handleDayScroll);
      monthColumn.removeEventListener('scroll', handleMonthScroll);
      yearColumn.removeEventListener('scroll', handleYearScroll);
    };
  }, [selectedDay, selectedMonth, selectedYear, days, months, years]);

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
          max-width: 350px;
          margin: 0 auto;
        }

        .dob-ios-picker {
          display: flex;
          justify-content: space-between;
          border: 1px solid hsl(var(--border));
          border-radius: 12px;
          overflow: hidden;
          height: 140px;
          position: relative;
          background: hsl(var(--background));
        }

        .picker-column {
          flex: 1;
          overflow-y: scroll;
          scroll-snap-type: y mandatory;
          -webkit-overflow-scrolling: touch;
          text-align: center;
          scrollbar-width: none;
        }
        
        .picker-column::-webkit-scrollbar {
          display: none;
        }

        .picker-list {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .picker-item {
          padding: 12px 0;
          font-size: 18px;
          scroll-snap-align: center;
          color: hsl(var(--muted-foreground));
          transition: color 0.2s, font-weight 0.2s, font-size 0.2s;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dob-ios-picker::after {
          content: "";
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 40px;
          transform: translateY(-50%);
          border-top: 2px solid hsl(var(--primary));
          border-bottom: 2px solid hsl(var(--primary));
          pointer-events: none;
        }

        .picker-item.selected {
          color: hsl(var(--primary));
          font-weight: bold;
          font-size: 20px;
        }
      `}</style>
    </div>
  );
};

export default IOSDatePicker;
