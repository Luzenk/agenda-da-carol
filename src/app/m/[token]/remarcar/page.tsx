"use client"

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Info, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { formatDate, formatTime, formatCurrency } from '@/lib/utils';
import DateTimeSelection from '@/components/booking/DateTimeSelection';

export default function ReschedulePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<any>(null);

  useEffect(() => {
    fetchAppointment();
  }, [token]);

  const fetchAppointment = async () => {
    try {
      const response = await fetch(`/api/manage/${token}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      setAppointment(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar agendamento');
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = async () => {
    if (!selectedSlot) {
      setError('Por favor, selecione um novo horário');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/manage/${token}/reschedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scheduledStart: selectedSlot.start,
          scheduledEnd: selectedSlot.end,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      // Show success message
      alert(data.message);
      router.push('/agendar');
    } catch (err: any) {
      setError(err.message || 'Erro ao reagendar');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Agendamento não encontrado.</p>
            <Button asChild className="mt-4">
              <a href="/agendar">Fazer novo agendamento</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (appointment.status === 'cancelled') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Este agendamento foi cancelado.</p>
            <Button asChild className="mt-4">
              <a href="/agendar">Fazer novo agendamento</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-purple-900 mb-2">
            Reagendar
          </h1>
          <p className="text-purple-700">
            Escolha um novo horário para seu atendimento
          </p>
        </div>

        {/* Current Appointment */}
        <Card className="shadow-xl mb-6">
          <CardHeader className="bg-purple-50">
            <CardTitle>Agendamento Atual</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div>
              <p className="font-medium text-lg">{appointment.service.name}</p>
              <p className="text-sm text-muted-foreground">{appointment.variant.name}</p>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarIcon className="w-4 h-4" />
              <span>{formatDate(appointment.scheduledStart)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{formatTime(appointment.scheduledStart)}</span>
            </div>
          </CardContent>
        </Card>

        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Política de Reagendamento:</strong>
            <ul className="list-disc list-inside mt-2 text-sm">
              <li>Até 12h antes: Reagendamento gratuito</li>
              <li>Menos de 12h: Taxa de R$ 30,00</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* New Date/Time Selection */}
        <Card className="shadow-xl mb-6">
          <CardHeader>
            <CardTitle>Selecione o Novo Horário</CardTitle>
            <CardDescription>
              Escolha uma data e horário disponível
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DateTimeSelection
              variant={appointment.variant}
              onSelect={(date, slot) => setSelectedSlot(slot)}
            />
          </CardContent>
        </Card>

        {/* Selected Slot Info */}
        {selectedSlot && (
          <Card className="shadow-xl mb-6 border-purple-300 bg-purple-50">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Novo horário selecionado:</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(selectedSlot.start)} às {formatTime(selectedSlot.start)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-purple-600">
                    {formatCurrency(appointment.price)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.back()}
            disabled={submitting}
          >
            Voltar
          </Button>
          <Button
            className="flex-1"
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
        </div>
      </div>
    </div>
  );
}
