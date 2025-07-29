import { memo } from 'react';
import { Settings } from 'lucide-react';
import { PlaceholderPage } from '@/components/common/PlaceholderPage';

export const ConfiguracoesPage = memo(() => (
  <PlaceholderPage
    title="Configurações"
    description="Configurações do sistema, preferências, usuários e parâmetros gerais."
    icon={Settings}
  />
));