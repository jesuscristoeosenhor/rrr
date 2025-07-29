import React from 'react';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { MainSystem } from '@/components/MainSystem';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <NotificationProvider>
          <AuthProvider>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#374151',
                    color: '#fff',
                    fontSize: '14px',
                  },
                  success: {
                    iconTheme: {
                      primary: '#10B981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#EF4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
              <MainSystem />
            </div>
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;