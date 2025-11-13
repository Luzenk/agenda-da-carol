"use client"

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { WeeklyCalendar } from '@/components/admin/WeeklyCalendar';
import { AppointmentForm } from '@/components/admin/AppointmentForm';
import { useRouter } from 'next/navigation';

export default function AgendaPage() {
  const router = useRouter();
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAppointmentClick = (appointment: any) => {
    setSelectedAppointment(appointment);
    setSelectedDate(undefined);
    setSelectedTime(undefined);
    setShowAppointmentDialog(true);
  };

  const handleTimeSlotClick = (date: Date, time: string) => {
    setSelectedAppointment(null);
    setSelectedDate(date);
    setSelectedTime(time);
    setShowAppointmentDialog(true);
  };

  const handleSuccess = () => {
    setShowAppointmentDialog(false);
    setSelectedAppointment(null);
    setSelectedDate(undefined);
    setSelectedTime(undefined);
    setRefreshKey(prev => prev + 1);
  };

  const handleCancel = () => {
    setShowAppointmentDialog(false);
    setSelectedAppointment(null);
    setSelectedDate(undefined);
    setSelectedTime(undefined);
  };

  const handleDelete = () => {
    setShowAppointmentDialog(false);
    setSelectedAppointment(null);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Agenda</h1>
        <p className="text-gray-600">Visualize e gerencie seus agendamentos</p>
      </div>

      <WeeklyCalendar 
        key={refreshKey}
        onAppointmentClick={handleAppointmentClick}
        onTimeSlotClick={handleTimeSlotClick}
      />

      <Dialog open={showAppointmentDialog} onOpenChange={setShowAppointmentDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
            </DialogTitle>
          </DialogHeader>
          <AppointmentForm
            appointment={selectedAppointment}
            initialDate={selectedDate}
            initialTime={selectedTime}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
            onDelete={selectedAppointment ? handleDelete : undefined}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}