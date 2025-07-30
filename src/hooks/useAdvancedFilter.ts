import { useMemo } from 'react';
import { FilterOptions } from '@/types';

export const useAdvancedFilter = <T extends Record<string, any>>(
  data: T[],
  filters: FilterOptions
) => {
  return useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    
    return data.filter(item => {
      // Filtro por texto (nome/email/descricao)
      if (filters.searchTerm || filters.nome) {
        const searchTerm = (filters.searchTerm || filters.nome || '').toLowerCase();
        const searchFields = ['nome', 'email', 'descricao', 'aluno'];
        const matchesSearch = searchFields.some(field => {
          const value = item[field];
          return value && String(value).toLowerCase().includes(searchTerm);
        });
        if (!matchesSearch) return false;
      }

      // Filtro por status
      if (filters.status && item.status !== filters.status) {
        return false;
      }

      // Filtro por tipo de plano
      if (filters.tipoPlano && item.tipoPlano !== filters.tipoPlano) {
        return false;
      }

      // Filtro por unidade
      if (filters.unidade && item.unidade !== filters.unidade) {
        return false;
      }

      // Filtro por nível
      if (filters.nivel && item.nivel !== filters.nivel) {
        return false;
      }

      // Filtro por situação de vencimento
      if (filters.vencimento) {
        const hoje = new Date();
        
        if (filters.vencimento === 'vencido') {
          if (item.tipoPlano === 'plataforma') return false;
          const vencimento = new Date(item.vencimento);
          if (vencimento >= hoje) return false;
        }
        
        if (filters.vencimento === 'vencendo') {
          if (item.tipoPlano === 'plataforma') return false;
          const vencimento = new Date(item.vencimento);
          const diffDias = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDias > 7 || diffDias < 0) return false;
        }
        
        if (filters.vencimento === 'ok') {
          if (item.tipoPlano === 'plataforma') return false;
          const vencimento = new Date(item.vencimento);
          const diffDias = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDias <= 7) return false;
        }
        
        if (filters.vencimento === 'sem-vencimento') {
          if (item.tipoPlano !== 'plataforma') return false;
        }
      }

      // Filtro por data
      if (filters.dataInicio) {
        const dataItem = new Date(item.data || item.dataMatricula || item.criadoEm);
        const dataInicio = new Date(filters.dataInicio);
        if (dataItem < dataInicio) return false;
      }

      if (filters.dataFim) {
        const dataItem = new Date(item.data || item.dataMatricula || item.criadoEm);
        const dataFim = new Date(filters.dataFim);
        if (dataItem > dataFim) return false;
      }

      return true;
    });
  }, [data, filters]);
};