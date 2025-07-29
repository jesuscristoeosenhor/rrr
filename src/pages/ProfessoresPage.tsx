import { memo } from 'react';
import { GraduationCap } from 'lucide-react';
import { PlaceholderPage } from '@/components/common/PlaceholderPage';

export const ProfessoresPage = memo(() => (
  <PlaceholderPage
    title="Gestão de Professores"
    description="Sistema para gerenciar professores, horários, salários e especialidades."
    icon={GraduationCap}
  />
));