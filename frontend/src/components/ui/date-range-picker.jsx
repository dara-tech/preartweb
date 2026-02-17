import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

export function DatePickerWithRange({ date, onDateChange, className }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDateSelect = (range) => {
    if (!range) return;
    
    // Handle range selection properly
    if (range.from) {
      onDateChange({
        from: range.from,
        to: range.to || range.from
      });
      
      // Close popover when both dates are selected
      if (range.from && range.to) {
        setTimeout(() => setIsOpen(false), 200);
      }
    }
  };

  const formatDateRange = () => {
    if (!date?.from) return 'Pick a date range';
    if (!date.to) return format(date.from, 'MMM dd, yyyy');
    return `${format(date.from, 'MMM dd, yyyy')} - ${format(date.to, 'MMM dd, yyyy')}`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-full justify-start text-left font-normal ${className || ''}`}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDateRange()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={{ from: date?.from, to: date?.to }}
          onSelect={handleDateSelect}
          initialFocus
          numberOfMonths={2}
        />
        {date?.from && !date?.to && (
          <div className="p-3 border-t bg-muted/30">
            <p className="text-xs text-muted-foreground text-center">
              👆 Select end date on calendar
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
