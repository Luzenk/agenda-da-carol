"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Calendar, Clock, DollarSign, Info } from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';

interface ClientFormProps {
  service: {
    id: number;
    name: string;
  };
  variant: {
    id: number;
    name: string;
    price: number;
    durationMin: number;
  };
  slot: {
    start: string;
    end: string;
  };
}

export default function ClientForm({ service, variant, slot }: ClientFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    lgpdConsent: false,
    marketingConsent: false,
  });

  const handlePhoneChange = (value: string) => {
    // Remove non-numeric characters
    const cleaned = value.replace(/\D/g, '');
    
    // Format phone number
    let formatted = cleaned;
    if (cleaned.length > 10) {
      formatted = cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (cleaned.length > 6) {
      formatted = cleaned.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else if (cleaned.length > 2) {
      formatted = cleaned.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    }
    
    setFormData({ ...formData, phone: formatted });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.lgpdConsent) {
      setError('Você precisa aceitar a política de privacidade para continuar.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: service.id,
          variantId: variant.id,
          scheduledStart: slot.start,
          scheduledEnd: slot.end,
          clientName: formData.name,
          clientPhone: formData.phone.replace(/\D/g, ''),
          clientEmail: formData.email || null,
          lgpdConsent: formData.lgpdConsent,
          marketingConsent: formData.marketingConsent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar agendamento');
      }

      // Redirect to success page
      router.push(`/agendar/sucesso?id=${data.id}`);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar agendamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Booking Summary */}
      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="py-4">
          <h3 className="font-semibold mb-3">Resumo do agendamento</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-purple-600 mt-0.5" />
              <div>
                <p className="font-medium">{service.name}</p>
                <p className="text-muted-foreground">{variant.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(slot.start)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>
                {formatTime(slot.start)} - {formatTime(slot.end)} ({variant.durationMin} min)
              </span>
            </div>
            <div className="flex items-center gap-2 font-semibold text-purple-600">
              <DollarSign className="w-4 h-4" />
              <span>{formatCurrency(variant.price)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Nome completo *</Label>
          <Input
            id="name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Seu nome completo"
          />
        </div>

        <div>
          <Label htmlFor="phone">WhatsApp *</Label>
          <Input
            id="phone"
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="(11) 99999-9999"
            maxLength={15}
          />
        </div>

        <div>
          <Label htmlFor="email">E-mail (opcional)</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="seu@email.com"
          />
        </div>

        {/* LGPD Consent */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-start gap-3">
            <Checkbox
              id="lgpd"
              checked={formData.lgpdConsent}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, lgpdConsent: checked as boolean })
              }
            />
            <Label htmlFor="lgpd" className="text-sm leading-relaxed cursor-pointer">
              Aceito a{' '}
              <a href="#" className="text-purple-600 underline">
                Política de Privacidade
              </a>{' '}
              e autorizo o uso dos meus dados para agendamento e atendimento. *
            </Label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="marketing"
              checked={formData.marketingConsent}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, marketingConsent: checked as boolean })
              }
            />
            <Label htmlFor="marketing" className="text-sm leading-relaxed cursor-pointer">
              Aceito receber novidades e promoções via WhatsApp (opcional)
            </Label>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Confirmando...
            </>
          ) : (
            'Confirmar Agendamento'
          )}
        </Button>
      </form>

      <p className="text-xs text-center text-muted-foreground">
        Você receberá uma confirmação via WhatsApp com os detalhes do agendamento.
      </p>
    </div>
  );
}
