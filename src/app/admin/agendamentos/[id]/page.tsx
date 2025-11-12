"use client"

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Calendar, Clock, User, Phone, Mail, DollarSign, MessageSquare, Trash2, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import { toast } from 'sonner';

interface Appointment {
  id: number;
  scheduledStart: string;
  scheduledEnd: string;
  status: string;
  price: number;
  paymentStatus: string;
  notes: string;
  internalNotes: string;
  client: {
    id: number;
    name: string;
    phone: string;
    email: string;
  };
  service: {
    id: number;
    name: string;
  };
  variant: {
    id: number;
    name: string;
    durationMin: number;
    price: number;
  };
}

export default function AppointmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  useEffect(() => {
    fetchAppointment();
  }, [params.id]);

  const fetchAppointment = async () => {
    try {
      const response = await fetch(`/api/appointments/${params.id}`);
      const data = await response.json();
      
      if (data.error) {
        toast.error('Agendamento não encontrado');
        router.push('/admin/agenda');
        return;
      }

      setAppointment(data);
      setStatus(data.status);
      setPaymentStatus(data.paymentStatus);
      setInternalNotes(data.internalNotes || '');
    } catch (error) {
      console.error('Error fetching appointment:', error);
      toast.error('Erro ao carregar agendamento');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/appointments/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          paymentStatus,
          internalNotes
        })
      });

      if (response.ok) {
        toast.success('Agendamento atualizado!');
        fetchAppointment();
      } else {
        toast.error('Erro ao atualizar agendamento');
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Erro ao atualizar agendamento');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este agendamento?')) return;

    try {
      const response = await fetch(`/api/appointments/${params.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Agendamento excluído!');
        router.push('/admin/agenda');
      } else {
        toast.error('Erro ao excluir agendamento');
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error('Erro ao excluir agendamento');
    }
  };

  const handleWhatsApp = () => {
    if (!appointment) return;
    
    const message = encodeURIComponent(
      `Olá ${appointment.client.name}! Sobre seu agendamento de ${appointment.service.name} no dia ${formatDate(appointment.scheduledStart)} às ${formatTime(appointment.scheduledStart)}.`
    );
    
    const phone = appointment.client.phone.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no_show':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      in_progress: 'Em Andamento',
      completed: 'Concluído',
      cancelled: 'Cancelado',
      no_show: 'Não Compareceu',
    };
    return labels[status] || status;
  };

  const getPaymentStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendente',
      paid: 'Pago',
      refunded: 'Reembolsado',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!appointment) {
    return null;
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Agendamento #{appointment.id}
            </h1>
            <p className="text-gray-600">
              {formatDate(appointment.scheduledStart)} às {formatTime(appointment.scheduledStart)}
            </p>
          </div>
          <Badge className={getStatusColor(appointment.status)} variant="secondary">
            {getStatusLabel(appointment.status)}
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Info */}
          <Card>
            <CardHeader>
              <CardTitle>Serviço</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground">Serviço</div>
                  <div className="font-medium text-lg">{appointment.service.name}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Variante</div>
                  <div className="font-medium">{appointment.variant.name}</div>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-3 border-t">
                  <div>
                    <div className="text-sm text-muted-foreground">Duração</div>
                    <div className="font-medium flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {appointment.variant.durationMin} min
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Valor</div>
                    <div className="font-medium flex items-center gap-1 text-green-600">
                      <DollarSign className="w-4 h-4" />
                      {formatCurrency(appointment.price)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Horário</div>
                    <div className="font-medium">
                      {formatTime(appointment.scheduledStart)} - {formatTime(appointment.scheduledEnd)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Info */}
          <Card>
            <CardHeader>
              <CardTitle>Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Nome</div>
                    <div className="font-medium">{appointment.client.name}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Telefone</div>
                    <div className="font-medium">{appointment.client.phone}</div>
                  </div>
                </div>
                {appointment.client.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">E-mail</div>
                      <div className="font-medium">{appointment.client.email}</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {appointment.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Observações do Cliente</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{appointment.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-6">
          {/* Status Management */}
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Status do Agendamento</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="confirmed">Confirmado</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                    <SelectItem value="no_show">Não Compareceu</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Status do Pagamento</Label>
                <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="paid">Pago</SelectItem>
                    <SelectItem value="refunded">Reembolsado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Notas Internas</Label>
                <Textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Anotações internas (não visíveis ao cliente)"
                  rows={4}
                />
              </div>

              <Button
                onClick={handleUpdateStatus}
                disabled={updating}
                className="w-full"
              >
                {updating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={handleWhatsApp}
                className="w-full"
                variant="outline"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Enviar WhatsApp
              </Button>

              <Button
                onClick={handleDelete}
                className="w-full"
                variant="destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir Agendamento
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
