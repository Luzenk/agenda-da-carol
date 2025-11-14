"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart3, TrendingUp, DollarSign, Calendar, Loader2, Users, XCircle, CheckCircle2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

interface ReportData {
  occupancy: Array<{ date: string; count: number }>;
  revenue: Array<{ month: string; total: number }>;
  popularServices: Array<{ name: string; count: number }>;
  statistics: {
    total: number;
    completed: number;
    noShow: number;
    cancelled: number;
    pending: number;
    confirmed: number;
    conversionRate: number;
    noShowRate: number;
    cancellationRate: number;
    totalRevenue: number;
    averageTicket: number;
  };
}

const COLORS = ['#9333ea', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

export default function RelatoriosPage() {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/admin/reports');
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <p className="text-center text-muted-foreground">Erro ao carregar relatórios</p>
      </div>
    );
  }

  const { occupancy, revenue, popularServices, statistics } = reportData;

  // Dados para o gráfico de pizza de status
  const statusData = [
    { name: 'Concluídos', value: statistics.completed, color: '#10b981' },
    { name: 'Pendentes', value: statistics.pending, color: '#f59e0b' },
    { name: 'Confirmados', value: statistics.confirmed, color: '#3b82f6' },
    { name: 'No-Show', value: statistics.noShow, color: '#ef4444' },
    { name: 'Cancelados', value: statistics.cancelled, color: '#6b7280' }
  ].filter(item => item.value > 0);

  // Formatar data para exibição
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  // Formatar mês para exibição
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
  };

  // Preparar dados de ocupação
  const occupancyChartData = occupancy.map(item => ({
    date: formatDate(item.date),
    agendamentos: item.count
  }));

  // Preparar dados de receita
  const revenueChartData = revenue.map(item => ({
    mes: formatMonth(item.month),
    receita: item.total
  }));

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Relatórios</h1>
        <p className="text-gray-600">Análises e métricas do seu negócio</p>
      </div>

      {/* Cards de estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {statistics.totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Ticket médio: R$ {statistics.averageTicket}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Agendamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {statistics.total}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {statistics.completed} concluídos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa de Conversão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {statistics.conversionRate}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Agendamentos concluídos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa de No-Show
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {statistics.noShowRate}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {statistics.noShow} ausências
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Gráfico de Ocupação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Taxa de Ocupação (Últimos 30 dias)
            </CardTitle>
            <CardDescription>
              Número de agendamentos por dia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={occupancyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="agendamentos" 
                  stroke="#9333ea" 
                  strokeWidth={2}
                  dot={{ fill: '#9333ea' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Receita */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Receita por Mês (Últimos 6 meses)
            </CardTitle>
            <CardDescription>
              Faturamento mensal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip 
                  formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                />
                <Legend />
                <Bar 
                  dataKey="receita" 
                  fill="#10b981" 
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Serviços Mais Populares */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Serviços Mais Populares
            </CardTitle>
            <CardDescription>
              Top 10 serviços mais agendados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {popularServices.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={popularServices} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" fontSize={12} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={120} 
                    fontSize={12}
                  />
                  <Tooltip />
                  <Bar 
                    dataKey="count" 
                    fill="#ec4899" 
                    radius={[0, 8, 8, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>Nenhum dado disponível</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status dos Agendamentos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Status dos Agendamentos
            </CardTitle>
            <CardDescription>
              Distribuição por status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="50%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2 ml-4">
                  {statusData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">
                        {item.name}: {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>Nenhum dado disponível</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}