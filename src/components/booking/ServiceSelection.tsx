"use client"

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Service {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  variants: ServiceVariant[];
}

interface ServiceVariant {
  id: number;
  name: string;
  description: string;
  durationMin: number;
  price: number;
}

interface ServiceSelectionProps {
  onSelect: (service: Service, variant: ServiceVariant) => void;
}

export default function ServiceSelection({ onSelect }: ServiceSelectionProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services');
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!selectedService) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => (
          <Card
            key={service.id}
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
            onClick={() => setSelectedService(service)}
          >
            <div
              className="h-48 bg-cover bg-center rounded-t-xl"
              style={{ backgroundImage: `url(${service.imageUrl})` }}
            />
            <CardHeader>
              <CardTitle>{service.name}</CardTitle>
              <CardDescription>{service.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">
                  {service.variants.length} opções
                </Badge>
                <Button size="sm">
                  Ver opções
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedService(null)}
        >
          ← Voltar para serviços
        </Button>
      </div>

      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">{selectedService.name}</h3>
        <p className="text-muted-foreground">{selectedService.description}</p>
      </div>

      <div className="space-y-3">
        {selectedService.variants.map((variant) => (
          <Card
            key={variant.id}
            className="cursor-pointer hover:shadow-md transition-all hover:border-purple-300"
            onClick={() => onSelect(selectedService, variant)}
          >
            <CardContent className="py-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg mb-1">{variant.name}</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {variant.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{variant.durationMin} min</span>
                    </div>
                    <div className="flex items-center gap-1 font-semibold text-purple-600">
                      <DollarSign className="w-4 h-4" />
                      <span>{formatCurrency(variant.price)}</span>
                    </div>
                  </div>
                </div>
                <Button>Escolher</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
