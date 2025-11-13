"use client"

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  Loader2, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  DollarSign,
  Image as ImageIcon,
  Plus,
  X,
  User
} from 'lucide-react';
import { ClientForm } from '@/components/admin/ClientForm';
import { formatPhone, formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const [photoForm, setPhotoForm] = useState({
    photoUrl: '',
    description: '',
    appointmentId: null as number | null,
  });
  const [deletingPhoto, setDeletingPhoto] = useState<number | null>(null);

  useEffect(() => {
    fetchClient();
  }, [id]);

  const fetchClient = async () => {
    try {
      const response = await fetch(`/api/admin/clients/${id}`);
      if (!response.ok) throw new Error('Cliente não encontrado');
      const data = await response.json();
      setClient(data);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar cliente');
      router.push('/admin/clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return;

    try {
      const response = await fetch(`/api/admin/clients/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      toast.success(data.message || 'Cliente excluído');
      router.push('/admin/clientes');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir cliente');
    }
  };

  const handleAddPhoto = async () => {
    if (!photoForm.photoUrl) {
      toast.error('URL da foto é obrigatório');
      return;
    }

    try {
      const response = await fetch(`/api/admin/clients/${id}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(photoForm),
      });

      if (!response.ok) throw new Error('Erro ao adicionar foto');

      toast.success('Foto adicionada!');
      setShowPhotoDialog(false);
      setPhotoForm({ photoUrl: '', description: '', appointmentId: null });
      fetchClient();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao adicionar foto');
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    if (!confirm('Tem certeza que deseja excluir esta foto?')) return;

    setDeletingPhoto(photoId);
    try {
      const response = await fetch(`/api/admin/clients/${id}/photos/${photoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao excluir foto');

      toast.success('Foto excluída!');
      fetchClient();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir foto');
    } finally {
      setDeletingPhoto(null);
    }
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!client) return null;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/clientes')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Clientes
        </Button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{client.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {!client.active && <Badge variant="secondary">Inativo</Badge>}
              {client.lgpdConsent && <Badge variant="outline">LGPD ✓</Badge>}
              {client.marketingConsent && <Badge variant="outline">Marketing ✓</Badge>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowEditDialog(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </Button>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Total de Visitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{client.totalVisits}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Total Gasto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(client.totalSpent)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Primeira Visita
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {client.firstVisit ? formatDate(client.firstVisit) : 'Nunca'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Fotos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{client.photos?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            {client.profilePhoto ? (
              <img
                src={client.profilePhoto}
                alt={client.name}
                className="w-32 h-32 rounded-full object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-purple-100 flex items-center justify-center">
                <User className="w-16 h-16 text-purple-600" />
              </div>
            )}

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">WhatsApp</p>
                <p className="font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {formatPhone(client.phone)}
                </p>
              </div>

              {client.email && (
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {client.email}
                  </p>
                </div>
              )}

              {client.birthDate && (
                <div>
                  <p className="text-sm text-muted-foreground">Idade</p>
                  <p className="font-medium">
                    {calculateAge(client.birthDate)} anos
                  </p>
                </div>
              )}

              {client.gender && (
                <div>
                  <p className="text-sm text-muted-foreground">Sexo</p>
                  <p className="font-medium">
                    {client.gender === 'F' ? 'Feminino' : client.gender === 'M' ? 'Masculino' : 'Outro'}
                  </p>
                </div>
              )}

              {client.cpf && (
                <div>
                  <p className="text-sm text-muted-foreground">CPF</p>
                  <p className="font-medium">{client.cpf}</p>
                </div>
              )}

              {client.address && (
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Endereço</p>
                  <p className="font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {client.address}
                  </p>
                </div>
              )}

              {client.notes && (
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Observações</p>
                  <p className="font-medium">{client.notes}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="appointments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="appointments">
            Histórico de Atendimentos ({client.appointments?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="photos">
            Galeria de Fotos ({client.photos?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Atendimentos</CardTitle>
            </CardHeader>
            <CardContent>
              {!client.appointments || client.appointments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum atendimento registrado
                </p>
              ) : (
                <div className="space-y-3">
                  {client.appointments.map((appointment: any) => (
                    <div
                      key={appointment.id}
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1 mb-2 md:mb-0">
                        <p className="font-semibold">
                          {appointment.service?.name}
                          {appointment.variant && ` - ${appointment.variant.name}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(appointment.scheduledStart)}
                        </p>
                        <Badge variant={
                          appointment.status === 'completed' ? 'default' :
                          appointment.status === 'confirmed' ? 'secondary' :
                          appointment.status === 'cancelled' ? 'destructive' :
                          'outline'
                        } className="mt-1">
                          {appointment.status}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-purple-600">
                          {formatCurrency(appointment.price || 0)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.paymentStatus}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="photos">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Galeria de Fotos</CardTitle>
                <Button onClick={() => setShowPhotoDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Foto
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!client.photos || client.photos.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma foto registrada
                </p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {client.photos.map((photo: any) => (
                    <div key={photo.id} className="relative group">
                      <img
                        src={photo.photoUrl}
                        alt={photo.description || 'Cliente foto'}
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeletePhoto(photo.id)}
                          disabled={deletingPhoto === photo.id}
                        >
                          {deletingPhoto === photo.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      {photo.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {photo.description}
                        </p>
                      )}
                      {photo.appointment && (
                        <p className="text-xs text-purple-600 font-medium">
                          {photo.appointment.service?.name}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          <ClientForm
            client={client}
            onSuccess={() => {
              setShowEditDialog(false);
              fetchClient();
            }}
            onCancel={() => setShowEditDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Add Photo Dialog */}
      <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Foto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="photoUrl">URL da Foto *</Label>
              <Input
                id="photoUrl"
                value={photoForm.photoUrl}
                onChange={(e) => setPhotoForm({ ...photoForm, photoUrl: e.target.value })}
                placeholder="https://exemplo.com/foto.jpg"
              />
              {photoForm.photoUrl && (
                <img
                  src={photoForm.photoUrl}
                  alt="Preview"
                  className="w-full aspect-square object-cover rounded-lg mt-2"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={photoForm.description}
                onChange={(e) => setPhotoForm({ ...photoForm, description: e.target.value })}
                placeholder="Descrição da trança, estilo, etc."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPhotoDialog(false);
                  setPhotoForm({ photoUrl: '', description: '', appointmentId: null });
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleAddPhoto}>
                Adicionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
