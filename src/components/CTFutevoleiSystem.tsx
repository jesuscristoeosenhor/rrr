import React, { useCallback, memo } from 'react';
import { useAppState } from '@/contexts/AppStateContext';
import { Layout } from '@/components/layout/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { AlunosPage } from '@/pages/AlunosPage';
import { ProfessoresPage } from '@/pages/ProfessoresPage';
import { FinanceiroPage } from '@/pages/FinanceiroPage';
import { AgendamentosPage } from '@/pages/AgendamentosPage';
import { ConfiguracoesPage } from '@/pages/ConfiguracoesPage';

const CTFutevoleiSystemInternal = memo(() => {
  const { activeTab } = useAppState();

  const renderContent = useCallback(() => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'alunos':
        return <AlunosPage />;
      case 'professores':
        return <ProfessoresPage />;
      case 'financeiro':
        return <FinanceiroPage />;
      case 'agendamentos':
        return <AgendamentosPage />;
      case 'configuracoes':
        return <ConfiguracoesPage />;
      default:
        return <Dashboard />;
    }
  }, [activeTab]);

  return (
    <Layout>
      {renderContent()}
    </Layout>
  );
});

export const CTFutevoleiSystem: React.FC = () => {
  return <CTFutevoleiSystemInternal />;
};