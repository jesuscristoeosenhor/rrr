// Base types for the application
export interface BaseEntity {
  id: string;
  criadoEm: Date;
  atualizadoEm: Date;
}

// User and Authentication Types
export interface Usuario extends BaseEntity {
  nome: string;
  email: string;
  senha: string;
  tipo: 'admin' | 'gestor' | 'professor' | 'aluno' | 'recepcionista';
  unidade?: string;
  telefone?: string;
  avatar?: string;
  ativo: boolean;
  ultimoLogin?: Date;
  configuracoes?: UserSettings;
  permissoes?: Permission[];
}

export interface UserSettings {
  tema: 'claro' | 'escuro' | 'auto';
  idioma: 'pt-BR' | 'en-US' | 'es-ES';
  notificacoes: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  fusoHorario: string;
}

export interface Permission {
  modulo: string;
  acoes: ('criar' | 'ler' | 'editar' | 'deletar')[];
}

// Enhanced Unit Types
export interface Unidade extends BaseEntity {
  nome: string;
  endereco: Endereco;
  telefone: string;
  email: string;
  responsavel: string;
  horarioFuncionamento: HorarioFuncionamento;
  quadras: Quadra[];
  imagens: string[];
  descricao?: string;
  ativo: boolean;
  configuracoes: UnidadeConfig;
}

export interface Endereco {
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  coordenadas?: {
    lat: number;
    lng: number;
  };
}

export interface HorarioFuncionamento {
  [key: string]: {
    inicio: string;
    fim: string;
    fechado?: boolean;
  };
}

export interface UnidadeConfig {
  permiteAgendamentoOnline: boolean;
  antecedenciaMinima: number; // horas
  antecedenciaMaxima: number; // dias
  cancelamentoAte: number; // horas antes
  valorTaxaCancelamento: number;
  permiteMultiplosJogos: boolean;
}

// Enhanced Court Types
export interface Quadra extends BaseEntity {
  numero: number;
  nome: string;
  tipo: 'futevolei' | 'volei' | 'beach-tennis' | 'futsal';
  unidadeId: string;
  status: 'disponivel' | 'ocupada' | 'manutencao' | 'indisponivel';
  capacidade: number;
  preco: PrecoPorHorario;
  equipamentos: string[];
  observacoes?: string;
  imagens: string[];
  dimensoes?: {
    largura: number;
    comprimento: number;
  };
}

export interface PrecoPorHorario {
  [horario: string]: {
    valor: number;
    promocional?: boolean;
  };
}

// Enhanced Plan Types
export interface Plano extends BaseEntity {
  nome: string;
  preco: number;
  unidade: string;
  descricao?: string;
  tipo: 'mensalidade' | 'avulso' | 'pacote';
  beneficios: string[];
  limitacoes: {
    jogosSemanais?: number;
    horariosPermitidos?: string[];
    quadrasPermitidas?: string[];
  };
  ativo: boolean;
}

// Enhanced User Types
export interface Aluno extends BaseEntity {
  nome: string;
  telefone: string;
  email: string;
  tipoPlano: 'mensalidade' | 'plataforma' | 'avulso';
  planoId?: string;
  plataformaParceira?: string;
  unidade: string;
  status: 'ativo' | 'inativo' | 'inadimplente' | 'suspenso';
  vencimento?: string;
  senha: string;
  nivel: 'iniciante' | 'intermediario' | 'avancado';
  dataMatricula: string;
  objetivo: string;
  historicoJogos: HistoricoJogo[];
  pontuacaoFidelidade: number;
  preferencias: PreferenciasJogo;
  documentos: Documento[];
  emergenciaContato?: ContatoEmergencia;
}

export interface HistoricoJogo {
  data: Date;
  quadraId: string;
  duracao: number;
  pontuacao?: number;
  observacoes?: string;
}

export interface PreferenciasJogo {
  horariosPreferidos: string[];
  quadrasPreferidas: string[];
  jogadores: string[];
  dificuldade: 'facil' | 'medio' | 'dificil';
}

export interface Documento {
  tipo: 'atestado-medico' | 'rg' | 'cpf' | 'comprovante-residencia';
  url: string;
  dataVencimento?: Date;
  validado: boolean;
}

export interface ContatoEmergencia {
  nome: string;
  telefone: string;
  parentesco: string;
}

export interface Professor extends BaseEntity {
  nome: string;
  telefone: string;
  email: string;
  senha: string;
  unidade: string;
  especialidades: string[];
  salario: number;
  status: 'ativo' | 'inativo' | 'ferias';
  dataContratacao: string;
  horarioDisponibilidade: HorarioDisponibilidade;
  avaliacoes: AvaliacaoProfessor[];
  certificacoes: Certificacao[];
  experiencia: string;
}

export interface HorarioDisponibilidade {
  [dia: string]: {
    inicio: string;
    fim: string;
    intervalos?: Array<{
      inicio: string;
      fim: string;
    }>;
  };
}

export interface AvaliacaoProfessor {
  alunoId: string;
  nota: number;
  comentario: string;
  data: Date;
}

export interface Certificacao {
  nome: string;
  instituicao: string;
  dataObtencao: Date;
  validade?: Date;
  documento: string;
}

