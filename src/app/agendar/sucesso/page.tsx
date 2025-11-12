"use client"

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Calendar, Clock, MapPin, Download, MessageCircle, Edit, X, Loader2 } from 'lucide-react';
import { formatDate, formatTime, formatCurrency } from '@/lib/utils';
import { generateICS, downloadICS } from '@/lib/ics';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import Link from 'next/link';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get('id');
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [businessInfo, setBusinessInfo] = useState<any>(null);

  useEffect(() => {
    if (appointmentId) {
      fetchAppointment();
    }
  }, [appointmentId]);

  const fetchAppointment = async () => {
    try {
      const [aptResponse, settingsResponse] = await Promise.all([
        fetch(`/api/appointments/${appointmentId}`),
        fetch('/api/settings/business_info'),
      ]);

      const aptData = await aptResponse.json();
      const settingsData = await settingsResponse.json();

      setAppointment(aptData);
      setBusinessInfo(settingsData);
    } catch (error) {
      console.error('Error fetching appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadICS = () => {
    if (!appointment || !businessInfo) return;

    const icsContent = generateICS(
      `${appointment.service.name} - ${appointment.variant.name}`,
      `Agendamento com ${businessInfo.name}`,
      businessInfo.address || '',
      new Date(appointment.scheduledStart),
      new Date(appointment.scheduledEnd)
    );

    downloadICS(icsContent, `agendamento-${appointment.id}.ics`);
  };

  const handleWhatsAppConfirm = () => {
    if (!appointment || !businessInfo) return;

    const message = `Olá! Gostaria de confirmar meu agendamento:\n\n📅 ${appointment.service.name} - ${appointment.variant.name}\n🕐 ${formatDate(appointment.scheduledStart)} às ${formatTime(appointment.scheduledStart)}\n💰 ${formatCurrency(appointment.price)}`;

    const link = generateWhatsAppLink(businessInfo.phone, message);
    window.open(link, '_blank');
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
              <Link href="/agendar">Fazer novo agendamento</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const manageUrl = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/m/${appointment.managementToken}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-purple-900 mb-2">
            Agendamento Confirmado!
          </h1>
          <p className="text-purple-700">
            Seu horário foi reservado com sucesso ✨
          </p>
        </div>

        {/* Appointment Details */}
        <Card className="shadow-xl mb-6">
          <CardHeader className="bg-purple-50">
            <CardTitle className="text-xl">Detalhes do Agendamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-medium">{appointment.service.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {appointment.variant.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-muted-foreground">
                <Clock className="w-5 h-5" />
                <span>
                  {formatDate(appointment.scheduledStart)} às{' '}
                  {formatTime(appointment.scheduledStart)}
                </span>
              </div>

              {businessInfo && (
                <div className="flex items-start gap-3 text-muted-foreground">
                  <MapPin className="w-5 h-5 mt-0.5" />
                  <span className="text-sm">{businessInfo.address}</span>
                </div>
              )}

              <div className="pt-3 border-t">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Valor:</span>
                  <span className="text-xl font-bold text-purple-600">
                    {formatCurrency(appointment.price)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3 mb-6">
          <Button
            onClick={handleDownloadICS}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <Download className="w-4 h-4 mr-2" />
            Adicionar ao Calendário
          </Button>

          <Button
            onClick={handleWhatsAppConfirm}
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Confirmar via WhatsApp
          </Button>
        </div>

        {/* Management Links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Gerenciar Agendamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Salve este link para reagendar ou cancelar:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={manageUrl}
                readOnly
                className="flex-1 px-3 py-2 text-sm border rounded-md bg-muted"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(manageUrl);
                }}
              >
                Copiar
              </Button>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                asChild
                variant="outline"
                className="flex-1"
              >
                <Link href={`/m/${appointment.managementToken}/remarcar`}>
                  <Edit className="w-4 h-4 mr-2" />
                  Reagendar
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="flex-1 text-red-600 hover:text-red-700"
              >
                <Link href={`/m/${appointment.managementToken}/cancelar`}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Alert */}
        <Alert className="mt-6">
          <AlertDescription>
            <strong>Importante:</strong> Você receberá uma confirmação via WhatsApp
            com todos os detalhes. Em caso de dúvidas, entre em contato!
          </AlertDescription>
        </Alert>

        {/* New Booking */}
        <div className="text-center mt-8">
          <Button asChild variant="outline">
            <Link href="/agendar">Fazer novo agendamento</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
