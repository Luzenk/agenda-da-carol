"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

interface AppointmentFormProps {
  appointment?: any;
  initialDate?: Date;
  initialTime?: string;
  onSuccess: () => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export function AppointmentForm({ 
  appointment, 
  initialDate, 
  initialTime, 
  onSuccess, 
  onCancel,
  onDelete 
}: AppointmentFormProps) {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    clientId: appointment?.clientId || '',
    serviceId: appointment?.serviceId || '',
    variantId: appointment?.variantId || '',
    date: appointment 
      ? new Date(appointment.scheduledStart).toISOString().split('T')[0]
      : initialDate?.toISOString().split('T')[0] || '',
    time: appointment
      ? new Date(appointment.scheduledStart).toTimeString().slice(0, 5)
      : initialTime || '',
    status: appointment?.status || 'pending',
    paymentStatus: appointment?.paymentStatus || 'pending',
    paymentMethod: appointment?.paymentMethod || '',
    notes: appointment?.notes || '',
  });

  useEffect(() => {
    fetchClients();
    fetchServices();
  }, []);

  useEffect(() => {
    if (formData.serviceId) {
      const service = services.find(s => s.id === parseInt(formData.serviceId));
      setVariants(service?.variants || []);
    }
  }, [formData.serviceId, services]);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/admin/clients');
      const data = await response.json();
      setClients(data.filter((c: any) => c.active));
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/admin/services');
      const data = await response.json();
      setServices(data.filter((s: any) => s.active));
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const calculateEndTime = () => {
    if (!formData.date || !formData.time || !formData.variantId) return null;

    const variant = variants.find(v => v.id === parseInt(formData.variantId));
    if (!variant) return null;

    const start = new Date(`${formData.date}T${formData.time}`);
    const end = new Date(start.getTime() + variant.durationMin * 60000);
    
    return {
      scheduledStart: start.toISOString(),
      scheduledEnd: end.toISOString(),
      price: variant.price,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientId || !formData.serviceId || !formData.variantId || !formData.date || !formData.time) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const times = calculateEndTime();
    if (!times) {
      toast.error('Erro ao calcular horário do agendamento');
      return;
    }

    setLoading(true);

    try {
      const url = appointment
        ? `/api/admin/appointments/${appointment.id}`
        : '/api/appointments';
      
      const method = appointment ? 'PUT' : 'POST';

      const payload = {
        clientId: parseInt(formData.clientId),
        serviceId: parseInt(formData.serviceId),
        variantId: parseInt(formData.variantId),
        scheduledStart: times.scheduledStart,
        scheduledEnd: times.scheduledEnd,
        price: times.price,
        status: formData.status,
        paymentStatus: formData.paymentStatus,
        paymentMethod: formData.paymentMethod || null,
        notes: formData.notes || null,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar agendamento');
      }

      toast.success(appointment ? 'Agendamento atualizado!' : 'Agendamento criado!');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar agendamento');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!appointment || !confirm('Tem certeza que deseja excluir este agendamento?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/appointments/${appointment.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao excluir agendamento');

      toast.success('Agendamento excluído!');
      if (onDelete) onDelete();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir agendamento');
    } finally {
      setLoading(false);
    }
  };

  const selectedVariant = variants.find(v => v.id === parseInt(formData.variantId));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="client">Cliente *</Label>
          <Select
            value={formData.clientId}
            onValueChange={(value) => setFormData({ ...formData, clientId: value })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o cliente" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id.toString()}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="service">Serviço *</Label>
          <Select
            value={formData.serviceId}
            onValueChange={(value) => {
              setFormData({ ...formData, serviceId: value, variantId: '' });
            }}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o serviço" />
            </SelectTrigger>
            <SelectContent>
              {services.map((service) => (
                <SelectItem key={service.id} value={service.id.toString()}>
                  {service.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="variant">Variante *</Label>
          <Select
            value={formData.variantId}
            onValueChange={(value) => setFormData({ ...formData, variantId: value })}
            required
            disabled={!formData.serviceId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a variante" />
            </SelectTrigger>
            <SelectContent>
              {variants.map((variant) => (
                <SelectItem key={variant.id} value={variant.id.toString()}>
                  {variant.name} - {formatCurrency(variant.price)} - {variant.durationMin}min
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Data *</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="time">Horário *</Label>
          <Input
            id="time"
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="confirmed">Confirmado</SelectItem>
              <SelectItem value="in_progress">Em Andamento</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentStatus">Pagamento</Label>
          <Select
            value={formData.paymentStatus}
            onValueChange={(value) => setFormData({ ...formData, paymentStatus: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="paid">Pago</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Observações sobre o agendamento"
          rows={2}
        />
      </div>

      <div className="flex justify-between gap-2 pt-4">
        <div>
          {appointment && onDelete && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {appointment ? 'Atualizar' : 'Criar'}
          </Button>
        </div>
      </div>
    </form>
  );
}
