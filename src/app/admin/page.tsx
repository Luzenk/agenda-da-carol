"use client"

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, Clock, Users, DollarSign, AlertCircle, TrendingUp } from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [pendingAppointments, setPendingAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    console.log('[DASHBOARD] Verificando autenticação...');
    
    // Check authentication
    const token = localStorage.getItem('admin_token');
    console.log('[DASHBOARD] Token encontrado:', token ? 'SIM (' + token.substring(0, 20) + '...)' : 'NÃO');
    
    if (!token) {
      console.log('[DASHBOARD] Sem token, redirecionando para login...');
      setAuthError('Sem token de autenticação');
      router.push('/admin/login');
      return;
    }
    
    console.log('[DASHBOARD] Token presente, buscando dados...');
    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('admin_token');
    
    if (!token) {
      console.log('[DASHBOARD] Token perdido antes do fetch!');
      setAuthError('Token perdido');
      router.push('/admin/login');
      return;
    }

    console.log('[DASHBOARD] Preparando headers com token...');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    try {
      console.log('[DASHBOARD] Fazendo fetch para APIs...');
      
      const [statsRes, todayRes, pendingRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/appointments/today', { headers }),
        fetch('/api/admin/appointments/pending', { headers }),
      ]);

      console.log('[DASHBOARD] Response status:', {
        stats: statsRes.status,
        today: todayRes.status,
        pending: pendingRes.status
      });

      // Check for auth errors
      if (statsRes.status === 401 || todayRes.status === 401 || pendingRes.status === 401) {
        console.error('[DASHBOARD] Erro 401 - token inválido ou expirado');
        setAuthError('Token inválido (401)');
        localStorage.removeItem('admin_token');
        router.push('/admin/login');
        return;
      }

      const [statsData, todayData, pendingData] = await Promise.all([
        statsRes.json(),
        todayRes.json(),
        pendingRes.json(),
      ]);

      console.log('[DASHBOARD] Dados recebidos:', {
        stats: statsData,
        todayCount: todayData.length,
        pendingCount: pendingData.length
      });

      setStats(statsData);
      setTodayAppointments(todayData);
      setPendingAppointments(pendingData);
      console.log('[DASHBOARD] Dashboard carregado com sucesso!');
    } catch (error) {
      console.error('[DASHBOARD] Erro ao buscar dados:', error);
      setAuthError('Erro ao carregar: ' + (error as Error).message);
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
        {authError && (
          <p className="text-sm text-red-600">Debug: {authError}</p>
        )}
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