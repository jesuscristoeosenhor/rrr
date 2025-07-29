import { memo } from 'react';
import { DollarSign } from 'lucide-react';
import { PlaceholderPage } from '@/components/common/PlaceholderPage';

export const FinanceiroPage = memo(() => (
  <PlaceholderPage
    title="Gestão Financeira"
    description="Controle completo de receitas, despesas, relatórios e fluxo de caixa."
    icon={DollarSign}
  />
));