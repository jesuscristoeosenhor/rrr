// Base types for the application
export interface BaseEntity {
  id: string;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface Usuario extends BaseEntity {
  nome: string;
  email: string;
  senha: string;
  tipo: 'admin' | 'gestor' | 'professor' | 'aluno';
  unidade?: string;
  telefone?: string;
  ativo: boolean;
}

export interface Plano extends BaseEntity {
  nome: string;
  preco: number;
  unidade: string;
  descricao?: string;
}

export interface Aluno extends BaseEntity {
  nome: string;
  telefone: string;
  email: string;
  tipoPlano: 'mensalidade' | 'plataforma';
  planoId?: number;
  plataformaParceira?: string;
  unidade: string;
  status: 'ativo' | 'inativo' | 'inadimplente';
  vencimento: string;
  senha: string;
  nivel: 'iniciante' | 'intermediario' | 'avancado';
  dataMatricula: string;
  objetivo: string;
}

export interface Professor extends BaseEntity {
  nome: string;
  telefone: string;
  email: string;
  senha: string;
  unidade: string;
  especialidade: string;
  salario: number;
  status: 'ativo' | 'inativo';
  dataContratacao: string;
}

export interface Transacao extends BaseEntity {
  tipo: 'receita' | 'despesa';
  valor: number;
  descricao: string;
  categoria: string;
  unidade: string;
  data: Date;
  usuarioId: string;
  status: 'pendente' | 'confirmada' | 'cancelada';
}

export interface Presenca extends BaseEntity {
  alunoId: string;
  professorId: string;
  data: Date;
  presente: boolean;
  observacoes?: string;
  unidade: string;
}

export interface Agendamento extends BaseEntity {
  alunoId: string;
  professorId: string;
  data: Date;
  horario: string;
  status: 'agendado' | 'confirmado' | 'cancelado' | 'realizado';
  observacoes?: string;
  unidade: string;
}

// Context types
export interface AppState {
  userLogado: Usuario | null;
  activeTab: string;
  unidadeSelecionada: string;
  alunos: Aluno[];
  professores: Professor[];
  planos: Plano[];
  transacoes: Transacao[];
  presencas: Presenca[];
  agendamentos: Agendamento[];
}

export interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  autoClose?: boolean;
}

// Filter and search types
export interface FilterOptions {
  searchTerm: string;
  status?: string;
  unidade?: string;
  tipoPlano?: string;
  nivel?: string;
  dataInicio?: string;
  dataFim?: string;
}

export interface ExportData {
  [key: string]: string | number | boolean | Date;
}