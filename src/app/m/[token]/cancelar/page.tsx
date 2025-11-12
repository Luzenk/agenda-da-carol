"use client"

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertTriangle, Calendar, Clock } from 'lucide-react';
import { formatDate, formatTime, formatCurrency } from '@/lib/utils';

export default function CancelPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [reason, setReason] = useState('');

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

  const handleCancel = async () => {
    if (!reason.trim()) {
      setError('Por favor, informe o motivo do cancelamento');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/manage/${token}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      // Show success message
      alert(data.message);
      router.push('/agendar');
    } catch (err: any) {
      setError(err.message || 'Erro ao cancelar agendamento');
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
            <p className="text-muted-foreground">Este agendamento já foi cancelado.</p>
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
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-purple-900 mb-2">
            Cancelar Agendamento
          </h1>
        </div>

        <Card className="shadow-xl mb-6">
          <CardHeader>
            <CardTitle>Detalhes do Agendamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-medium text-lg">{appointment.service.name}</p>
              <p className="text-sm text-muted-foreground">{appointment.variant.name}</p>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(appointment.scheduledStart)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{formatTime(appointment.scheduledStart)}</span>
            </div>
            <div className="pt-2 border-t">
              <span className="font-semibold text-purple-600">
                {formatCurrency(appointment.price)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Alert className="mb-6" variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Política de Cancelamento:</strong>
            <ul className="list-disc list-inside mt-2 text-sm">
              <li>Até 24h antes: Cancelamento gratuito</li>
              <li>Menos de 24h: Taxa de 50% do valor</li>
              <li>Não comparecimento: Taxa de 100%</li>
            </ul>
          </AlertDescription>
        </Alert>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Motivo do Cancelamento</CardTitle>
            <CardDescription>
              Por favor, informe o motivo para ajudarmos a melhorar nossos serviços
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="reason">Motivo *</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: Imprevisto pessoal, conflito de horário..."
                rows={4}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

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
                variant="destructive"
                className="flex-1"
                onClick={handleCancel}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cancelando...
                  </>
                ) : (
                  'Confirmar Cancelamento'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
