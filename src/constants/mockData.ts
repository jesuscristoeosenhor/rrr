import { Plano, Aluno, Professor } from '@/types';

export const UNIDADES = [
  'Centro',
  'Zona Sul', 
  'Zona Norte',
  'Barra'
] as const;

export const MOCK_PLANOS: Plano[] = [
  // Unidade Centro
  { 
    id: '1', 
    nome: 'Plano Básico (2x/semana)', 
    preco: 120.00, 
    unidade: 'Centro',
    criadoEm: new Date('2024-01-01'),
    atualizadoEm: new Date('2024-01-01')
  },
  { 
    id: '2', 
    nome: 'Plano Intermediário (3x/semana)', 
    preco: 150.00, 
    unidade: 'Centro',
    criadoEm: new Date('2024-01-01'),
    atualizadoEm: new Date('2024-01-01')
  },
  { 
    id: '3', 
    nome: 'Plano Avançado (Livre)', 
    preco: 180.00, 
    unidade: 'Centro',
    criadoEm: new Date('2024-01-01'),
    atualizadoEm: new Date('2024-01-01')
  },
  
  // Unidade Zona Sul
  { 
    id: '4', 
    nome: 'Plano Básico (2x/semana)', 
    preco: 150.00, 
    unidade: 'Zona Sul',
    criadoEm: new Date('2024-01-01'),
    atualizadoEm: new Date('2024-01-01')
  },
  { 
    id: '5', 
    nome: 'Plano Intermediário (3x/semana)', 
    preco: 180.00, 
    unidade: 'Zona Sul',
    criadoEm: new Date('2024-01-01'),
    atualizadoEm: new Date('2024-01-01')
  },
  { 
    id: '6', 
    nome: 'Plano Avançado (Livre)', 
    preco: 220.00, 
    unidade: 'Zona Sul',
    criadoEm: new Date('2024-01-01'),
    atualizadoEm: new Date('2024-01-01')
  },

  // Unidade Zona Norte
  { 
    id: '7', 
    nome: 'Plano Básico (2x/semana)', 
    preco: 110.00, 
    unidade: 'Zona Norte',
    criadoEm: new Date('2024-01-01'),
    atualizadoEm: new Date('2024-01-01')
  },
  { 
    id: '8', 
    nome: 'Plano Intermediário (3x/semana)', 
    preco: 140.00, 
    unidade: 'Zona Norte',
    criadoEm: new Date('2024-01-01'),
    atualizadoEm: new Date('2024-01-01')
  },
  { 
    id: '9', 
    nome: 'Plano Avançado (Livre)', 
    preco: 170.00, 
    unidade: 'Zona Norte',
    criadoEm: new Date('2024-01-01'),
    atualizadoEm: new Date('2024-01-01')
  },

  // Unidade Barra
  { 
    id: '10', 
    nome: 'Plano Básico (2x/semana)', 
    preco: 160.00, 
    unidade: 'Barra',
    criadoEm: new Date('2024-01-01'),
    atualizadoEm: new Date('2024-01-01')
  },
  { 
    id: '11', 
    nome: 'Plano Intermediário (3x/semana)', 
    preco: 190.00, 
    unidade: 'Barra',
    criadoEm: new Date('2024-01-01'),
    atualizadoEm: new Date('2024-01-01')
  },
  { 
    id: '12', 
    nome: 'Plano Avançado (Livre)', 
    preco: 230.00, 
    unidade: 'Barra',
    criadoEm: new Date('2024-01-01'),
    atualizadoEm: new Date('2024-01-01')
  },
];

export const MOCK_ALUNOS: Aluno[] = [
  { 
    id: '1', 
    nome: 'João Silva', 
    telefone: '(11) 99999-9999', 
    email: 'joao@email.com', 
    tipoPlano: 'plataforma',
    plataformaParceira: 'Wellhub',
    unidade: 'Centro',
    status: 'ativo', 
    vencimento: '2025-07-15', 
    senha: '123456', // Will be hashed in production
    nivel: 'intermediario', 
    dataMatricula: '2024-01-15', 
    objetivo: 'Competição',
    criadoEm: new Date('2024-01-15'),
    atualizadoEm: new Date('2024-01-15')
  },
  { 
    id: '2', 
    nome: 'Maria Santos', 
    telefone: '(11) 88888-8888', 
    email: 'maria@email.com', 
    tipoPlano: 'mensalidade',
    planoId: 1, 
    unidade: 'Zona Sul',
    status: 'ativo', 
    vencimento: '2025-07-20', 
    senha: '123456', 
    nivel: 'iniciante', 
    dataMatricula: '2024-03-20', 
    objetivo: 'Lazer',
    criadoEm: new Date('2024-03-20'),
    atualizadoEm: new Date('2024-03-20')
  },
  { 
    id: '3', 
    nome: 'Pedro Costa', 
    telefone: '(11) 77777-7777', 
    email: 'pedro@email.com', 
    tipoPlano: 'mensalidade',
    planoId: 3, 
    unidade: 'Centro',
    status: 'ativo', 
    vencimento: '2025-07-25', 
    senha: '123456', 
    nivel: 'avancado', 
    dataMatricula: '2024-02-10', 
    objetivo: 'Competição',
    criadoEm: new Date('2024-02-10'),
    atualizadoEm: new Date('2024-02-10')
  },
];

export const MOCK_PROFESSORES: Professor[] = [
  {
    id: '1',
    nome: 'Carlos Mendes',
    telefone: '(11) 91234-5678',
    email: 'carlos@email.com',
    senha: '123456', // Will be hashed in production
    unidade: 'Centro',
    especialidade: 'Futvolei Competitivo',
    salario: 3500.00,
    status: 'ativo',
    dataContratacao: '2024-01-01',
    criadoEm: new Date('2024-01-01'),
    atualizadoEm: new Date('2024-01-01')
  },
  {
    id: '2', 
    nome: 'Ana Lima',
    telefone: '(11) 92345-6789',
    email: 'ana@email.com',
    senha: '123456',
    unidade: 'Zona Sul',
    especialidade: 'Futvolei Recreativo',
    salario: 3200.00,
    status: 'ativo',
    dataContratacao: '2024-02-01',
    criadoEm: new Date('2024-02-01'),
    atualizadoEm: new Date('2024-02-01')
  },
];

export const PLATAFORMAS_PARCEIRAS = [
  'Wellhub',
  'TotalPass',
  'Gympass',
  'Smart Fit',
  'Outras'
] as const;

export const NIVEIS_ALUNO = [
  'iniciante',
  'intermediario', 
  'avancado'
] as const;

export const STATUS_USUARIO = [
  'ativo',
  'inativo'
] as const;

export const STATUS_ALUNO = [
  'ativo',
  'inativo',
  'inadimplente'
] as const;

export const TIPOS_USUARIO = [
  'admin',
  'gestor', 
  'professor',
  'aluno'
] as const;