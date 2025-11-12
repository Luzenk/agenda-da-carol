"use client"

import { useEffect, useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CalendarIcon } from 'lucide-react';
import { formatTime } from '@/lib/utils';

interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

interface DateTimeSelectionProps {
  variant: {
    id: number;
    name: string;
    durationMin: number;
  };
  onSelect: (date: Date, slot: TimeSlot) => void;
}

export default function DateTimeSelection({ variant, onSelect }: DateTimeSelectionProps) {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      fetchSlots(selectedDate);
    }
  }, [selectedDate]);

  const fetchSlots = async (date: Date) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/availability?date=${date.toISOString()}&duration=${variant.durationMin}`
      );
      const data = await response.json();
      setSlots(data);
    } catch (error) {
      console.error('Error fetching slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Disable past dates
    if (date < today) return true;
    
    // Disable Sundays (0)
    if (date.getDay() === 0) return true;
    
    // Max 60 days in advance
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 60);
    if (date > maxDate) return true;
    
    return false;
  };

  const availableSlots = slots.filter((slot) => slot.available);

  return (
    <div className="space-y-6">
      {/* Calendar */}
      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          disabled={isDateDisabled}
          className="rounded-md border"
        />
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CalendarIcon className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold">
              Horários disponíveis para{' '}
              {selectedDate.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum horário disponível para esta data.</p>
              <p className="text-sm mt-2">
                Por favor, selecione outra data.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {availableSlots.map((slot, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  className="hover:bg-purple-100 hover:border-purple-400"
                  onClick={() => onSelect(selectedDate, slot)}
                >
                  {formatTime(slot.start)}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      {!selectedDate && (
        <div className="text-center py-8 text-muted-foreground">
          <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Selecione uma data no calendário acima</p>
        </div>
      )}
    </div>
  );
}
