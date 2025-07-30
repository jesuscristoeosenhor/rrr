import React, { createContext, useContext, useState, useMemo } from 'react';
import { AppState, Usuario } from '@/types';
import { useLocalStorage } from '@/hooks/useStorage';
import { 
  MOCK_ALUNOS, 
  MOCK_PROFESSORES, 
  MOCK_PLANOS,
  MOCK_TRANSACOES,
  MOCK_TREINOS,
  MOCK_UNIDADES,
  MOCK_PRODUTOS,
  MOCK_PLATAFORMAS,
  MOCK_PRESENCAS,
  MOCK_HORARIOS_CONFIGURACAO,
  MOCK_ALUGUEIS,
  MOCK_METAS
} from '@/constants/mockData';

interface AppStateContextType extends AppState {
  // Setters
  setUserLogado: (user: Usuario | null) => void;
  setActiveTab: (tab: string) => void;
  setUnidadeSelecionada: (unidade: string) => void;
  setAlunos: (alunos: typeof MOCK_ALUNOS) => void;
  setProfessores: (professores: typeof MOCK_PROFESSORES) => void;
  setPlanos: (planos: typeof MOCK_PLANOS) => void;
  setTransacoes: (transacoes: typeof MOCK_TRANSACOES) => void;
  setTreinos: (treinos: typeof MOCK_TREINOS) => void;
  setUnidades: (unidades: typeof MOCK_UNIDADES) => void;
  setProdutos: (produtos: typeof MOCK_PRODUTOS) => void;
  setPlataformas: (plataformas: typeof MOCK_PLATAFORMAS) => void;
  setPresencas: (presencas: typeof MOCK_PRESENCAS) => void;
  setHorariosConfiguracao: (horarios: typeof MOCK_HORARIOS_CONFIGURACAO) => void;
  setAlugueis: (alugueis: typeof MOCK_ALUGUEIS) => void;
  setCart: (cart: AppState['cart']) => void;
  setMetas: (metas: typeof MOCK_METAS) => void;
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
  const [transacoes, setTransacoes] = useLocalStorage('transacoes', MOCK_TRANSACOES);
  const [presencas, setPresencas] = useLocalStorage('presencas', MOCK_PRESENCAS);
  const [agendamentos, setAgendamentos] = useLocalStorage('agendamentos', []);
  
  // New entities from atual.jsx
  const [treinos, setTreinos] = useLocalStorage('treinos', MOCK_TREINOS);
  const [unidades, setUnidades] = useLocalStorage('unidades', MOCK_UNIDADES);
  const [produtos, setProdutos] = useLocalStorage('produtos', MOCK_PRODUTOS);
  const [plataformas, setPlataformas] = useLocalStorage('plataformas', MOCK_PLATAFORMAS);
  const [horariosConfiguracao, setHorariosConfiguracao] = useLocalStorage('horariosConfiguracao', MOCK_HORARIOS_CONFIGURACAO);
  const [alugueis, setAlugueis] = useLocalStorage('alugueis', MOCK_ALUGUEIS);
  const [metas, setMetas] = useLocalStorage('metas', MOCK_METAS);

  // Session state (not persisted)
  const [userLogado, setUserLogado] = useState<Usuario | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [unidadeSelecionada, setUnidadeSelecionada] = useState('Centro');
  const [cart, setCart] = useState<AppState['cart']>([]);

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
    treinos,
    unidades,
    produtos,
    plataformas,
    horariosConfiguracao,
    alugueis,
    cart,
    metas,
    
    // Setters
    setUserLogado,
    setActiveTab,
    setUnidadeSelecionada,
    setAlunos,
    setProfessores,
    setPlanos,
    setTransacoes,
    setPresencas,
    setTreinos,
    setUnidades,
    setProdutos,
    setPlataformas,
    setHorariosConfiguracao,
    setAlugueis,
    setCart,
    setMetas
  }), [
    userLogado, setUserLogado,
    activeTab, setActiveTab,
    unidadeSelecionada, setUnidadeSelecionada,
    alunos, setAlunos,
    professores, setProfessores,
    planos, setPlanos,
    transacoes, setTransacoes,
    presencas, setPresencas,
    agendamentos, setAgendamentos,
    treinos, setTreinos,
    unidades, setUnidades,
    produtos, setProdutos,
    plataformas, setPlataformas,
    horariosConfiguracao, setHorariosConfiguracao,
    alugueis, setAlugueis,
    cart, setCart,
    metas, setMetas
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