// Enhanced Financial Types
export interface Transacao extends BaseEntity {
  tipo: 'receita' | 'despesa';
  valor: number;
  descricao: string;
  categoria: TransacaoCategoria;
  unidade: string;
  data: Date;
  usuarioId: string;
  status: 'pendente' | 'confirmada' | 'cancelada' | 'estornada';
  metodoPagamento: 'dinheiro' | 'cartao-debito' | 'cartao-credito' | 'pix' | 'transferencia';
  agendamentoId?: string;
  comprovante?: string;
  observacoes?: string;
}

export type TransacaoCategoria = 
  | 'mensalidade'
  | 'jogo-avulso'
  | 'aluguel-quadra'
  | 'produto-loja'
  | 'multa'
  | 'material-esportivo'
  | 'manutencao'
  | 'funcionario'
  | 'marketing'
  | 'outras';

// Notification System
export interface NotificationData extends BaseEntity {
  usuarioId: string;
  tipo: 'agendamento' | 'pagamento' | 'promocao' | 'sistema' | 'lembrete';
  titulo: string;
  mensagem: string;
  lida: boolean;
  data: Date;
  agendamentoId?: string;
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  canais: ('app' | 'email' | 'sms' | 'push')[];
  metadata?: Record<string, any>;
}

// Dashboard and Analytics
export interface DashboardStats {
  agendamentosHoje: number;
  receitaDiaria: number;
  ocupacaoQuadras: number;
  alunosAtivos: number;
  tendencias: {
    agendamentos: TrendData[];
    receita: TrendData[];
    ocupacao: TrendData[];
  };
}

export interface TrendData {
  periodo: string;
  valor: number;
  variacao: number;
}

// Reports
export interface Relatorio extends BaseEntity {
  titulo: string;
  tipo: 'ocupacao' | 'financeiro' | 'usuarios' | 'personalizado';
  parametros: RelatorioParametros;
  dados: any[];
  geradoPor: string;
  formatoExportacao: 'pdf' | 'excel' | 'csv';
}

export interface RelatorioParametros {
  dataInicio: Date;
  dataFim: Date;
  unidades?: string[];
  quadras?: string[];
  usuarios?: string[];
  metricas: string[];
  agrupamento: 'dia' | 'semana' | 'mes' | 'ano';
}

// Enhanced Booking and Scheduling Types
export interface Agendamento extends BaseEntity {
  alunoId: string;
  professorId?: string;
  quadraId: string;
  unidadeId: string;
  data: Date;
  horarioInicio: string;
  horarioFim: string;
  tipo: 'aula' | 'jogo-livre' | 'treino' | 'evento';
  status: 'agendado' | 'confirmado' | 'em-andamento' | 'finalizado' | 'cancelado' | 'nao-compareceu';
  participantes: ParticipanteAgendamento[];
  valor: number;
  metodoPagamento?: 'dinheiro' | 'cartao' | 'pix' | 'plano';
  observacoes?: string;
  avaliacoes?: Avaliacao[];
  recorrencia?: RecorrenciaConfig;
}

export interface ParticipanteAgendamento {
  usuarioId: string;
  nome: string;
  confirmado: boolean;
  presente?: boolean;
  papel: 'organizador' | 'participante' | 'convidado';
}

export interface RecorrenciaConfig {
  tipo: 'diaria' | 'semanal' | 'mensal';
  intervalo: number;
  diasSemana?: number[];
  dataFim?: Date;
  occorrenciasTotal?: number;
}

export interface Avaliacao extends BaseEntity {
  agendamentoId: string;
  usuarioId: string;
  nota: number;
  comentario?: string;
  aspectos: {
    [key: string]: number;
  };
}

// Check-in/Check-out System
export interface CheckInOut extends BaseEntity {
  agendamentoId: string;
  usuarioId: string;
  tipo: 'check-in' | 'check-out';
  timestamp: Date;
  localizacao?: {
    lat: number;
    lng: number;
  };
  observacoes?: string;
}

// Enhanced Presence and Context Types
export interface Presenca extends BaseEntity {
  alunoId: string;
  professorId: string;
  agendamentoId?: string;
  data: Date;
  presente: boolean;
  checkIn?: Date;
  checkOut?: Date;
  observacoes?: string;
  unidade: string;
  pontuacao?: number;
}

// Enhanced Context types
export interface AppState {
  userLogado: Usuario | null;
  activeTab: string;
  unidadeSelecionada: string;
  alunos: Aluno[];
  professores: Professor[];
  planos: Plano[];
  unidades: Unidade[];
  quadras: Quadra[];
  transacoes: Transacao[];
  presencas: Presenca[];
  agendamentos: Agendamento[];
  notifications: NotificationData[];
  dashboardStats: DashboardStats | null;
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
  clearAll: () => void;
}

export interface AuthContextType {
  user: Usuario | null;
  login: (email: string, senha: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: Partial<Usuario>) => void;
  hasPermission: (modulo: string, acao: string) => boolean;
  isLoading: boolean;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  autoClose?: boolean;
  duration?: number;
}

// Enhanced Filter and search types
export interface FilterOptions {
  searchTerm: string;
  status?: string;
  unidade?: string;
  tipoPlano?: string;
  nivel?: string;
  dataInicio?: string;
  dataFim?: string;
  quadra?: string;
  professor?: string;
}

export interface ExportData {
  [key: string]: string | number | boolean | Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Calendar and Booking Types
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resourceId?: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  extendedProps?: {
    agendamento: Agendamento;
    quadra: Quadra;
    aluno: Aluno;
    professor?: Professor;
  };
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
  price?: number;
  agendamentoId?: string;
}