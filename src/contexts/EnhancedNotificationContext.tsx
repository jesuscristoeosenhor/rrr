import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { Bell, X, Check, AlertCircle, Info, CheckCircle, Clock, Calendar, User, DollarSign } from 'lucide-react';
import { NotificationData, NotificationContextType } from '@/types';
import { useLocalStorage } from '@/hooks/useStorage';
import { useAuth } from '@/contexts/AuthContext';

const NotificationContext = createContext<NotificationContextType | null>(null);

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useLocalStorage<NotificationData[]>('notifications', []);
  const [toastNotifications, setToastNotifications] = useState<NotificationData[]>([]);

  // Filter notifications for current user
  const userNotifications = useMemo(() => {
    if (!user) return [];
    return notifications.filter(n => n.usuarioId === user.id);
  }, [notifications, user]);

  const addNotification = useCallback((notificationData: Omit<NotificationData, 'id' | 'criadoEm' | 'atualizadoEm'>) => {
    if (!user) return;

    const newNotification: NotificationData = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...notificationData,
      usuarioId: user.id,
      lida: false,
      criadoEm: new Date(),
      atualizadoEm: new Date()
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 99)]); // Keep only 100 notifications

    // Show toast notification
    if (notificationData.canais?.includes('app')) {
      setToastNotifications(prev => [...prev, newNotification]);
      
      // Auto remove toast after 5 seconds
      setTimeout(() => {
        setToastNotifications(prev => prev.filter(n => n.id !== newNotification.id));
      }, 5000);
    }

    // Simulate other notification channels
    if (notificationData.canais?.includes('email')) {
      console.log('📧 Email notification would be sent:', newNotification);
    }
    if (notificationData.canais?.includes('sms')) {
      console.log('📱 SMS notification would be sent:', newNotification);
    }
    if (notificationData.canais?.includes('push')) {
      console.log('🔔 Push notification would be sent:', newNotification);
      
      // Browser push notification (if supported and permission granted)
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(newNotification.titulo, {
          body: newNotification.mensagem,
          icon: '/favicon.ico',
          tag: newNotification.id
        });
      }
    }
  }, [user, setNotifications]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, lida: true, atualizadoEm: new Date() }
          : notification
      )
    );
  }, [setNotifications]);

  const markAllAsRead = useCallback(() => {
    if (!user) return;
    
    setNotifications(prev => 
      prev.map(notification => 
        notification.usuarioId === user.id && !notification.lida
          ? { ...notification, lida: true, atualizadoEm: new Date() }
          : notification
      )
    );
  }, [user, setNotifications]);

  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setToastNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, [setNotifications]);

  const clearAll = useCallback(() => {
    if (!user) return;
    
    setNotifications(prev => prev.filter(n => n.usuarioId !== user.id));
    setToastNotifications([]);
  }, [user, setNotifications]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Unread count
  const unreadCount = useMemo(() => {
    return userNotifications.filter(n => !n.lida).length;
  }, [userNotifications]);

  const value: NotificationContextType = {
    notifications: userNotifications,
    toastNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    unreadCount
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationToaster />
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications deve ser usado dentro de um NotificationProvider');
  }
  return context;
};

