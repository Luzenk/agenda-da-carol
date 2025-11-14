"use client"

import { useState } from 'react';
import { WeeklyCalendar } from '@/components/admin/WeeklyCalendar';
import { AppointmentFormDialog } from '@/components/admin/AppointmentFormDialog';
import { useRouter } from 'next/navigation';

export default function AgendaPage() {
  const router = useRouter();
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAppointmentClick = (appointment: any) => {
    router.push(`/admin/agendamentos/${appointment.id}`);
  };

  const handleTimeSlotClick = (date: Date, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setAppointmentDialogOpen(true);
  };

  const handleAppointmentCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Agenda</h1>
        <p className="text-gray-600">Visualize e gerencie seus agendamentos. Clique em um horário vazio para criar novo agendamento.</p>
      </div>

      <WeeklyCalendar 
        key={refreshKey}
        onAppointmentClick={handleAppointmentClick}
        onTimeSlotClick={handleTimeSlotClick}
      />

      <AppointmentFormDialog
        open={appointmentDialogOpen}
        onOpenChange={setAppointmentDialogOpen}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        onSuccess={handleAppointmentCreated}
      />
    </div>
  );
}