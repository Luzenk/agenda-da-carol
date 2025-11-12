"use client"

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, Calendar, Clock, User } from 'lucide-react';
import ServiceSelection from '@/components/booking/ServiceSelection';
import DateTimeSelection from '@/components/booking/DateTimeSelection';
import ClientForm from '@/components/booking/ClientForm';

type BookingStep = 'service' | 'datetime' | 'client';

export default function BookingPage() {
  const [step, setStep] = useState<BookingStep>('service');
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);

  const handleServiceSelect = (service: any, variant: any) => {
    setSelectedService(service);
    setSelectedVariant(variant);
    setStep('datetime');
  };

  const handleDateTimeSelect = (date: Date, slot: any) => {
    setSelectedDate(date);
    setSelectedSlot(slot);
    setStep('client');
  };

  const handleBack = () => {
    if (step === 'datetime') {
      setStep('service');
    } else if (step === 'client') {
      setStep('datetime');
    }
  };

  const getStepIcon = (currentStep: BookingStep) => {
    switch (currentStep) {
      case 'service':
        return <Clock className="w-5 h-5" />;
      case 'datetime':
        return <Calendar className="w-5 h-5" />;
      case 'client':
        return <User className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-900 mb-2">
            Agenda da Carol
          </h1>
          <p className="text-purple-700">
            Especialista em tranças afro ✨
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8 gap-2">
          {(['service', 'datetime', 'client'] as BookingStep[]).map((s, idx) => (
            <div key={s} className="flex items-center">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  step === s
                    ? 'bg-purple-600 text-white shadow-lg'
                    : s === 'service' && (step === 'datetime' || step === 'client')
                    ? 'bg-purple-200 text-purple-700'
                    : s === 'datetime' && step === 'client'
                    ? 'bg-purple-200 text-purple-700'
                    : 'bg-white text-gray-400'
                }`}
              >
                {getStepIcon(s)}
                <span className="hidden sm:inline text-sm font-medium">
                  {s === 'service' && 'Serviço'}
                  {s === 'datetime' && 'Data & Hora'}
                  {s === 'client' && 'Seus Dados'}
                </span>
              </div>
              {idx < 2 && (
                <ChevronRight className="w-5 h-5 text-gray-300 mx-1" />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">
              {step === 'service' && 'Escolha seu serviço'}
              {step === 'datetime' && 'Selecione data e horário'}
              {step === 'client' && 'Finalize seu agendamento'}
            </CardTitle>
            <CardDescription>
              {step === 'service' && 'Selecione o tipo de trança e o tamanho desejado'}
              {step === 'datetime' && 'Escolha um dia e horário disponível'}
              {step === 'client' && 'Preencha seus dados para confirmar'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'service' && (
              <ServiceSelection onSelect={handleServiceSelect} />
            )}
            {step === 'datetime' && selectedVariant && (
              <DateTimeSelection
                variant={selectedVariant}
                onSelect={handleDateTimeSelect}
              />
            )}
            {step === 'client' && selectedService && selectedVariant && selectedSlot && (
              <ClientForm
                service={selectedService}
                variant={selectedVariant}
                slot={selectedSlot}
              />
            )}
          </CardContent>
        </Card>

        {/* Back Button */}
        {step !== 'service' && (
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              className="w-full sm:w-auto"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
