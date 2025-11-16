"use client"

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Plus, Lock } from 'lucide-react';
import { formatTime } from '@/lib/utils';

interface Appointment {
  id: number;
  scheduledStart: string;
  scheduledEnd: string;
  status: string;
  client: {
    name: string;
    phone: string;
  };
  service: {
    name: string;
  };
  variant: {
    name: string;
    durationMin: number;
    price: number;
  };
}

interface WeeklyCalendarProps {
  onAppointmentClick?: (appointment: Appointment) => void;
  onTimeSlotClick?: (date: Date, time: string) => void;
}

export function WeeklyCalendar({ onAppointmentClick, onTimeSlotClick }: WeeklyCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 7h às 20h

  useEffect(() => {
    fetchWeekAppointments();
  }, [currentWeek]);

  const getWeekDates = () => {
    const startOfWeek = new Date(currentWeek);
    startOfWeek.setDate(currentWeek.getDate() - currentWeek.getDay());
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  };

  const fetchWeekAppointments = async () => {
    setLoading(true);
    try {
      const dates = getWeekDates();
      const startDate = dates[0].toISOString().split('T')[0];
      const endDate = dates[6].toISOString().split('T')[0];

      const response = await fetch(`/api/admin/appointments/week?startDate=${startDate}&endDate=${endDate}`);
      
      // Check if response is ok
      if (!response.ok) {
        console.error('Failed to fetch appointments:', response.status);
        setAppointments([]);
        return;
      }
      
      const data = await response.json();
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setAppointments(data);
      } else {
        console.error('API returned non-array data:', data);
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeek(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeek(newDate);
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
  };

  const getAppointmentsForSlot = (date: Date, hour: number) => {
    return appointments.filter(apt => {
      const aptStart = new Date(apt.scheduledStart);
      const aptEnd = new Date(apt.scheduledEnd);
      
      // Create slot time range (hour:00 to hour:59)
      const slotStart = new Date(date);
      slotStart.setHours(hour, 0, 0, 0);
      
      const slotEnd = new Date(date);
      slotEnd.setHours(hour, 59, 59, 999);
      
      // Check if appointment overlaps with this slot
      return (
        aptStart.toDateString() === date.toDateString() &&
        aptStart < slotEnd &&
        aptEnd > slotStart
      );
    });
  };

  // New function to check if slot is blocked by an appointment
  const isSlotBlocked = (date: Date, hour: number) => {
    return appointments.some(apt => {
      const aptStart = new Date(apt.scheduledStart);
      const aptEnd = new Date(apt.scheduledEnd);
      const aptStartHour = aptStart.getHours();
      
      // Create slot time
      const slotStart = new Date(date);
      slotStart.setHours(hour, 0, 0, 0);
      
      const slotEnd = new Date(date);
      slotEnd.setHours(hour, 59, 59, 999);
      
      // Slot is blocked if:
      // 1. It's the same day
      // 2. Appointment ends after slot starts
      // 3. Appointment starts before slot ends
      // 4. Appointment is not cancelled/no-show
      return (
        aptStart.toDateString() === date.toDateString() &&
        aptEnd > slotStart &&
        aptStart < slotEnd &&
        apt.status !== 'cancelled' &&
        apt.status !== 'no_show'
      );
    });
  };

  // New function to get the appointment that starts in this slot
  const getAppointmentStartingInSlot = (date: Date, hour: number) => {
    return appointments.find(apt => {
      const aptStart = new Date(apt.scheduledStart);
      return (
        aptStart.toDateString() === date.toDateString() &&
        aptStart.getHours() === hour
      );
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500 border-green-600';
      case 'pending':
        return 'bg-yellow-500 border-yellow-600';
      case 'completed':
        return 'bg-blue-500 border-blue-600';
      case 'cancelled':
        return 'bg-red-500 border-red-600';
      default:
        return 'bg-gray-500 border-gray-600';
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const weekDates = getWeekDates();
  const monthYear = currentWeek.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold capitalize">{monthYear}</h2>
          <p className="text-sm text-muted-foreground">
            {weekDates[0].toLocaleDateString('pt-BR')} - {weekDates[6].toLocaleDateString('pt-BR')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Hoje
          </Button>
          <Button variant="outline" size="sm" onClick={goToNextWeek}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border rounded-lg overflow-hidden bg-white">
        <div className="grid grid-cols-8 border-b bg-gray-50">
          <div className="p-3 text-center text-sm font-medium text-muted-foreground border-r">
            Hora
          </div>
          {weekDates.map((date, idx) => (
            <div
              key={idx}
              className={`p-3 text-center border-r last:border-r-0 ${
                isToday(date) ? 'bg-purple-50' : ''
              }`}
            >
              <div className="text-xs text-muted-foreground">{weekDays[date.getDay()]}</div>
              <div className={`text-lg font-semibold ${isToday(date) ? 'text-purple-600' : ''}`}>
                {date.getDate()}
              </div>
            </div>
          ))}
        </div>

        {/* Time Slots */}
        <div className="max-h-[600px] overflow-y-auto">
          {hours.map(hour => (
            <div key={hour} className="grid grid-cols-8 border-b last:border-b-0">
              <div className="p-2 text-center text-sm font-medium text-muted-foreground border-r bg-gray-50">
                {hour}:00
              </div>
              {weekDates.map((date, idx) => {
                const appointmentStartingHere = getAppointmentStartingInSlot(date, hour);
                const isBlocked = isSlotBlocked(date, hour);
                const isEmpty = !isBlocked;

                return (
                  <div
                    key={idx}
                    className={`min-h-[80px] p-1 border-r last:border-r-0 relative ${
                      isEmpty ? 'hover:bg-gray-50 cursor-pointer' : ''
                    } ${isBlocked && !appointmentStartingHere ? 'bg-gray-100' : ''}`}
                    onClick={() => {
                      if (isEmpty && onTimeSlotClick) {
                        onTimeSlotClick(date, `${hour}:00`);
                      }
                    }}
                  >
                    {isEmpty && onTimeSlotClick && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Plus className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Show blocked indicator if slot is occupied but appointment doesn't start here */}
                    {isBlocked && !appointmentStartingHere && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Lock className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Show appointment card only where it starts */}
                    {appointmentStartingHere && (
                      <div
                        className={`p-2 rounded border-l-4 cursor-pointer hover:shadow-md transition-shadow ${getStatusColor(
                          appointmentStartingHere.status
                        )} text-white text-xs`}
                        style={{ 
                          minHeight: `${(appointmentStartingHere.variant.durationMin / 60) * 80}px` 
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onAppointmentClick) {
                            onAppointmentClick(appointmentStartingHere);
                          }
                        }}
                      >
                        <div className="font-semibold truncate">{appointmentStartingHere.client.name}</div>
                        <div className="truncate opacity-90">{appointmentStartingHere.service.name}</div>
                        <div className="opacity-80">{formatTime(appointmentStartingHere.scheduledStart)}</div>
                        <div className="opacity-80 text-[10px] mt-1">
                          {appointmentStartingHere.variant.durationMin} min
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span>Pendente</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Confirmado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span>Concluído</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>Cancelado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-400 rounded"></div>
          <Lock className="w-3 h-3" />
          <span>Ocupado</span>
        </div>
      </div>
    </div>
  );
}