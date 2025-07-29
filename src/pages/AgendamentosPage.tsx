import { memo } from 'react';
import { Calendar } from 'lucide-react';
import { PlaceholderPage } from '@/components/common/PlaceholderPage';

export const AgendamentosPage = memo(() => (
  <PlaceholderPage
    title="Agendamentos"
    description="Sistema de agendamento de aulas, controle de horários e disponibilidade."
    icon={Calendar}
  />
));