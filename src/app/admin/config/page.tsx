"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Clock, CreditCard, MessageSquare, Shield } from 'lucide-react';

export default function ConfigPage() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Configurações</h1>
        <p className="text-gray-600">Configure seu sistema de agendamento</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Horário de Funcionamento
            </CardTitle>
            <CardDescription>
              Defina sua disponibilidade e intervalos entre atendimentos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Configure seus horários de atendimento por dia da semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Configurações PIX
            </CardTitle>
            <CardDescription>
              Configure sua chave PIX para receber pagamentos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Chave PIX atual: {process.env.NEXT_PUBLIC_PIX_KEY || 'Não configurado'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Templates de Mensagem
            </CardTitle>
            <CardDescription>
              Personalize as mensagens automáticas via WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Edite os templates de confirmação, lembrete e agradecimento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Políticas e LGPD
            </CardTitle>
            <CardDescription>
              Gerencie políticas de cancelamento e privacidade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Configure políticas de cancelamento, reagendamento e conformidade LGPD
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
