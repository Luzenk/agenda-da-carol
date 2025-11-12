"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Clock, CreditCard, MessageSquare, Shield, Loader2, Plus, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';

interface AvailabilityRule {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  active: boolean;
}

export default function ConfigPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availabilityRules, setAvailabilityRules] = useState<AvailabilityRule[]>([]);
  
  const [businessSettings, setBusinessSettings] = useState({
    businessName: '',
    address: '',
    phone: '',
    whatsappNumber: '',
    pixKey: '',
    pixName: '',
    pixCity: ''
  });

  const weekDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  useEffect(() => {
    fetchSettings();
    fetchAvailability();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      const data = await response.json();
      
      if (data.business_info) {
        setBusinessSettings({
          businessName: data.business_info.businessName || '',
          address: data.business_info.address || '',
          phone: data.business_info.phone || '',
          whatsappNumber: data.business_info.whatsappNumber || '',
          pixKey: data.business_info.pixKey || '',
          pixName: data.business_info.pixName || '',
          pixCity: data.business_info.pixCity || ''
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async () => {
    try {
      const response = await fetch('/api/admin/availability');
      const data = await response.json();
      setAvailabilityRules(data);
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  const handleSaveBusinessSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'business_info',
          value: businessSettings
        })
      });

      if (response.ok) {
        toast.success('Configurações salvas com sucesso!');
      } else {
        toast.error('Erro ao salvar configurações');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAvailability = async (dayOfWeek: number) => {
    try {
      const response = await fetch('/api/admin/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayOfWeek,
          startTime: '09:00',
          endTime: '18:00',
          active: true
        })
      });

      if (response.ok) {
        toast.success('Horário adicionado!');
        fetchAvailability();
      } else {
        toast.error('Erro ao adicionar horário');
      }
    } catch (error) {
      console.error('Error adding availability:', error);
      toast.error('Erro ao adicionar horário');
    }
  };

  const handleUpdateAvailability = async (rule: AvailabilityRule) => {
    try {
      const response = await fetch('/api/admin/availability', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rule)
      });

      if (response.ok) {
        toast.success('Horário atualizado!');
        fetchAvailability();
      } else {
        toast.error('Erro ao atualizar horário');
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Erro ao atualizar horário');
    }
  };

  const handleDeleteAvailability = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este horário?')) return;

    try {
      const response = await fetch(`/api/admin/availability?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Horário excluído!');
        fetchAvailability();
      } else {
        toast.error('Erro ao excluir horário');
      }
    } catch (error) {
      console.error('Error deleting availability:', error);
      toast.error('Erro ao excluir horário');
    }
  };

  const getRulesForDay = (dayOfWeek: number) => {
    return availabilityRules.filter(rule => rule.dayOfWeek === dayOfWeek);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Configurações</h1>
        <p className="text-gray-600">Configure seu sistema de agendamento</p>
      </div>

      <Tabs defaultValue="business" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="business">Negócio</TabsTrigger>
          <TabsTrigger value="availability">Horários</TabsTrigger>
          <TabsTrigger value="payment">Pagamento</TabsTrigger>
        </TabsList>

        {/* Business Info Tab */}
        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Informações do Negócio
              </CardTitle>
              <CardDescription>
                Configure as informações básicas do seu negócio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="businessName">Nome do Negócio</Label>
                <Input
                  id="businessName"
                  value={businessSettings.businessName}
                  onChange={(e) => setBusinessSettings({ ...businessSettings, businessName: e.target.value })}
                  placeholder="Agenda da Carol"
                />
              </div>

              <div>
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={businessSettings.address}
                  onChange={(e) => setBusinessSettings({ ...businessSettings, address: e.target.value })}
                  placeholder="Rua Example, 123 - Bairro"
                />
              </div>

              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={businessSettings.phone}
                  onChange={(e) => setBusinessSettings({ ...businessSettings, phone: e.target.value })}
                  placeholder="(11) 98765-4321"
                />
              </div>

              <div>
                <Label htmlFor="whatsappNumber">Número do WhatsApp</Label>
                <Input
                  id="whatsappNumber"
                  value={businessSettings.whatsappNumber}
                  onChange={(e) => setBusinessSettings({ ...businessSettings, whatsappNumber: e.target.value })}
                  placeholder="5511987654321"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Digite apenas números com código do país (Ex: 5511987654321)
                </p>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveBusinessSettings} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Availability Tab */}
        <TabsContent value="availability" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Horário de Funcionamento
              </CardTitle>
              <CardDescription>
                Defina sua disponibilidade por dia da semana
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {weekDays.map((dayName, dayOfWeek) => {
                const dayRules = getRulesForDay(dayOfWeek);
                
                return (
                  <div key={dayOfWeek} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{dayName}</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddAvailability(dayOfWeek)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Horário
                      </Button>
                    </div>

                    {dayRules.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Fechado
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {dayRules.map((rule) => (
                          <div key={rule.id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                            <div className="flex-1 grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs">Início</Label>
                                <Input
                                  type="time"
                                  value={rule.startTime}
                                  onChange={(e) => {
                                    const updated = { ...rule, startTime: e.target.value };
                                    handleUpdateAvailability(updated);
                                  }}
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Fim</Label>
                                <Input
                                  type="time"
                                  value={rule.endTime}
                                  onChange={(e) => {
                                    const updated = { ...rule, endTime: e.target.value };
                                    handleUpdateAvailability(updated);
                                  }}
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={rule.active}
                                onCheckedChange={(checked) => {
                                  const updated = { ...rule, active: checked };
                                  handleUpdateAvailability(updated);
                                }}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteAvailability(rule.id)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Tab */}
        <TabsContent value="payment" className="space-y-6">
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
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="pixKey">Chave PIX</Label>
                <Input
                  id="pixKey"
                  value={businessSettings.pixKey}
                  onChange={(e) => setBusinessSettings({ ...businessSettings, pixKey: e.target.value })}
                  placeholder="seu@email.com ou CPF/CNPJ ou telefone"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Pode ser e-mail, CPF, CNPJ, telefone ou chave aleatória
                </p>
              </div>

              <div>
                <Label htmlFor="pixName">Nome do Beneficiário</Label>
                <Input
                  id="pixName"
                  value={businessSettings.pixName}
                  onChange={(e) => setBusinessSettings({ ...businessSettings, pixName: e.target.value })}
                  placeholder="Carol Silva"
                />
              </div>

              <div>
                <Label htmlFor="pixCity">Cidade</Label>
                <Input
                  id="pixCity"
                  value={businessSettings.pixCity}
                  onChange={(e) => setBusinessSettings({ ...businessSettings, pixCity: e.target.value })}
                  placeholder="SAO PAULO"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use letras maiúsculas sem acentos
                </p>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveBusinessSettings} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}