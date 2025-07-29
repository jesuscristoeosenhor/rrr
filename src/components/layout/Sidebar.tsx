import React, { memo } from 'react';
import { X, BarChart3, Users, GraduationCap, DollarSign, Calendar, Settings } from 'lucide-react';
import { useAppState } from '@/contexts/AppStateContext';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  isMobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  isCollapsed: boolean;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
}

const menuItems: MenuItem[] = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: BarChart3,
    roles: ['admin', 'gestor', 'professor', 'aluno']
  },
  { 
    id: 'alunos', 
    label: 'Alunos', 
    icon: Users,
    roles: ['admin', 'gestor', 'professor']
  },
  { 
    id: 'professores', 
    label: 'Professores', 
    icon: GraduationCap,
    roles: ['admin', 'gestor']
  },
  { 
    id: 'financeiro', 
    label: 'Financeiro', 
    icon: DollarSign,
    roles: ['admin', 'gestor']
  },
  { 
    id: 'agendamentos', 
    label: 'Agendamentos', 
    icon: Calendar,
    roles: ['admin', 'gestor', 'professor', 'aluno']
  },
  { 
    id: 'configuracoes', 
    label: 'Configurações', 
    icon: Settings,
    roles: ['admin', 'gestor']
  },
];

export const Sidebar = memo<SidebarProps>(({ 
  isMobileOpen, 
  setMobileOpen,
  isCollapsed 
}) => {
  const { activeTab, setActiveTab } = useAppState();
  const { user } = useAuth();

  const visibleMenuItems = menuItems.filter(item => 
    user && item.roles.includes(user.tipo)
  );

  const handleMenuClick = (itemId: string) => {
    setActiveTab(itemId);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full bg-gray-900 text-white z-50 transition-all duration-300
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
        w-64
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h1 className={`font-bold text-xl truncate transition-opacity duration-300 ${isCollapsed ? 'lg:opacity-0' : 'opacity-100'}`}>
            Futvolei System
          </h1>
          
          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-gray-700 transition-colors"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="mt-6 px-2">
          {visibleMenuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`
                  w-full flex items-center px-3 py-3 mb-1 text-left rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }
                  ${isCollapsed ? 'lg:justify-center lg:px-2' : ''}
                `}
                title={isCollapsed ? item.label : undefined}
                aria-label={item.label}
              >
                <IconComponent className={`h-5 w-5 flex-shrink-0 ${isCollapsed ? '' : 'mr-3'}`} />
                <span className={`font-medium transition-opacity duration-300 ${
                  isCollapsed ? 'lg:hidden' : ''
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* User info in collapsed mode */}
        {isCollapsed && user && (
          <div className="absolute bottom-4 left-2 right-2 lg:block hidden">
            <div className="bg-gray-800 rounded-lg p-2 text-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full mx-auto mb-1 flex items-center justify-center">
                <span className="text-xs font-bold">
                  {user.nome.charAt(0).toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-gray-300 truncate">
                {user.nome.split(' ')[0]}
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
});