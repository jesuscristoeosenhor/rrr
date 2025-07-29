import React, { createContext, useContext, useState, useMemo } from 'react';
import { AppState, Usuario } from '@/types';
import { useLocalStorage } from '@/hooks/useStorage';
import { MOCK_ALUNOS, MOCK_PROFESSORES, MOCK_PLANOS } from '@/constants/mockData';

interface AppStateContextType extends AppState {
  // Setters
  setUserLogado: (user: Usuario | null) => void;
  setActiveTab: (tab: string) => void;
  setUnidadeSelecionada: (unidade: string) => void;
  setAlunos: (alunos: typeof MOCK_ALUNOS) => void;
  setProfessores: (professores: typeof MOCK_PROFESSORES) => void;
  setPlanos: (planos: typeof MOCK_PLANOS) => void;
}

const AppStateContext = createContext<AppStateContextType | null>(null);

interface AppStateProviderProps {
  children: React.ReactNode;
}

export const AppStateProvider: React.FC<AppStateProviderProps> = ({ children }) => {
  // Persistent storage for data
  const [alunos, setAlunos] = useLocalStorage('alunos', MOCK_ALUNOS);
  const [professores, setProfessores] = useLocalStorage('professores', MOCK_PROFESSORES);  
  const [planos, setPlanos] = useLocalStorage('planos', MOCK_PLANOS);
  const [transacoes] = useLocalStorage('transacoes', []);
  const [presencas] = useLocalStorage('presencas', []);
  const [agendamentos] = useLocalStorage('agendamentos', []);

  // Session state (not persisted)
  const [userLogado, setUserLogado] = useState<Usuario | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [unidadeSelecionada, setUnidadeSelecionada] = useState('Centro');

  const value = useMemo((): AppStateContextType => ({
    // State
    userLogado,
    activeTab,
    unidadeSelecionada,
    alunos,
    professores,
    planos,
    transacoes,
    presencas,
    agendamentos,
    
    // Setters
    setUserLogado,
    setActiveTab,
    setUnidadeSelecionada,
    setAlunos,
    setProfessores,
    setPlanos,
  }), [
    userLogado,
    activeTab,
    unidadeSelecionada,
    alunos,
    professores,
    planos,
    transacoes,
    presencas,
    agendamentos,
  ]);

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = (): AppStateContextType => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};