import React, { useState } from 'react';
import { Search, Filter, X, Download } from 'lucide-react';
import { FilterOptions } from '@/types';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  placeholder?: string;
  filters?: FilterOptions;
  onFiltersChange?: (filters: FilterOptions) => void;
  clearFilters?: () => void;
  exportData?: () => void;
  showFilters?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  placeholder = 'Buscar...',
  filters = {},
  onFiltersChange,
  clearFilters,
  exportData,
  showFilters = true
}) => {
  const [showFilterModal, setShowFilterModal] = useState(false);

  const hasActiveFilters = Object.values(filters).some(value => value && value !== '');

  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {showFilters && onFiltersChange && (
          <button
            onClick={() => setShowFilterModal(true)}
            className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition-colors ${
              hasActiveFilters
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Filter size={16} />
            Filtros
            {hasActiveFilters && (
              <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                {Object.values(filters).filter(v => v && v !== '').length}
              </span>
            )}
          </button>
        )}

        {hasActiveFilters && clearFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <X size={16} />
            Limpar
          </button>
        )}

        {exportData && (
          <button
            onClick={exportData}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <Download size={16} />
            Exportar
          </button>
        )}
      </div>

      {/* Filter Modal */}
      {showFilterModal && onFiltersChange && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Filtros
              </h3>
              <button
                onClick={() => setShowFilterModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Todos</option>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                  <option value="pendente">Pendente</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Unidade
                </label>
                <select
                  value={filters.unidade || ''}
                  onChange={(e) => onFiltersChange({ ...filters, unidade: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Todas</option>
                  <option value="Centro">Centro</option>
                  <option value="Zona Sul">Zona Sul</option>
                  <option value="Zona Norte">Zona Norte</option>
                  <option value="Barra">Barra</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};