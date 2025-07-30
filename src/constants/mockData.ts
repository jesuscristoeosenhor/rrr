import { 
  Plano, 
  Aluno, 
  Professor, 
  Transacao, 
  Treino, 
  Unidade, 
  Produto, 
  Plataforma, 
  Presenca, 
  HorariosConfiguracao,
  AluguelQuadra,
  Meta
} from '@/types';

export const UNIDADES = [
  'Centro',
  'Zona Sul', 
  'Zona Norte',
  'Barra'
] as const;

export const MOCK_PLANOS: Plano[] = [
  // Unidade Centro
  { 
    id: 1, 
    nome: 'Plano Básico (2x/semana)', 
    preco: 120.00, 
    unidade: 'Centro',
    criadoEm: new Date('2024-01-01'),
    atualizadoEm: new Date('2024-01-01')
  },
  { 
    id: 2, 
    nome: 'Plano Intermediário (3x/semana)', 
    preco: 150.00, 
    unidade: 'Centro',
    criadoEm: new Date('2024-01-01'),
    atualizadoEm: new Date('2024-01-01')
  },
  { 
    id: 3, 
    nome: 'Plano Avançado (Livre)', 
    preco: 180.00, 
    unidade: 'Centro',
    criadoEm: new Date('2024-01-01'),
    atualizadoEm: new Date('2024-01-01')
  },
  
  // Unidade Zona Sul
  { 
    id: 4, 
    nome: 'Plano Básico (2x/semana)', 
    preco: 150.00, 
    unidade: 'Zona Sul',
    criadoEm: new Date('2024-01-01'),
    atualizadoEm: new Date('2024-01-01')
  },
  { 
    id: 5, 
    nome: 'Plano Intermediário (3x/semana)', 
    preco: 180.00, 
    unidade: 'Zona Sul',
    criadoEm: new Date('2024-01-01'),
    atualizadoEm: new Date('2024-01-01')
  },
  { 
    id: 6, 
    nome: 'Plano Avançado (Livre)', 
    preco: 220.00, 
    unidade: 'Zona Sul',
    criadoEm: new Date('2024-01-01'),
    atualizadoEm: new Date('2024-01-01')
  },
  
  // Unidade Zona Norte
  { 
    id: 7, 
    nome: 'Plano Básico (2x/semana)', 
    preco: 110.00, 
    unidade: 'Zona Norte',
    criadoEm: new Date('2024-01-01'),
    atualizadoEm: new Date('2024-01-01')
  },
  { 
    id: 8, 
    nome: 'Plano Intermediário (3x/semana)', 
    preco: 140.00, 
    unidade: 'Zona Norte',
    criadoEm: new Date('2024-01-01'),
    atualizadoEm: new Date('2024-01-01')
  },
  { 
    id: 9, 
    nome: 'Plano Avançado (Livre)', 
    preco: 170.00, 
    unidade: 'Zona Norte',
    criadoEm: new Date('2024-01-01'),
    atualizadoEm: new Date('2024-01-01')
  },
  
  // Unidade Barra
  { 
    id: 10, 
    nome: 'Plano Básico (2x/semana)', 
    preco: 160.00, 
    unidade: 'Barra',
    criadoEm: new Date('2024-01-01'),
    atualizadoEm: new Date('2024-01-01')
  },
  { 
    id: 11, 
    nome: 'Plano Intermediário (3x/semana)', 
    preco: 190.00, 
    unidade: 'Barra',
    criadoEm: new Date('2024-01-01'),
    atualizadoEm: new Date('2024-01-01')
  },
  { 
    id: 12, 
    nome: 'Plano Avançado (Livre)', 
    preco: 230.00, 
    unidade: 'Barra',
    criadoEm: new Date('2024-01-01'),
    atualizadoEm: new Date('2024-01-01')
  },
];