// Toast Notification Component
const NotificationToaster: React.FC = () => {
  const { toastNotifications, removeNotification } = useNotifications();

  if (toastNotifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toastNotifications.map(notification => (
        <ToastNotification
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

// Individual Toast Notification
interface ToastNotificationProps {
  notification: NotificationData;
  onClose: () => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation
  };

  const getIcon = () => {
    switch (notification.tipo) {
      case 'agendamento':
        return <Calendar className="text-blue-500" size={20} />;
      case 'pagamento':
        return <DollarSign className="text-green-500" size={20} />;
      case 'promocao':
        return <Info className="text-purple-500" size={20} />;
      case 'lembrete':
        return <Clock className="text-orange-500" size={20} />;
      case 'sistema':
      default:
        return <Bell className="text-gray-500" size={20} />;
    }
  };

  const getPriorityColor = () => {
    switch (notification.prioridade) {
      case 'urgente':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'alta':
        return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'media':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'baixa':
      default:
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <div
      className={`transform transition-all duration-300 ease-in-out ${
        isVisible 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`bg-white dark:bg-gray-800 border-l-4 ${getPriorityColor()} rounded-lg shadow-lg p-4 max-w-sm`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                {notification.titulo}
              </h4>
              <button
                onClick={handleClose}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={16} />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
              {notification.mensagem}
            </p>
            
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500 dark:text-gray-500">
                {new Date(notification.criadoEm).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              
              {notification.prioridade === 'urgente' && (
                <span className="text-xs bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 px-2 py-1 rounded-full">
                  Urgente
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Notification Bell Component for Header
export const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const recentNotifications = useMemo(() => {
    return notifications
      .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime())
      .slice(0, 10);
  }, [notifications]);

  const handleNotificationClick = (notification: NotificationData) => {
    if (!notification.lida) {
      markAsRead(notification.id);
    }
    setIsOpen(false);
    
    // Navigate to related page if applicable
    if (notification.agendamentoId) {
      // Would navigate to booking details
      console.log('Navigate to booking:', notification.agendamentoId);
    }
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Panel */}
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Notificações
              </h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    Marcar todas como lidas
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-xs text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    Limpar tudo
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-64 overflow-y-auto">
              {recentNotifications.length > 0 ? (
                recentNotifications.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={() => handleNotificationClick(notification)}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Bell size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Nenhuma notificação</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 10 && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
                <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
                  Ver todas as notificações
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// Individual Notification Item
interface NotificationItemProps {
  notification: NotificationData;
  onClick: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClick }) => {
  const getIcon = () => {
    switch (notification.tipo) {
      case 'agendamento':
        return <Calendar className="text-blue-500" size={16} />;
      case 'pagamento':
        return <DollarSign className="text-green-500" size={16} />;
      case 'promocao':
        return <Info className="text-purple-500" size={16} />;
      case 'lembrete':
        return <Clock className="text-orange-500" size={16} />;
      case 'sistema':
      default:
        return <Bell className="text-gray-500" size={16} />;
    }
  };

  const getTimeAgo = () => {
    const now = new Date();
    const notificationTime = new Date(notification.criadoEm);
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'agora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  return (
    <button
      onClick={onClick}
      className={`w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
        !notification.lida ? 'bg-blue-50 dark:bg-blue-900/10' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`text-sm truncate ${
              !notification.lida 
                ? 'font-semibold text-gray-900 dark:text-gray-100' 
                : 'font-medium text-gray-700 dark:text-gray-300'
            }`}>
              {notification.titulo}
            </h4>
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-xs text-gray-500 dark:text-gray-500">
                {getTimeAgo()}
              </span>
              {!notification.lida && (
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
              )}
            </div>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
            {notification.mensagem}
          </p>
          
          {notification.prioridade === 'urgente' && (
            <span className="inline-block text-xs bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 px-2 py-1 rounded-full mt-2">
              Urgente
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

// Notification Service for creating booking-related notifications
export const NotificationService = {
  // Booking reminders
  createBookingReminder: (booking: any, hoursBeforeEvent: number) => ({
    tipo: 'lembrete' as const,
    titulo: 'Lembrete de Agendamento',
    mensagem: `Seu agendamento é em ${hoursBeforeEvent} horas. Quadra ${booking.quadra} às ${booking.horarioInicio}.`,
    prioridade: 'media' as const,
    canais: ['app', 'push'] as const,
    agendamentoId: booking.id,
    metadata: { bookingId: booking.id, type: 'reminder' }
  }),

  // Booking confirmations
  createBookingConfirmation: (booking: any) => ({
    tipo: 'agendamento' as const,
    titulo: 'Agendamento Confirmado',
    mensagem: `Seu agendamento foi confirmado para ${new Date(booking.data).toLocaleDateString('pt-BR')} às ${booking.horarioInicio}.`,
    prioridade: 'alta' as const,
    canais: ['app', 'email', 'push'] as const,
    agendamentoId: booking.id,
    metadata: { bookingId: booking.id, type: 'confirmation' }
  }),

  // Payment notifications
  createPaymentNotification: (payment: any, success: boolean) => ({
    tipo: 'pagamento' as const,
    titulo: success ? 'Pagamento Confirmado' : 'Pagamento Pendente',
    mensagem: success 
      ? `Pagamento de R$ ${payment.valor.toFixed(2)} foi processado com sucesso.`
      : `Pagamento de R$ ${payment.valor.toFixed(2)} está pendente. Verifique os detalhes.`,
    prioridade: success ? 'media' as const : 'alta' as const,
    canais: ['app', 'email'] as const,
    metadata: { paymentId: payment.id, success }
  }),

  // Promotional notifications
  createPromoNotification: (promo: any) => ({
    tipo: 'promocao' as const,
    titulo: promo.titulo,
    mensagem: promo.mensagem,
    prioridade: 'baixa' as const,
    canais: ['app'] as const,
    metadata: { promoId: promo.id, type: 'promotion' }
  }),

  // System notifications
  createSystemNotification: (title: string, message: string, priority: 'baixa' | 'media' | 'alta' | 'urgente' = 'media') => ({
    tipo: 'sistema' as const,
    titulo: title,
    mensagem: message,
    prioridade: priority,
    canais: ['app'] as const,
    metadata: { type: 'system' }
  })
};