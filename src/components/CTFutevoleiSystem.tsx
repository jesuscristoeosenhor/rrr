import React, { useState, useCallback, memo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAppState } from '@/contexts/AppStateContext';

// Placeholder components until we extract them
const Dashboard = memo(() => (
  <div className="p-6">
    <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
      Dashboard
    </h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Total de Alunos</h3>
        <p className="text-3xl font-bold text-blue-600">120</p>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Professores Ativos</h3>
        <p className="text-3xl font-bold text-green-600">8</p>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Receita Mensal</h3>
        <p className="text-3xl font-bold text-yellow-600">R$ 25.000</p>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Aulas Hoje</h3>
        <p className="text-3xl font-bold text-purple-600">15</p>
      </div>
    </div>
  </div>
));

const Header = memo(({ toggleMobileSidebar }: { toggleMobileSidebar: () => void }) => {
  const { user, logout } = useAuth();
  
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Bem-vindo, {user?.nome}
          </span>
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
});

const MenuSidebar = memo(({ 
  isMobileOpen, 
  setMobileOpen,
  isCollapsed 
}: { 
  isMobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  isCollapsed: boolean;
}) => {
  const { activeTab, setActiveTab } = useAppState();
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'alunos', label: 'Alunos', icon: '👥' },
    { id: 'professores', label: 'Professores', icon: '👨‍🏫' },
    { id: 'financeiro', label: 'Financeiro', icon: '💰' },
    { id: 'agendamentos', label: 'Agendamentos', icon: '📅' },
    { id: 'configuracoes', label: 'Configurações', icon: '⚙️' },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full bg-gray-900 text-white z-50 transition-all duration-300
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
        w-64
      `}>
        <div className="p-4">
          <h1 className={`font-bold text-xl ${isCollapsed ? 'lg:hidden' : ''}`}>
            Futvolei System
          </h1>
        </div>
        
        <nav className="mt-8">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileOpen(false);
              }}
              className={`
                w-full flex items-center px-4 py-3 text-left hover:bg-gray-800 transition-colors
                ${activeTab === item.id ? 'bg-gray-800 border-r-4 border-blue-500' : ''}
              `}
            >
              <span className="text-2xl mr-3">{item.icon}</span>
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
});

const CTFutevoleiSystemInternal = memo(() => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed] = useState(false);
  const { activeTab } = useAppState();

  const renderContent = useCallback(() => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'alunos':
        return <div className="p-6"><h1 className="text-2xl font-bold">Alunos (Em desenvolvimento)</h1></div>;
      case 'professores':
        return <div className="p-6"><h1 className="text-2xl font-bold">Professores (Em desenvolvimento)</h1></div>;
      case 'financeiro':
        return <div className="p-6"><h1 className="text-2xl font-bold">Financeiro (Em desenvolvimento)</h1></div>;
      case 'agendamentos':
        return <div className="p-6"><h1 className="text-2xl font-bold">Agendamentos (Em desenvolvimento)</h1></div>;
      case 'configuracoes':
        return <div className="p-6"><h1 className="text-2xl font-bold">Configurações (Em desenvolvimento)</h1></div>;
      default:
        return <Dashboard />;
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <MenuSidebar 
        isMobileOpen={isMobileSidebarOpen} 
        setMobileOpen={setIsMobileSidebarOpen} 
        isCollapsed={isSidebarCollapsed} 
      />
      
      <div className={`transition-all duration-300 ${
        isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
      } min-h-screen flex flex-col`}>
        <Header 
          toggleMobileSidebar={() => setIsMobileSidebarOpen(true)} 
        />
        
        <main className="flex-grow p-3 sm:p-4 lg:p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
});

export const CTFutevoleiSystem: React.FC = () => {
  return <CTFutevoleiSystemInternal />;
};