export const MOCK_ALUNOS: Aluno[] = [
  { 
    id: 1, 
    nome: 'João Silva', 
    telefone: '(11) 99999-9999', 
    email: 'joao@email.com', 
    tipoPlano: 'plataforma',
    plataformaParceira: 'Wellhub',
    unidade: 'Centro',
    status: 'ativo', 
    vencimento: '2025-07-15', 
    senha: '123456', 
    nivel: 'intermediario', 
    dataMatricula: '2024-01-15', 
    objetivo: 'Competição',
    criadoEm: new Date('2024-01-15'),
    atualizadoEm: new Date('2024-01-15')
  },
  { 
    id: 2, 
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
    id: 3, 
    nome: 'Pedro Costa', 
    telefone: '(11) 77777-7777', 
    email: 'pedro@email.com', 
    tipoPlano: 'mensalidade',
    planoId: 3, 
    unidade: 'Zona Norte',
    status: 'pendente', 
    vencimento: '2025-07-10', 
    senha: '123456', 
    nivel: 'avancado', 
    dataMatricula: '2023-11-10', 
    objetivo: 'Fitness',
    criadoEm: new Date('2023-11-10'),
    atualizadoEm: new Date('2023-11-10')
  },
  { 
    id: 4, 
    nome: 'Ana Oliveira', 
    telefone: '(11) 66666-6666', 
    email: 'ana@email.com', 
    tipoPlano: 'plataforma',
    plataformaParceira: 'TotalPass',
    unidade: 'Barra',
    status: 'ativo', 
    vencimento: '2025-08-01', 
    senha: '123456', 
    nivel: 'intermediario', 
    dataMatricula: '2024-02-05', 
    objetivo: 'Competição',
    criadoEm: new Date('2024-02-05'),
    atualizadoEm: new Date('2024-02-05')
  }
];

export const MOCK_PROFESSORES: Professor[] = [
  { 
    id: 1, 
    nome: 'Carlos Mendes', 
    telefone: '(11) 91111-1111', 
    email: 'carlos@email.com', 
    senha: '123456',
    tipoPagamento: 'variavel',
    valoresVariaveis: {
      uma: 25,
      duas: 22,
      tres: 20
    },
    especialidades: ['Futevôlei de Praia', 'Técnicas de Defesa', 'Treinamento Avançado'],
    experiencia: '5-10',
    observacoes: 'Professor experiente, especialista em defesa',
    ativo: true,
    criadoEm: new Date('2024-01-01'),
    atualizadoEm: new Date('2024-01-01')
  },
  { 
    id: 2, 
    nome: 'Lucas Ferreira', 
    telefone: '(11) 92222-2222', 
    email: 'lucas@email.com', 
    senha: '123456',
    tipoPagamento: 'fixo',
    valorFixo: 45,
    especialidades: ['Fundamentos Básicos', 'Treinamento Iniciantes'],
    experiencia: '1-3',
    observacoes: 'Ótimo com iniciantes, muito didático',
    ativo: true,
    criadoEm: new Date('2024-01-01'),
    atualizadoEm: new Date('2024-01-01')
  },
  { 
    id: 3, 
    nome: 'Ana Paula Costa', 
    telefone: '(11) 93333-3333', 
    email: 'anapaula@email.com', 
    senha: '123456',
    tipoPagamento: 'variavel',
    valoresVariaveis: {
      uma: 30,
      duas: 25,
      tres: 22
    },
    especialidades: ['Técnicas de Ataque', 'Competições', 'Condicionamento Físico'],
    experiencia: '10+',
    observacoes: 'Ex-atleta profissional, especialista em alto rendimento',
    ativo: true,
    criadoEm: new Date('2024-01-01'),
    atualizadoEm: new Date('2024-01-01')
  }
];

export const MOCK_TRANSACOES: Transacao[] = [
  { 
    id: 1, 
    alunoId: 1, 
    aluno: 'João Silva', 
    valor: 150, 
    data: '2025-07-05', 
    status: 'pago', 
    tipo: 'receita', 
    metodo: 'mensalidade', 
    descricao: 'Mensalidade Julho' 
  },
  { 
    id: 2, 
    alunoId: 2, 
    aluno: 'Maria Santos', 
    valor: 120, 
    data: '2025-07-03', 
    status: 'pago', 
    tipo: 'receita', 
    metodo: 'mensalidade', 
    descricao: 'Mensalidade Julho' 
  },
  { 
    id: 3, 
    alunoId: 3, 
    aluno: 'Pedro Costa', 
    valor: 180, 
    data: '2025-07-01', 
    status: 'pendente', 
    tipo: 'receita', 
    metodo: 'mensalidade', 
    descricao: 'Mensalidade Julho' 
  },
  { 
    id: 4, 
    alunoId: 4, 
    aluno: 'Ana Oliveira', 
    valor: 50, 
    data: '2025-07-06', 
    status: 'pago', 
    tipo: 'receita', 
    metodo: 'diaria-dinheiro', 
    descricao: 'Diária avulsa' 
  },
  { 
    id: 5, 
    valor: 500, 
    data: '2025-07-01', 
    status: 'pago', 
    tipo: 'despesa', 
    metodo: 'aluguel', 
    descricao: 'Aluguel Quadra' 
  },
  { 
    id: 6, 
    valor: 45.50, 
    data: '2025-07-02', 
    status: 'pago', 
    tipo: 'receita', 
    metodo: 'diaria-plataforma', 
    descricao: 'Wellhub (Gympass)' 
  },
];

