// Base types for the application
export interface BaseEntity {
  id: string | number;
  criadoEm?: Date;
  atualizadoEm?: Date;
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
  status: 'ativo' | 'inativo' | 'inadimplente' | 'pendente';
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
  unidade?: string;
  tipoPagamento: 'fixo' | 'variavel';
  valorFixo?: number;
  valoresVariaveis?: {
    uma: number;
    duas: number;
    tres: number;
  };
  especialidades: string[];
  experiencia: '1-3' | '3-5' | '5-10' | '10+';
  observacoes?: string;
  ativo: boolean;
}

export interface Transacao extends BaseEntity {
  tipo: 'receita' | 'despesa';
  valor: number;
  descricao: string;
  categoria?: string;
  metodo?: 'mensalidade' | 'diaria-dinheiro' | 'diaria-plataforma' | 'aluguel' | string;
  unidade?: string;
  data: string | Date;
  alunoId?: string | number;
  aluno?: string;
  usuarioId?: string;
  status: 'pago' | 'pendente' | 'cancelada' | 'confirmada';
}

export interface Presenca extends BaseEntity {
  alunoId: string | number;
  professorId: string | number;
  data: string | Date;
  horario: string;
  status: 'presente' | 'ausente' | 'justificada';
  presente?: boolean;
  observacoes?: string;
  unidade?: string;
}

export interface Agendamento extends BaseEntity {
  alunoId: string | number;
  professorId: string | number;
  data: string | Date;
  horario: string;
  status: 'agendado' | 'confirmado' | 'cancelado' | 'realizado';
  observacoes?: string;
  unidade?: string;
}

// New types from atual.jsx
export interface Treino extends BaseEntity {
  titulo: string;
  professorId: string | number;
  professor: string;
  data: string | Date;
  descricao: string;
  duracao: number;
  nivel: 'iniciante' | 'intermediario' | 'avancado';
  pranchetaData?: {
    items: PranchetaItem[];
  };
}

export interface PranchetaItem {
  id: string | number;
  type: 'player1' | 'player2' | 'ball' | 'arrow' | 'text' | 'line' | 'circle';
  x: number;
  y: number;
  fromX?: number;
  fromY?: number;
  toX?: number;
  toY?: number;
  color?: string;
  text?: string;
  fontSize?: number;
  style?: string;
}

export interface Unidade extends BaseEntity {
  nome: string;
  endereco: string;
  telefone: string;
  email: string;
  responsavel: string;
  ativo: boolean;
}

export interface Produto extends BaseEntity {
  nome: string;
  preco: number;
  imagem?: string;
  descricao?: string;
  categoria?: string;
  estoque?: number;
}

export interface Plataforma extends BaseEntity {
  nome: string;
  valorPorAluno: number;
  ativo: boolean;
}

export interface HorarioConfiguracao {
  id: string | number;
  horario: string;
  professorId: string | number;
  maxAlunos: number;
  ativo: boolean;
}

export interface HorariosUnidade {
  [dia: string]: HorarioConfiguracao[];
}

export interface HorariosConfiguracao {
  [unidadeId: string]: HorariosUnidade;
}

export interface Meta extends BaseEntity {
  titulo: string;
  descricao: string;
  valor: number;
  valorAtual: number;
  dataInicio: string | Date;
  dataFim: string | Date;
  tipo: 'receita' | 'alunos' | 'aulas' | 'outros';
  unidade?: string;
  status: 'ativa' | 'concluida' | 'pausada' | 'cancelada';
}

export interface AluguelQuadra extends BaseEntity {
  cliente: string;
  telefone: string;
  data: string | Date;
  horarioInicio: string;
  horarioFim: string;
  quadra: string;
  valor: number;
  status: 'agendado' | 'confirmado' | 'cancelado' | 'realizado';
  observacoes?: string;
  unidade: string;
}

export interface CarrinhoItem {
  id: string | number;
  produtoId: string | number;
  nome: string;
  preco: number;
  quantidade: number;
  imagem?: string;
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
  
  // New entities from atual.jsx
  treinos: Treino[];
  unidades: Unidade[];
  produtos: Produto[];
  plataformas: Plataforma[];
  horariosConfiguracao: HorariosConfiguracao;
  alugueis: AluguelQuadra[];
  cart: CarrinhoItem[];
  metas?: Meta[];
}

export interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
  unreadCount: number;
}

export interface Notification {
  id: string | number;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  timestamp: string | Date;
  read?: boolean;
  autoClose?: boolean;
}

// Filter and search types
export interface FilterOptions {
  searchTerm?: string;
  nome?: string;
  status?: string;
  unidade?: string;
  tipoPlano?: string;
  nivel?: string;
  vencimento?: 'vencido' | 'vencendo' | 'ok' | 'sem-vencimento';
  dataInicio?: string;
  dataFim?: string;
}

export interface ExportData {
  [key: string]: string | number | boolean | Date;
}

// Pagination types
export interface PaginationData<T> {
  currentData: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
}