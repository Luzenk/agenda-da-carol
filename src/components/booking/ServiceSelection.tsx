"use client"

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign, Loader2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const [error, setError] = useState<string>('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setError('');
      const response = await fetch('/api/services');
      
      if (!response.ok) {
        throw new Error('Erro ao carregar serviços');
      }
      
      const data = await response.json();
      
      // Validate that data is an array
      if (!Array.isArray(data)) {
        throw new Error('Formato de dados inválido');
      }
      
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
      setError(error instanceof Error ? error.message : 'Erro ao carregar serviços');
      setServices([]);
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

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchServices}
            className="ml-4"
          >
            Tentar novamente
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Nenhum serviço disponível no momento.</p>
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
            {service.imageUrl && (
              <div
                className="h-48 bg-cover bg-center rounded-t-xl"
                style={{ backgroundImage: `url(${service.imageUrl})` }}
              />
            )}
            <CardHeader>
              <CardTitle>{service.name}</CardTitle>
              <CardDescription>{service.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">
                  {service.variants?.length || 0} opções
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

      {selectedService.variants && selectedService.variants.length > 0 ? (
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
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>Nenhuma variação disponível para este serviço.</p>
        </div>
      )}
    </div>
  );
}