export const MOCK_TREINOS: Treino[] = [
  { 
    id: 1, 
    titulo: 'Treino de Defesa 2x2', 
    professorId: 1, 
    professor: 'Carlos Mendes', 
    data: '2025-07-01', 
    descricao: 'Foco em recepção de saque e posicionamento defensivo.', 
    duracao: 60, 
    nivel: 'intermediario',
    pranchetaData: {
      items: [
        { id: 101, type: 'player1', x: 150, y: 200 },
        { id: 102, type: 'player1', x: 350, y: 200 },
        { id: 103, type: 'player2', x: 250, y: 500 },
        { id: 104, type: 'ball', x: 250, y: 450 },
      ]
    }
  },
  { 
    id: 2, 
    titulo: 'Ataque e Finalização', 
    professorId: 1, 
    professor: 'Carlos Mendes', 
    data: '2025-07-02', 
    descricao: 'Técnicas de ataque, cortadas e pingo.', 
    duracao: 90, 
    nivel: 'avancado',
    pranchetaData: {
      items: [
        { id: 201, type: 'player1', x: 150, y: 200 },
        { id: 202, type: 'ball', x: 160, y: 250 },
        { id: 203, type: 'arrow', x: 160, y: 250, fromX: 160, fromY: 250, toX: 250, toY: 100, color: '#ef4444' },
      ]
    }
  },
  { 
    id: 3, 
    titulo: 'Fundamentos Básicos', 
    professorId: 2, 
    professor: 'Lucas Ferreira', 
    data: '2025-07-03', 
    descricao: 'Manchete, toque e saque para iniciantes.', 
    duracao: 45, 
    nivel: 'iniciante',
    pranchetaData: {
      items: [
        { id: 301, type: 'player1', x: 250, y: 200 },
        { id: 302, type: 'text', text: 'Posição Base', x: 250, y: 150, color: '#000000', fontSize: 16, style: 'bold' }
      ]
    }
  }
];

export const MOCK_UNIDADES: Unidade[] = [
  { 
    id: 1, 
    nome: 'CT Copacabana', 
    endereco: 'Praia de Copacabana, Rio de Janeiro - RJ', 
    telefone: '(21) 99999-9999', 
    email: 'copacabana@boraporct.com', 
    responsavel: 'Carlos Mendes', 
    ativo: true 
  },
  { 
    id: 2, 
    nome: 'CT Ipanema', 
    endereco: 'Praia de Ipanema, Rio de Janeiro - RJ', 
    telefone: '(21) 88888-8888', 
    email: 'ipanema@boraporct.com', 
    responsavel: 'Ana Paula Costa', 
    ativo: true 
  }
];

export const MOCK_PRODUTOS: Produto[] = [
  { 
    id: 1, 
    nome: 'Camisa Oficial BoraProCT', 
    preco: 89.90, 
    imagem: 'https://placehold.co/400x400/004AAD/FFFFFF?text=Camisa' 
  },
  { 
    id: 2, 
    nome: 'Boné Exclusivo', 
    preco: 49.90, 
    imagem: 'https://placehold.co/400x400/333333/FFFFFF?text=Boné' 
  },
  { 
    id: 3, 
    nome: 'Viseira Futevôlei', 
    preco: 39.90, 
    imagem: 'https://placehold.co/400x400/FF5733/FFFFFF?text=Viseira' 
  },
  { 
    id: 4, 
    nome: 'Bola Mikasa FT-5', 
    preco: 299.90, 
    imagem: 'https://placehold.co/400x400/FFC300/000000?text=Bola' 
  },
];

export const MOCK_PLATAFORMAS: Plataforma[] = [
  { id: 1, nome: 'Wellhub (Gympass)', valorPorAluno: 45.50, ativo: true },
  { id: 2, nome: 'TotalPass', valorPorAluno: 42.00, ativo: true },
  { id: 3, nome: 'Plataforma X', valorPorAluno: 50.00, ativo: false },
];

