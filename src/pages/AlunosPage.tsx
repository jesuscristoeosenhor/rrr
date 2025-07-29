import { memo } from 'react';
import { Users } from 'lucide-react';
import { PlaceholderPage } from '@/components/common/PlaceholderPage';

export const AlunosPage = memo(() => (
  <PlaceholderPage
    title="Gestão de Alunos"
    description="Sistema completo para gerenciar alunos, matrículas, pagamentos e presença."
    icon={Users}
  />
));