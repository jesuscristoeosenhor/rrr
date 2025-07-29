import React, { memo } from 'react';
import { Users, GraduationCap, DollarSign, Calendar, TrendingUp, Activity } from 'lucide-react';
import { useAppState } from '@/contexts/AppStateContext';
import { formatCurrency } from '@/utils/helpers';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend?: {
    value: number;
    isUp: boolean;
  };
}

const StatCard = memo<StatCardProps>(({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </p>
        <p className={`text-3xl font-bold ${color} mt-2`}>
          {value}
        </p>
        {trend && (
          <div className={`flex items-center mt-2 text-sm ${
            trend.isUp ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className={`h-4 w-4 mr-1 ${trend.isUp ? '' : 'rotate-180'}`} />
            <span>{trend.value}% vs mês anterior</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-full bg-gray-100 dark:bg-gray-700`}>
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
    </div>
  </div>
));

export const Dashboard = memo(() => {
  const { alunos, professores } = useAppState();

  // Calculate statistics
  const totalAlunos = alunos.length;
  const alunosAtivos = alunos.filter(a => a.status === 'ativo').length;
  const professoresAtivos = professores.filter(p => p.status === 'ativo').length;
  
  // Mock financial data - in production this would come from financial records
  const receitaMensal = 25000;
  const aulasHoje = 15;

  const stats = [
    {
      title: 'Total de Alunos',
      value: totalAlunos,
      icon: Users,
      color: 'text-blue-600',
      trend: { value: 12, isUp: true }
    },
    {
      title: 'Professores Ativos',
      value: professoresAtivos,
      icon: GraduationCap,
      color: 'text-green-600',
      trend: { value: 5, isUp: true }
    },
    {
      title: 'Receita Mensal',
      value: formatCurrency(receitaMensal),
      icon: DollarSign,
      color: 'text-yellow-600',
      trend: { value: 8, isUp: true }
    },
    {
      title: 'Aulas Hoje',
      value: aulasHoje,
      icon: Calendar,
      color: 'text-purple-600',
    },
  ];

  const quickStats = [
    { label: 'Alunos Ativos', value: alunosAtivos, total: totalAlunos },
    { label: 'Taxa de Presença', value: 85, total: 100, isPercentage: true },
    { label: 'Avaliação Média', value: 4.8, total: 5, isRating: true },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Visão geral do sistema de gestão de futvolei
          </p>
        </div>
        <div className="flex items-center mt-4 sm:mt-0 space-x-2">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Activity className="h-4 w-4 mr-1" />
            <span>Atualizado há 5 min</span>
          </div>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Quick Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Estatísticas Rápidas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickStats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {stat.label}
              </p>
              <div className="flex items-center justify-center">
                {stat.isPercentage ? (
                  <span className="text-2xl font-bold text-green-600">
                    {stat.value}%
                  </span>
                ) : stat.isRating ? (
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-yellow-600">
                      {stat.value}
                    </span>
                    <span className="text-gray-400 ml-1">/ {stat.total}</span>
                    <span className="text-yellow-400 ml-2">⭐</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-blue-600">
                      {stat.value}
                    </span>
                    <span className="text-gray-400 ml-1">/ {stat.total}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Atividades Recentes
          </h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm text-gray-900 dark:text-white">
                  Novo aluno cadastrado: João Silva
                </p>
                <p className="text-xs text-gray-500">há 2 horas</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm text-gray-900 dark:text-white">
                  Aula agendada para amanhã às 14h
                </p>
                <p className="text-xs text-gray-500">há 4 horas</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm text-gray-900 dark:text-white">
                  Pagamento recebido: R$ 150,00
                </p>
                <p className="text-xs text-gray-500">há 6 horas</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Próximas Aulas
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Futvolei Iniciantes
                </p>
                <p className="text-xs text-gray-500">Prof. Carlos - 09:00</p>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Confirmada
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Futvolei Avançado
                </p>
                <p className="text-xs text-gray-500">Prof. Ana - 14:00</p>
              </div>
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                Pendente
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Futvolei Recreativo
                </p>
                <p className="text-xs text-gray-500">Prof. Carlos - 18:00</p>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Confirmada
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});