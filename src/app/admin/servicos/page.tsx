"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Package, Plus, Edit, Trash2, Clock, DollarSign, Loader2, X, Image as ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

interface ServiceVariant {
  id: number;
  name: string;
  description: string | null;
  durationMin: number;
  price: number;
  active: boolean;
}

interface Service {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  active: boolean;
  variants: ServiceVariant[];
}

export default function ServicosPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [isVariantDialogOpen, setIsVariantDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingVariant, setEditingVariant] = useState<ServiceVariant | null>(null);
  const [selectedServiceForVariant, setSelectedServiceForVariant] = useState<number | null>(null);

  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    imageUrl: '',
    active: true
  });

  const [variantForm, setVariantForm] = useState({
    name: '',
    description: '',
    durationMin: '',
    price: '',
    active: true
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/admin/services');
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Erro ao carregar serviços');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveService = async () => {
    if (!serviceForm.name) {
      toast.error('Nome do serviço é obrigatório');
      return;
    }

    try {
      const url = editingService 
        ? `/api/admin/services/${editingService.id}`
        : '/api/admin/services';
      
      const method = editingService ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceForm)
      });

      if (response.ok) {
        toast.success(editingService ? 'Serviço atualizado!' : 'Serviço criado!');
        fetchServices();
        setIsServiceDialogOpen(false);
        resetServiceForm();
      } else {
        toast.error('Erro ao salvar serviço');
      }
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error('Erro ao salvar serviço');
    }
  };

  const handleDeleteService = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return;

    try {
      const response = await fetch(`/api/admin/services/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Serviço excluído!');
        fetchServices();
      } else {
        toast.error('Erro ao excluir serviço');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Erro ao excluir serviço');
    }
  };

  const handleSaveVariant = async () => {
    if (!selectedServiceForVariant) return;
    if (!variantForm.name || !variantForm.durationMin || !variantForm.price) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const url = editingVariant
        ? `/api/admin/variants/${editingVariant.id}`
        : '/api/admin/variants';
      
      const method = editingVariant ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...variantForm,
          serviceId: selectedServiceForVariant
        })
      });

      if (response.ok) {
        toast.success(editingVariant ? 'Variante atualizada!' : 'Variante criada!');
        fetchServices();
        setIsVariantDialogOpen(false);
        resetVariantForm();
      } else {
        toast.error('Erro ao salvar variante');
      }
    } catch (error) {
      console.error('Error saving variant:', error);
      toast.error('Erro ao salvar variante');
    }
  };

  const handleDeleteVariant = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta variante?')) return;

    try {
      const response = await fetch(`/api/admin/variants/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Variante excluída!');
        fetchServices();
      } else {
        toast.error('Erro ao excluir variante');
      }
    } catch (error) {
      console.error('Error deleting variant:', error);
      toast.error('Erro ao excluir variante');
    }
  };

  const openServiceDialog = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setServiceForm({
        name: service.name,
        description: service.description || '',
        imageUrl: service.imageUrl || '',
        active: service.active
      });
    } else {
      resetServiceForm();
    }
    setIsServiceDialogOpen(true);
  };

  const openVariantDialog = (serviceId: number, variant?: ServiceVariant) => {
    setSelectedServiceForVariant(serviceId);
    if (variant) {
      setEditingVariant(variant);
      setVariantForm({
        name: variant.name,
        description: variant.description || '',
        durationMin: variant.durationMin.toString(),
        price: variant.price.toString(),
        active: variant.active
      });
    } else {
      resetVariantForm();
    }
    setIsVariantDialogOpen(true);
  };

  const resetServiceForm = () => {
    setServiceForm({ name: '', description: '', imageUrl: '', active: true });
    setEditingService(null);
  };

  const resetVariantForm = () => {
    setVariantForm({ name: '', description: '', durationMin: '', price: '', active: true });
    setEditingVariant(null);
    setSelectedServiceForVariant(null);
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
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Serviços</h1>
          <p className="text-gray-600">Gerencie seus serviços e variantes</p>
        </div>
        <Button onClick={() => openServiceDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Serviço
        </Button>
      </div>

      <div className="space-y-6">
        {services.map(service => (
          <Card key={service.id}>
            <CardHeader>
              <div className="flex flex-col md:flex-row gap-4">
                {service.imageUrl && (
                  <img
                    src={service.imageUrl}
                    alt={service.name}
                    className="w-full md:w-32 h-32 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {service.name}
                        {!service.active && (
                          <Badge variant="secondary">Inativo</Badge>
                        )}
                      </CardTitle>
                      {service.description && (
                        <CardDescription className="mt-2">
                          {service.description}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openServiceDialog(service)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteService(service.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm text-muted-foreground">
                  Variantes ({service.variants.length})
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openVariantDialog(service.id)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Variante
                </Button>
              </div>

              {service.variants.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Nenhuma variante cadastrada
                </p>
              ) : (
                <div className="grid gap-3">
                  {service.variants.map(variant => (
                    <div
                      key={variant.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{variant.name}</div>
                        {variant.description && (
                          <div className="text-sm text-muted-foreground">
                            {variant.description}
                          </div>
                        )}
                        <div className="flex gap-4 mt-2">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            {variant.durationMin} min
                          </div>
                          <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                            <DollarSign className="w-4 h-4" />
                            {formatCurrency(variant.price)}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openVariantDialog(service.id, variant)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteVariant(variant.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {services.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">Nenhum serviço cadastrado</p>
              <p className="text-sm text-muted-foreground mb-4">
                Comece criando seu primeiro serviço
              </p>
              <Button onClick={() => openServiceDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Serviço
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Service Dialog */}
      <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingService ? 'Editar Serviço' : 'Novo Serviço'}
            </DialogTitle>
            <DialogDescription>
              Preencha as informações do serviço
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="service-name">Nome do Serviço *</Label>
              <Input
                id="service-name"
                value={serviceForm.name}
                onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                placeholder="Ex: Box Braids"
                required
              />
            </div>
            <div>
              <Label htmlFor="service-description">Descrição</Label>
              <Textarea
                id="service-description"
                value={serviceForm.description}
                onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                placeholder="Descrição do serviço para o site público"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="service-image">Foto do Serviço (URL)</Label>
              <div className="flex gap-2">
                <Input
                  id="service-image"
                  value={serviceForm.imageUrl}
                  onChange={(e) => setServiceForm({ ...serviceForm, imageUrl: e.target.value })}
                  placeholder="https://exemplo.com/foto.jpg"
                />
                {serviceForm.imageUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setServiceForm({ ...serviceForm, imageUrl: '' })}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              {serviceForm.imageUrl && (
                <img
                  src={serviceForm.imageUrl}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg mt-2"
                />
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Esta foto será exibida no site público
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsServiceDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveService}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Variant Dialog */}
      <Dialog open={isVariantDialogOpen} onOpenChange={setIsVariantDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingVariant ? 'Editar Variante' : 'Nova Variante'}
            </DialogTitle>
            <DialogDescription>
              Preencha as informações da variante (tamanho, complexidade, etc.)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="variant-name">Nome da Variante *</Label>
              <Input
                id="variant-name"
                value={variantForm.name}
                onChange={(e) => setVariantForm({ ...variantForm, name: e.target.value })}
                placeholder="Ex: Tamanho Médio, Simples, Com Jumbo"
                required
              />
            </div>
            <div>
              <Label htmlFor="variant-description">Descrição</Label>
              <Textarea
                id="variant-description"
                value={variantForm.description}
                onChange={(e) => setVariantForm({ ...variantForm, description: e.target.value })}
                placeholder="Descrição da variante"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="variant-duration">Duração (minutos) *</Label>
                <Input
                  id="variant-duration"
                  type="number"
                  min="0"
                  value={variantForm.durationMin}
                  onChange={(e) => setVariantForm({ ...variantForm, durationMin: e.target.value })}
                  placeholder="180"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Tempo que leva para fazer o serviço
                </p>
              </div>
              <div>
                <Label htmlFor="variant-price">Preço (R$) *</Label>
                <Input
                  id="variant-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={variantForm.price}
                  onChange={(e) => setVariantForm({ ...variantForm, price: e.target.value })}
                  placeholder="150.00"
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVariantDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveVariant}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}