import React, { useState, useMemo, useCallback } from 'react';
import { 
  TrendingUp, TrendingDown, Users, Calendar, DollarSign, Activity,
  BarChart3, PieChart, MapPin, Clock, Star, ArrowUpRight, ArrowDownRight,
  Eye, Download, RefreshCw, Filter, ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocalStorage } from '@/hooks/useStorage';
import { Agendamento, Transacao, Usuario, Quadra, DashboardStats } from '@/types';

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: React.ReactNode;
  color: string;
  trend: 'up' | 'down' | 'neutral';
}

interface ChartData {
  name: string;
  value: number;
  color?: string;
}

const EnhancedDashboard: React.FC = () => {
  const { user, hasPermission } = useAuth();
  
  // Data from localStorage
  const [agendamentos] = useLocalStorage<Agendamento[]>('agendamentos', []);
  const [transacoes] = useLocalStorage<Transacao[]>('financeiro', []);
  const [usuarios] = useLocalStorage<Usuario[]>('system_users', []);
  const [quadras] = useLocalStorage<Quadra[]>('quadras', []);
  
  // State
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'year'>('week');
  const [isLoading, setIsLoading] = useState(false);

  // Date range calculations
  const getDateRange = useCallback(() => {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();

    switch (dateRange) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'week':
        const dayOfWeek = now.getDay();
        startDate.setDate(now.getDate() - dayOfWeek);
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'month':
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setMonth(startDate.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'year':
        startDate.setMonth(0, 1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setMonth(11, 31);
        endDate.setHours(23, 59, 59, 999);
        break;
    }

    return { startDate, endDate };
  }, [dateRange]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const { startDate, endDate } = getDateRange();
    
    // Filter data by date range
    const periodAgendamentos = agendamentos.filter(a => {
      const agendamentoDate = new Date(a.data);
      return agendamentoDate >= startDate && agendamentoDate <= endDate;
    });

    const periodTransacoes = transacoes.filter(t => {
      const transacaoDate = new Date(t.data);
      return transacaoDate >= startDate && transacaoDate <= endDate;
    });

    // Previous period for comparison
    const periodLength = endDate.getTime() - startDate.getTime();
    const prevStartDate = new Date(startDate.getTime() - periodLength);
    const prevEndDate = new Date(endDate.getTime() - periodLength);

    const prevPeriodAgendamentos = agendamentos.filter(a => {
      const agendamentoDate = new Date(a.data);
      return agendamentoDate >= prevStartDate && agendamentoDate <= prevEndDate;
    });

    const prevPeriodTransacoes = transacoes.filter(t => {
      const transacaoDate = new Date(t.data);
      return transacaoDate >= prevStartDate && transacaoDate <= prevEndDate;
    });

    // Calculate metrics
    const totalBookings = periodAgendamentos.length;
    const prevTotalBookings = prevPeriodAgendamentos.length;
    const bookingsChange = prevTotalBookings > 0 
      ? ((totalBookings - prevTotalBookings) / prevTotalBookings) * 100 
      : 0;

    const totalRevenue = periodTransacoes
      .filter(t => t.tipo === 'receita')
      .reduce((sum, t) => sum + t.valor, 0);
    const prevTotalRevenue = prevPeriodTransacoes
      .filter(t => t.tipo === 'receita')
      .reduce((sum, t) => sum + t.valor, 0);
    const revenueChange = prevTotalRevenue > 0 
      ? ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100 
      : 0;

    const activeUsers = usuarios.filter(u => u.ativo && u.tipo === 'aluno').length;
    const occupancyRate = quadras.length > 0 
      ? (periodAgendamentos.length / (quadras.length * 30)) * 100 
      : 0;

    const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    return {
      totalBookings,
      bookingsChange,
      totalRevenue,
      revenueChange,
      activeUsers,
      occupancyRate,
      avgBookingValue,
      confirmedBookings: periodAgendamentos.filter(a => a.status === 'confirmado').length,
      canceledBookings: periodAgendamentos.filter(a => a.status === 'cancelado').length
    };
  }, [agendamentos, transacoes, usuarios, quadras, getDateRange]);

  // Metric cards configuration
  const metricCards: MetricCard[] = [
    {
      title: 'Total de Agendamentos',
      value: metrics.totalBookings,
      change: metrics.bookingsChange,
      changeLabel: 'vs período anterior',
      icon: <Calendar className="text-blue-600" size={24} />,
      color: 'blue',
      trend: metrics.bookingsChange >= 0 ? 'up' : 'down'
    },
    {
      title: 'Receita Total',
      value: `R$ ${metrics.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: metrics.revenueChange,
      changeLabel: 'vs período anterior',
      icon: <DollarSign className="text-green-600" size={24} />,
      color: 'green',
      trend: metrics.revenueChange >= 0 ? 'up' : 'down'
    },
    {
      title: 'Usuários Ativos',
      value: metrics.activeUsers,
      change: 0,
      changeLabel: 'total cadastrados',
      icon: <Users className="text-purple-600" size={24} />,
      color: 'purple',
      trend: 'neutral'
    },
    {
      title: 'Taxa de Ocupação',
      value: `${metrics.occupancyRate.toFixed(1)}%`,
      change: 0,
      changeLabel: 'média do período',
      icon: <Activity className="text-orange-600" size={24} />,
      color: 'orange',
      trend: 'neutral'
    },
    {
      title: 'Valor Médio por Agendamento',
      value: `R$ ${metrics.avgBookingValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: 0,
      changeLabel: 'média do período',
      icon: <TrendingUp className="text-indigo-600" size={24} />,
      color: 'indigo',
      trend: 'neutral'
    },
    {
      title: 'Agendamentos Confirmados',
      value: metrics.confirmedBookings,
      change: 0,
      changeLabel: `${metrics.totalBookings} total`,
      icon: <Star className="text-yellow-600" size={24} />,
      color: 'yellow',
      trend: 'neutral'
    }
  ];

  // Chart data
  const bookingsByType = useMemo(() => {
    const { startDate, endDate } = getDateRange();
    const periodAgendamentos = agendamentos.filter(a => {
      const agendamentoDate = new Date(a.data);
      return agendamentoDate >= startDate && agendamentoDate <= endDate;
    });

    const typeCount = periodAgendamentos.reduce((acc, booking) => {
      acc[booking.tipo] = (acc[booking.tipo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const typeLabels = {
      'aula': 'Aulas',
      'jogo-livre': 'Jogos Livres',
      'treino': 'Treinos',
      'evento': 'Eventos'
    };

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

    return Object.entries(typeCount).map(([type, count], index) => ({
      name: typeLabels[type] || type,
      value: count,
      color: colors[index % colors.length]
    }));
  }, [agendamentos, getDateRange]);

  const revenueByDay = useMemo(() => {
    const { startDate, endDate } = getDateRange();
    const dailyRevenue: Record<string, number> = {};

    // Initialize all days with 0
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      dailyRevenue[dateKey] = 0;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Add revenue data
    transacoes
      .filter(t => {
        const transacaoDate = new Date(t.data);
        return transacaoDate >= startDate && transacaoDate <= endDate && t.tipo === 'receita';
      })
      .forEach(transacao => {
        const dateKey = new Date(transacao.data).toISOString().split('T')[0];
        if (dailyRevenue[dateKey] !== undefined) {
          dailyRevenue[dateKey] += transacao.valor;
        }
      });

    return Object.entries(dailyRevenue)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({
        name: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        value: value
      }));
  }, [transacoes, getDateRange]);

  // Handle data refresh
  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  }, []);

  const canViewReports = hasPermission('relatorios', 'ler');
  const canViewFinanceiro = hasPermission('financeiro', 'ler');

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              📊 Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Visão geral do desempenho do seu centro de treinamento
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Date Range Selector */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="today">Hoje</option>
              <option value="week">Esta Semana</option>
              <option value="month">Este Mês</option>
              <option value="year">Este Ano</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className={`flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm ${
                isLoading ? 'cursor-not-allowed opacity-50' : ''
              }`}
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              Atualizar
            </button>

            {/* Export Button */}
            {canViewReports && (
              <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm">
                <Download size={16} />
                Exportar
              </button>
            )}
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {metricCards.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Bookings by Type Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Agendamentos por Tipo
              </h3>
              <PieChart className="text-gray-400" size={20} />
            </div>
            
            {bookingsByType.length > 0 ? (
              <div className="space-y-3">
                {bookingsByType.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {item.value}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({((item.value / metrics.totalBookings) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <PieChart size={48} className="mx-auto mb-2" />
                <p>Nenhum dado disponível</p>
              </div>
            )}
          </div>

          {/* Revenue Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Receita Diária
              </h3>
              <BarChart3 className="text-gray-400" size={20} />
            </div>
            
            {canViewFinanceiro ? (
              revenueByDay.length > 0 ? (
                <div className="space-y-2">
                  {revenueByDay.slice(-7).map((item, index) => {
                    const maxValue = Math.max(...revenueByDay.map(d => d.value));
                    const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
                    
                    return (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-12 text-xs text-gray-600 dark:text-gray-400">
                          {item.name}
                        </div>
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative">
                          <div 
                            className="bg-green-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300">
                            R$ {item.value.toFixed(0)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <BarChart3 size={48} className="mx-auto mb-2" />
                  <p>Nenhum dado disponível</p>
                </div>
              )
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Eye size={48} className="mx-auto mb-2" />
                <p>Acesso restrito</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Ações Rápidas
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Novo Agendamento', icon: <Calendar size={20} />, color: 'blue', href: '/agendamentos' },
              { title: 'Gerenciar Quadras', icon: <MapPin size={20} />, color: 'green', href: '/quadras' },
              { title: 'Relatórios', icon: <BarChart3 size={20} />, color: 'purple', href: '/relatorios' },
              { title: 'Configurações', icon: <Activity size={20} />, color: 'orange', href: '/configuracoes' }
            ].map((action, index) => (
              <button
                key={index}
                className={`flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-${action.color}-400 hover:bg-${action.color}-50 dark:hover:bg-${action.color}-900/20 transition-colors group`}
              >
                <div className={`text-${action.color}-600 group-hover:text-${action.color}-700`}>
                  {action.icon}
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {action.title}
                  </div>
                </div>
                <ChevronRight size={16} className="ml-auto text-gray-400 group-hover:text-gray-600" />
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Atividade Recente
            </h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
              Ver todas
            </button>
          </div>
          
          <div className="space-y-4">
            {agendamentos.slice(0, 5).map((agendamento, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <Calendar className="text-blue-600 dark:text-blue-400" size={16} />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {agendamento.participantes[0]?.nome || 'Agendamento'} - {agendamento.tipo}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(agendamento.data).toLocaleDateString('pt-BR')} às {agendamento.horarioInicio}
                  </div>
                </div>
                <div className={`text-sm px-2 py-1 rounded-full ${
                  agendamento.status === 'confirmado' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                }`}>
                  {agendamento.status}
                </div>
              </div>
            ))}
            
            {agendamentos.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Activity size={48} className="mx-auto mb-2" />
                <p>Nenhuma atividade recente</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard: React.FC<MetricCard> = ({ 
  title, 
  value, 
  change, 
  changeLabel, 
  icon, 
  color, 
  trend 
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 bg-${color}-100 dark:bg-${color}-900/20 rounded-lg`}>
          {icon}
        </div>
        {trend !== 'neutral' && (
          <div className={`flex items-center gap-1 text-sm ${
            trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {value}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {title}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500">
          {changeLabel}
        </p>
      </div>
    </div>
  );
};

export default EnhancedDashboard;