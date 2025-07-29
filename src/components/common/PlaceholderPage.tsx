import React from 'react';
import { Construction } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ 
  title, 
  description, 
  icon: Icon = Construction 
}) => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
            <Icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Em desenvolvimento:</strong> Esta página está sendo construída 
            como parte da refatoração do sistema monolítico original.
          </p>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>Funcionalidades planejadas:</p>
          <ul className="mt-2 space-y-1 text-left">
            <li>• Interface moderna e responsiva</li>
            <li>• Validação de dados em tempo real</li>
            <li>• Sistema de busca e filtros</li>
            <li>• Exportação de relatórios</li>
            <li>• Controle de permissões por usuário</li>
          </ul>
        </div>
      </div>
    </div>
  );
};