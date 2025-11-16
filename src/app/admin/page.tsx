"use client"

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, Clock, Users, DollarSign, AlertCircle, TrendingUp } from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [pendingAppointments, setPendingAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, todayRes, pendingRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/appointments/today'),
        fetch('/api/admin/appointments/pending'),
      ]);

      if (!statsRes.ok || !todayRes.ok || !pendingRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const [statsData, todayData, pendingData] = await Promise.all([
        statsRes.json(),
        todayRes.json(),
        pendingRes.json(),
      ]);

      setStats(statsData);
      setTodayAppointments(todayData);
      setPendingAppointments(pendingData);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      in_progress: 'Em Andamento',
      completed: 'Concluído',
      cancelled: 'Cancelado',
      no_show: 'Não Compareceu',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <p className="text-sm text-muted-foreground">Carregando dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-lg font-medium text-red-600">{error}</p>
        <Button onClick={fetchDashboardData}>Tentar Novamente</Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Visão geral do seu negócio</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.todayAppointments || 0}</div>
            <p className="text-xs text-muted-foreground">agendamentos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos 7 Dias</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.upcomingAppointments || 0}</div>
            <p className="text-xs text-muted-foreground">agendamentos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingAppointments || 0}</div>
            <p className="text-xs text-muted-foreground">aguardando confirmação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.monthlyRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">faturamento estimado</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Agendamentos de Hoje</span>
              <Badge variant="secondary">{todayAppointments.length}</Badge>
            </CardTitle>
            <CardDescription>
              {formatDate(new Date())}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todayAppointments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum agendamento para hoje
              </p>
            ) : (
              <div className="space-y-3">
                {todayAppointments.slice(0, 5).map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{apt.client.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {apt.service.name} - {apt.variant.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatTime(apt.scheduledStart)}</p>
                      <Badge className={getStatusColor(apt.status)} variant="secondary">
                        {getStatusLabel(apt.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {todayAppointments.length > 5 && (
              <Button asChild variant="outline" className="w-full mt-4">
                <Link href="/admin/agenda">Ver todos</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Pending Confirmations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Aguardando Confirmação</span>
              {pendingAppointments.length > 0 && (
                <Badge variant="destructive">{pendingAppointments.length}</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Novos agendamentos que precisam ser confirmados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingAppointments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Tudo em dia! 🎉
              </p>
            ) : (
              <div className="space-y-3">
                {pendingAppointments.slice(0, 5).map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{apt.client.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {apt.service.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(apt.scheduledStart)} às {formatTime(apt.scheduledStart)}
                      </p>
                    </div>
                    <Button asChild size="sm">
                      <Link href={`/admin/agendamentos/${apt.id}`}>
                        Revisar
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button asChild variant="outline">
              <Link href="/admin/agenda">
                <Calendar className="w-4 h-4 mr-2" />
                Ver Agenda
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/clientes">
                <Users className="w-4 h-4 mr-2" />
                Clientes
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/relatorios">
                <TrendingUp className="w-4 h-4 mr-2" />
                Relatórios
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/agendar" target="_blank">
                Ver Site Público
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}