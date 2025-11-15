"use client"

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Info, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { formatDate, formatTime } from '@/lib/utils';
import DateTimeSelection from '@/components/booking/DateTimeSelection';
import { toast } from 'sonner';

interface RescheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: {
    id: number;
    scheduledStart: string;
    scheduledEnd: string;
    variant: {
      id: number;
      name: string;
      durationMin: number;
    };
    service: {
      name: string;
    };
  };
  onSuccess: () => void;
}

export default function RescheduleDialog({
  open,
  onOpenChange,
  appointment,
  onSuccess
}: RescheduleDialogProps) {
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleReschedule = async () => {
    if (!selectedSlot) {
      toast.error('Por favor, selecione um novo horário');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/admin/appointments/${appointment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduledStart: selectedSlot.start,
          scheduledEnd: selectedSlot.end,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao reagendar');
      }

      toast.success('Agendamento reagendado com sucesso!');
      onSuccess();
      onOpenChange(false);
      setSelectedSlot(null);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao reagendar');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reagendar Atendimento</DialogTitle>
          <DialogDescription>
            Escolha uma nova data e horário para o agendamento
          </DialogDescription>
        </DialogHeader>

        {/* Current Appointment Info */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <p className="font-medium">Agendamento Atual:</p>
          <div className="text-sm space-y-1">
            <p><strong>Serviço:</strong> {appointment.service.name} - {appointment.variant.name}</p>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarIcon className="w-4 h-4" />
              <span>{formatDate(appointment.scheduledStart)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{formatTime(appointment.scheduledStart)} - {formatTime(appointment.scheduledEnd)}</span>
            </div>
          </div>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Selecione um novo horário disponível. O sistema verificará automaticamente conflitos com outros agendamentos.
          </AlertDescription>
        </Alert>

        {/* Date/Time Selection */}
        <div className="py-4">
          <DateTimeSelection
            variant={appointment.variant}
            onSelect={(date, slot) => setSelectedSlot(slot)}
          />
        </div>

        {/* Selected Slot Preview */}
        {selectedSlot && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="font-medium text-purple-900 mb-2">Novo horário selecionado:</p>
            <div className="flex items-center gap-4 text-sm text-purple-700">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                <span>{formatDate(selectedSlot.start)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{formatTime(selectedSlot.start)} - {formatTime(selectedSlot.end)}</span>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setSelectedSlot(null);
            }}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleReschedule}
            disabled={!selectedSlot || submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Reagendando...
              </>
            ) : (
              'Confirmar Reagendamento'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
