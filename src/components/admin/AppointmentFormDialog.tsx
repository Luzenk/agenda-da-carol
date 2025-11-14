import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Calendar, Clock, User, Phone, Mail, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Client {
  id: number;
  name: string;
  phone: string;
  email?: string;
}

interface Service {
  id: number;
  name: string;
  variants: Variant[];
}

interface Variant {
  id: number;
  name: string;
  durationMin: number;
  price: number;
}

interface AppointmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
  selectedTime?: string;
  onSuccess?: () => void;
}

export function AppointmentFormDialog({
  open,
  onOpenChange,
  selectedDate,
  selectedTime,
  onSuccess
}: AppointmentFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  const [formData, setFormData] = useState({
    clientId: '',
    newClientName: '',
    newClientPhone: '',
    newClientEmail: '',
    serviceId: '',
    variantId: '',
    date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
    time: selectedTime || '',
    notes: '',
    status: 'confirmed' as 'pending' | 'confirmed',
    paymentStatus: 'pending' as 'pending' | 'paid'
  });

  const [isNewClient, setIsNewClient] = useState(false);

  useEffect(() => {
    if (open) {
      fetchClients();
      fetchServices();
      
      if (selectedDate) {
        setFormData(prev => ({ ...prev, date: format(selectedDate, 'yyyy-MM-dd') }));
      }
      if (selectedTime) {
        setFormData(prev => ({ ...prev, time: selectedTime }));
      }
    }
  }, [open, selectedDate, selectedTime]);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/admin/clients');
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services');
      const servicesData = await response.json();
      
      // Fetch variants for each service
      const servicesWithVariants = await Promise.all(
        servicesData.map(async (service: any) => {
          const variantsRes = await fetch(`/api/admin/services/${service.id}`);
          const serviceDetail = await variantsRes.json();
          return {
            id: service.id,
            name: service.name,
            variants: serviceDetail.variants || []
          };
        })
      );
      
      setServices(servicesWithVariants);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleServiceChange = (serviceId: string) => {
    setFormData({ ...formData, serviceId, variantId: '' });
    const service = services.find(s => s.id === parseInt(serviceId));
    setSelectedService(service || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date || !formData.time) {
      toast.error('Selecione data e horário');
      return;
    }

    if (!formData.serviceId || !formData.variantId) {
      toast.error('Selecione serviço e variante');
      return;
    }

    if (!isNewClient && !formData.clientId) {
      toast.error('Selecione um cliente');
      return;
    }

    if (isNewClient && (!formData.newClientName || !formData.newClientPhone)) {
      toast.error('Preencha nome e telefone do cliente');
      return;
    }

    setLoading(true);

    try {
      let clientId = formData.clientId;

      // Create new client if needed
      if (isNewClient) {
        const clientResponse = await fetch('/api/admin/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.newClientName,
            phone: formData.newClientPhone,
            email: formData.newClientEmail,
            lgpdConsent: true,
            lgpdConsentDate: new Date().toISOString()
          })
        });

        if (!clientResponse.ok) {
          throw new Error('Erro ao criar cliente');
        }

        const newClient = await clientResponse.json();
        clientId = newClient.id.toString();
      }

      // Get variant details for duration
      const variant = selectedService?.variants.find(v => v.id === parseInt(formData.variantId));
      if (!variant) {
        toast.error('Variante não encontrada');
        setLoading(false);
        return;
      }

      // Calculate scheduled start and end times
      const [hours, minutes] = formData.time.split(':');
      const scheduledStart = new Date(formData.date);
      scheduledStart.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const scheduledEnd = new Date(scheduledStart);
      scheduledEnd.setMinutes(scheduledEnd.getMinutes() + variant.durationMin);

      // Create appointment
      const response = await fetch('/api/admin/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: parseInt(clientId),
          serviceId: parseInt(formData.serviceId),
          variantId: parseInt(formData.variantId),
          scheduledStart: scheduledStart.toISOString(),
          scheduledEnd: scheduledEnd.toISOString(),
          status: formData.status,
          paymentStatus: formData.paymentStatus,
          price: variant.price,
          notes: formData.notes
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar agendamento');
      }

      toast.success('Agendamento criado com sucesso!');
      onOpenChange(false);
      
      // Reset form
      setFormData({
        clientId: '',
        newClientName: '',
        newClientPhone: '',
        newClientEmail: '',
        serviceId: '',
        variantId: '',
        date: '',
        time: '',
        notes: '',
        status: 'confirmed',
        paymentStatus: 'pending'
      });
      setIsNewClient(false);
      setSelectedService(null);

      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      toast.error(error.message || 'Erro ao criar agendamento');
    } finally {
      setLoading(false);
    }
  };

  const selectedVariant = selectedService?.variants.find(v => v.id === parseInt(formData.variantId));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Novo Agendamento
          </DialogTitle>
          <DialogDescription>
            Preencha os dados para criar um novo agendamento
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Selection */}
          <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4" />
              <Label className="text-base font-semibold">Cliente</Label>
            </div>

            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant={!isNewClient ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsNewClient(false)}
              >
                Cliente Existente
              </Button>
              <Button
                type="button"
                variant={isNewClient ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsNewClient(true)}
              >
                Novo Cliente
              </Button>
            </div>

            {!isNewClient ? (
              <div>
                <Label htmlFor="clientId">Selecione o Cliente</Label>
                <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name} - {client.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="newClientName">Nome *</Label>
                  <Input
                    id="newClientName"
                    value={formData.newClientName}
                    onChange={(e) => setFormData({ ...formData, newClientName: e.target.value })}
                    placeholder="Nome completo"
                    required={isNewClient}
                  />
                </div>
                <div>
                  <Label htmlFor="newClientPhone">Telefone *</Label>
                  <Input
                    id="newClientPhone"
                    value={formData.newClientPhone}
                    onChange={(e) => setFormData({ ...formData, newClientPhone: e.target.value })}
                    placeholder="(11) 99999-9999"
                    required={isNewClient}
                  />
                </div>
                <div>
                  <Label htmlFor="newClientEmail">Email (opcional)</Label>
                  <Input
                    id="newClientEmail"
                    type="email"
                    value={formData.newClientEmail}
                    onChange={(e) => setFormData({ ...formData, newClientEmail: e.target.value })}
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Service Selection */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="serviceId">Serviço *</Label>
              <Select value={formData.serviceId} onValueChange={handleServiceChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um serviço" />
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

            {selectedService && selectedService.variants.length > 0 && (
              <div>
                <Label htmlFor="variantId">Variante *</Label>
                <Select value={formData.variantId} onValueChange={(value) => setFormData({ ...formData, variantId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha uma variante" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedService.variants.map((variant) => (
                      <SelectItem key={variant.id} value={variant.id.toString()}>
                        {variant.name} - R$ {variant.price.toFixed(2)} ({variant.durationMin} min)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Data *
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="time" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Horário *
              </Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="confirmed">Confirmado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="paymentStatus">Pagamento</Label>
              <Select value={formData.paymentStatus} onValueChange={(value: any) => setFormData({ ...formData, paymentStatus: value })}>
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

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Observações adicionais..."
              rows={3}
            />
          </div>

          {/* Price Preview */}
          {selectedVariant && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-purple-900">Valor Total:</span>
                </div>
                <span className="text-2xl font-bold text-purple-600">
                  R$ {selectedVariant.price.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-purple-700 mt-2">
                Duração: {selectedVariant.durationMin} minutos
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Criar Agendamento
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
