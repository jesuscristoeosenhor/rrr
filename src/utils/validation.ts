import { z } from 'zod';

// Base validation schemas
export const emailSchema = z
  .string()
  .email('Email inválido')
  .min(1, 'Email é obrigatório');

export const phoneSchema = z
  .string()
  .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Telefone deve estar no formato (XX) XXXXX-XXXX')
  .min(1, 'Telefone é obrigatório');

export const passwordSchema = z
  .string()
  .min(8, 'Senha deve ter pelo menos 8 caracteres')
  .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
  .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
  .regex(/\d/, 'Senha deve conter pelo menos um número')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Senha deve conter pelo menos um caractere especial');

export const nameSchema = z
  .string()
  .min(2, 'Nome deve ter pelo menos 2 caracteres')
  .max(100, 'Nome deve ter no máximo 100 caracteres')
  .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços');

// User schemas
export const usuarioSchema = z.object({
  id: z.string().uuid().optional(),
  nome: nameSchema,
  email: emailSchema,
  senha: passwordSchema,
  tipo: z.enum(['admin', 'gestor', 'professor', 'aluno']),
  unidade: z.string().optional(),
  telefone: phoneSchema.optional(),
  ativo: z.boolean().default(true),
  criadoEm: z.date().optional(),
  atualizadoEm: z.date().optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  senha: z.string().min(1, 'Senha é obrigatória'),
});

// Student schemas
export const alunoSchema = z.object({
  id: z.string().uuid().optional(),
  nome: nameSchema,
  telefone: phoneSchema,
  email: emailSchema,
  tipoPlano: z.enum(['mensalidade', 'plataforma']),
  planoId: z.number().optional(),
  plataformaParceira: z.string().optional(),
  unidade: z.string().min(1, 'Unidade é obrigatória'),
  status: z.enum(['ativo', 'inativo', 'inadimplente']).default('ativo'),
  vencimento: z.string().min(1, 'Data de vencimento é obrigatória'),
  senha: passwordSchema,
  nivel: z.enum(['iniciante', 'intermediario', 'avancado']).default('iniciante'),
  dataMatricula: z.string().min(1, 'Data de matrícula é obrigatória'),
  objetivo: z.string().min(1, 'Objetivo é obrigatório'),
  criadoEm: z.date().optional(),
  atualizadoEm: z.date().optional(),
});

export const alunoCreateSchema = alunoSchema.omit({ id: true, criadoEm: true, atualizadoEm: true });
export const alunoUpdateSchema = alunoSchema.partial().required({ id: true });

// Teacher schemas
export const professorSchema = z.object({
  id: z.string().uuid().optional(),
  nome: nameSchema,
  telefone: phoneSchema,
  email: emailSchema,
  senha: passwordSchema,
  unidade: z.string().min(1, 'Unidade é obrigatória'),
  especialidade: z.string().min(1, 'Especialidade é obrigatória'),
  salario: z.number().positive('Salário deve ser positivo'),
  status: z.enum(['ativo', 'inativo']).default('ativo'),
  dataContratacao: z.string().min(1, 'Data de contratação é obrigatória'),
  criadoEm: z.date().optional(),
  atualizadoEm: z.date().optional(),
});

export const professorCreateSchema = professorSchema.omit({ id: true, criadoEm: true, atualizadoEm: true });
export const professorUpdateSchema = professorSchema.partial().required({ id: true });

// Plan schemas
export const planoSchema = z.object({
  id: z.string().uuid().optional(),
  nome: z.string().min(1, 'Nome do plano é obrigatório'),
  preco: z.number().positive('Preço deve ser positivo'),
  unidade: z.string().min(1, 'Unidade é obrigatória'),
  descricao: z.string().optional(),
  criadoEm: z.date().optional(),
  atualizadoEm: z.date().optional(),
});

// Transaction schemas
export const transacaoSchema = z.object({
  id: z.string().uuid().optional(),
  tipo: z.enum(['receita', 'despesa']),
  valor: z.number().positive('Valor deve ser positivo'),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  categoria: z.string().min(1, 'Categoria é obrigatória'),
  unidade: z.string().min(1, 'Unidade é obrigatória'),
  data: z.date(),
  usuarioId: z.string().uuid(),
  status: z.enum(['pendente', 'confirmada', 'cancelada']).default('pendente'),
  criadoEm: z.date().optional(),
  atualizadoEm: z.date().optional(),
});

// Filter schemas
export const filterOptionsSchema = z.object({
  searchTerm: z.string().default(''),
  status: z.string().optional(),
  unidade: z.string().optional(),
  tipoPlano: z.string().optional(),
  nivel: z.string().optional(),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
});

// Export type inference
export type UsuarioInput = z.infer<typeof usuarioSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AlunoInput = z.infer<typeof alunoCreateSchema>;
export type AlunoUpdateInput = z.infer<typeof alunoUpdateSchema>;
export type ProfessorInput = z.infer<typeof professorCreateSchema>;
export type ProfessorUpdateInput = z.infer<typeof professorUpdateSchema>;
export type PlanoInput = z.infer<typeof planoSchema>;
export type TransacaoInput = z.infer<typeof transacaoSchema>;
export type FilterOptionsInput = z.infer<typeof filterOptionsSchema>;