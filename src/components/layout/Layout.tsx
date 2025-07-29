import React, { useState, ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <Sidebar 
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
          {children}
        </main>
      </div>
    </div>
  );
};