export const MOCK_PRESENCAS: Presenca[] = [
  // Professor Carlos (ID: 1) - Sistema variável
  { id: 1, alunoId: 1, professorId: 1, data: '2025-07-05', horario: '18:00', status: 'presente' },
  { id: 2, alunoId: 2, professorId: 1, data: '2025-07-05', horario: '19:00', status: 'presente' },
  { id: 3, alunoId: 3, professorId: 1, data: '2025-07-05', horario: '20:00', status: 'presente' }, // 3 aulas = R$ 20 cada
  
  // Professor Lucas (ID: 2) - Sistema fixo
  { id: 4, alunoId: 1, professorId: 2, data: '2025-07-06', horario: '17:00', status: 'presente' }, // R$ 45
  { id: 5, alunoId: 4, professorId: 2, data: '2025-07-06', horario: '18:00', status: 'presente' }, // R$ 45
  
  // Professor Ana Paula (ID: 3) - Sistema variável
  { id: 6, alunoId: 2, professorId: 3, data: '2025-07-07', horario: '19:00', status: 'presente' }, // 1 aula = R$ 30
  { id: 7, alunoId: 3, professorId: 3, data: '2025-07-08', horario: '17:00', status: 'presente' },
  { id: 8, alunoId: 1, professorId: 3, data: '2025-07-08', horario: '18:00', status: 'presente' }, // 2 aulas = R$ 25 cada
];

export const MOCK_HORARIOS_CONFIGURACAO: HorariosConfiguracao = {
  '1': { // Unidade 1 - CT Copacabana
    segunda: [
      { id: 1, horario: '17:00', professorId: 1, maxAlunos: 8, ativo: true },
      { id: 2, horario: '18:00', professorId: 1, maxAlunos: 8, ativo: true },
      { id: 3, horario: '19:00', professorId: 2, maxAlunos: 6, ativo: true }
    ],
    terca: [
      { id: 4, horario: '17:00', professorId: 3, maxAlunos: 8, ativo: true },
      { id: 5, horario: '18:00', professorId: 3, maxAlunos: 8, ativo: true }
    ],
    quarta: [
      { id: 6, horario: '17:00', professorId: 1, maxAlunos: 8, ativo: true },
      { id: 7, horario: '18:00', professorId: 2, maxAlunos: 6, ativo: true },
      { id: 8, horario: '19:00', professorId: 3, maxAlunos: 8, ativo: true }
    ],
    quinta: [
      { id: 9, horario: '17:00', professorId: 2, maxAlunos: 6, ativo: true },
      { id: 10, horario: '18:00', professorId: 1, maxAlunos: 8, ativo: true }
    ],
    sexta: [
      { id: 11, horario: '17:00', professorId: 3, maxAlunos: 8, ativo: true },
      { id: 12, horario: '18:00', professorId: 1, maxAlunos: 8, ativo: true },
      { id: 13, horario: '19:00', professorId: 2, maxAlunos: 6, ativo: true }
    ],
    sabado: [
      { id: 14, horario: '08:00', professorId: 1, maxAlunos: 8, ativo: true },
      { id: 15, horario: '09:00', professorId: 2, maxAlunos: 6, ativo: true },
      { id: 16, horario: '10:00', professorId: 3, maxAlunos: 8, ativo: true }
    ],
    domingo: [
      { id: 17, horario: '08:00', professorId: 2, maxAlunos: 6, ativo: true },
      { id: 18, horario: '09:00', professorId: 1, maxAlunos: 8, ativo: true }
    ]
  }
};

export const MOCK_ALUGUEIS: AluguelQuadra[] = [];

export const MOCK_METAS: Meta[] = [
  {
    id: 1,
    titulo: 'Meta de Receita Mensal',
    descricao: 'Atingir R$ 10.000 de receita no mês',
    valor: 10000,
    valorAtual: 7500,
    dataInicio: '2025-07-01',
    dataFim: '2025-07-31',
    tipo: 'receita',
    unidade: 'Centro',
    status: 'ativa'
  },
  {
    id: 2,
    titulo: 'Novos Alunos',
    descricao: 'Conseguir 20 novos alunos no trimestre',
    valor: 20,
    valorAtual: 12,
    dataInicio: '2025-07-01',
    dataFim: '2025-09-30',
    tipo: 'alunos',
    status: 'ativa'
  }
];

// Constants for forms and filters
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

export const STATUS_ALUNO = [
  'ativo',
  'inativo',
  'inadimplente',
  'pendente'
] as const;

export const TIPOS_USUARIO = [
  'admin',
  'gestor', 
  'professor',
  'aluno'
] as const;

export const EXPERIENCIA_PROFESSOR = [
  '1-3',
  '3-5',
  '5-10',
  '10+'
] as const;