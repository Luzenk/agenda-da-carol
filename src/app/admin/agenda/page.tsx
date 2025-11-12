"use client"

import { useState } from 'react';
import { WeeklyCalendar } from '@/components/admin/WeeklyCalendar';
import { useRouter } from 'next/navigation';

export default function AgendaPage() {
  const router = useRouter();

  const handleAppointmentClick = (appointment: any) => {
    router.push(`/admin/agendamentos/${appointment.id}`);
  };

  const handleTimeSlotClick = (date: Date, time: string) => {
    // TODO: Open modal to create new appointment
    console.log('Create appointment for', date, time);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Agenda</h1>
        <p className="text-gray-600">Visualize e gerencie seus agendamentos</p>
      </div>

      <WeeklyCalendar 
        onAppointmentClick={handleAppointmentClick}
        onTimeSlotClick={handleTimeSlotClick}
      />
    </div>
  );
}