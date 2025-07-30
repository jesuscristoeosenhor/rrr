import { memo, useState, useMemo, useCallback } from 'react';
import { 
  DollarSign, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle, 
  CreditCard,
  AlertCircle 
} from 'lucide-react';
import { useAppState } from '@/contexts/AppStateContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAdvancedFilter } from '@/hooks/useAdvancedFilter';
import { StatsCard } from '@/components/common/StatsCard';
import { SearchBar } from '@/components/common/SearchBar';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/common/Button';
import { Transacao, FilterOptions } from '@/types';
import { exportToCSV, formatCurrency, formatDate } from '@/utils/helpers';

export const FinanceiroPage = memo(() => {
  const { 
    transacoes, 
    userLogado, 
    planos
  } = useAppState();
  const { addNotification } = useNotifications();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({});

  // Filtrar dados baseado no tipo de usuário
  const dadosFinanceiros = useMemo(() => {
    if (userLogado?.tipo === 'aluno') {
      return transacoes.filter(f => f.alunoId === userLogado?.id);
    }
    if (userLogado?.tipo === 'professor') {
      // Professor payments would need a professorId field in Transacao
      return transacoes.filter(f => f.alunoId === userLogado?.id); // Temporary fix
    }
    return transacoes;
  }, [transacoes, userLogado]);

  const filteredTransacoes = useAdvancedFilter(dadosFinanceiros, { 
    ...filters,
    searchTerm,
  });

  // Estatísticas calculadas
  const stats = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const transacoesDoMes = filteredTransacoes.filter(t => {
      const transacaoDate = new Date(t.data);
      return transacaoDate.getMonth() === currentMonth && transacaoDate.getFullYear() === currentYear;
    });

    const receitaTotal = transacoesDoMes
      .filter(t => t.tipo === 'receita' && t.status === 'pago')
      .reduce((acc, t) => acc + t.valor, 0);

    const despesaTotal = transacoesDoMes
      .filter(t => t.tipo === 'despesa')
      .reduce((acc, t) => acc + t.valor, 0);
      
    const pendentes = transacoesDoMes
      .filter(t => t.status === 'pendente')
      .reduce((acc, t) => acc + t.valor, 0);

    const lucroLiquido = receitaTotal - despesaTotal;

    return { receitaTotal, despesaTotal, pendentes, lucroLiquido };
  }, [filteredTransacoes]);

  const colunas = useMemo(() => [
    {
      key: 'data',
      label: 'Data',
      render: (transacao: Transacao) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {formatDate(transacao.data)}
        </div>
      )
    },
    {
      key: 'descricao',
      label: 'Descrição',
      render: (transacao: Transacao) => (
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {transacao.descricao}
          </div>
          {transacao.aluno && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {transacao.aluno}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'tipo',
      label: 'Tipo',
      render: (transacao: Transacao) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          transacao.tipo === 'receita' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        }`}>
          {transacao.tipo}
        </span>
      )
    },
    {
      key: 'valor',
      label: 'Valor',
      render: (transacao: Transacao) => (
        <div className={`text-sm font-semibold ${
          transacao.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
        }`}>
          {transacao.tipo === 'despesa' && '- '}
          {formatCurrency(transacao.valor)}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (transacao: Transacao) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          transacao.status === 'pago' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
        }`}>
          {transacao.status}
        </span>
      )
    }
  ], []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchTerm('');
  }, []);

  const exportData = useCallback(() => {
    const exportData = filteredTransacoes.map(transacao => ({
      Data: formatDate(transacao.data),
      Descrição: transacao.descricao,
      Tipo: transacao.tipo,
      Valor: transacao.valor,
      Status: transacao.status,
      Método: transacao.metodo || '',
      Aluno: transacao.aluno || ''
    }));
    exportToCSV(exportData, 'transacoes-financeiras');
  }, [filteredTransacoes]);

  // Interface específica para aluno
  if (userLogado?.tipo === 'aluno') {
    const planoDoAluno = planos.find(p => p.id === (userLogado as any).planoId);
    const meusPagamentos = filteredTransacoes;
    const valorPago = meusPagamentos.filter(p => p.status === 'pago').reduce((sum, p) => sum + p.valor, 0);
    const valorPendente = meusPagamentos.filter(p => p.status === 'pendente').reduce((sum, p) => sum + p.valor, 0);
    const proximoVencimento = meusPagamentos.find(p => p.status === 'pendente');

    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatsCard 
            title="Total Pago" 
            value={formatCurrency(valorPago)} 
            icon={CheckCircle} 
            color="text-green-600" 
            subtitle="Histórico"
          />
          <StatsCard 
            title="Valor Pendente" 
            value={formatCurrency(valorPendente)} 
            icon={Clock} 
            color="text-red-600" 
            subtitle={proximoVencimento ? `Vence: ${formatDate(proximoVencimento.data)}` : 'Nenhum pendente'}
          />
          <StatsCard 
            title="Mensalidade" 
            value={formatCurrency(planoDoAluno?.preco || 0)} 
            icon={CreditCard} 
            color="text-blue-600" 
            subtitle={planoDoAluno?.nome || 'Plano não encontrado'}
          />
        </div>

        {proximoVencimento && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="text-red-600 mr-3" size={24} />
              <div>
                <h4 className="font-semibold text-red-800 dark:text-red-300">Mensalidade Pendente</h4>
                <p className="text-red-700 dark:text-red-400 text-sm">
                  A sua mensalidade de {formatCurrency(proximoVencimento.valor)} vence em {formatDate(proximoVencimento.data)}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <DataTable<Transacao>
            data={meusPagamentos}
            columns={colunas}
            loading={false}
            emptyMessage="Nenhuma transação encontrada"
            itemsPerPage={10}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar transações..."
          filters={filters}
          onFiltersChange={setFilters}
          clearFilters={clearFilters}
          exportData={exportData}
        />
        
        {userLogado?.tipo === 'admin' && (
          <Button
            onClick={() => {
              // TODO: Implement transaction creation modal
              addNotification({
                type: 'info',
                title: 'Em desenvolvimento',
                message: 'Funcionalidade de criação de transações será implementada em breve'
              });
            }}
            leftIcon={<Plus size={20} />}
          >
            Nova Transação
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Receita Total" 
          value={formatCurrency(stats.receitaTotal)} 
          icon={ArrowUpRight} 
          color="text-green-600" 
        />
        <StatsCard 
          title="Despesas" 
          value={formatCurrency(stats.despesaTotal)} 
          icon={ArrowDownLeft} 
          color="text-red-600" 
        />
        <StatsCard 
          title="Pendentes" 
          value={formatCurrency(stats.pendentes)} 
          icon={Clock} 
          color="text-yellow-600" 
        />
        <StatsCard 
          title="Lucro Líquido" 
          value={formatCurrency(stats.lucroLiquido)} 
          icon={DollarSign} 
          color={stats.lucroLiquido >= 0 ? "text-blue-600" : "text-red-600"} 
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <DataTable<Transacao>
          data={filteredTransacoes}
          columns={colunas}
          loading={false}
          emptyMessage="Nenhuma transação encontrada"
          itemsPerPage={15}
        />
      </div>
    </div>
  );
});