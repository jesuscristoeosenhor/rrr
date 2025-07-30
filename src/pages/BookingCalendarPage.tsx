import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, User, Users, MapPin, DollarSign, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { Agendamento, Quadra, Usuario, CalendarEvent, TimeSlot } from '@/types';
import { useLocalStorage } from '@/hooks/useStorage';
import { generateId } from '@/utils/helpers';
import toast from 'react-hot-toast';

// Mock data
const mockAgendamentos: Agendamento[] = [
  {
    id: '1',
    alunoId: '1',
    quadraId: '1',
    unidadeId: '1',
    data: new Date('2024-12-20'),
    horarioInicio: '09:00',
    horarioFim: '10:00',
    tipo: 'jogo-livre',
    status: 'confirmado',
    participantes: [
      { usuarioId: '1', nome: 'João Silva', confirmado: true, papel: 'organizador' },
      { usuarioId: '2', nome: 'Maria Santos', confirmado: true, papel: 'participante' }
    ],
    valor: 120.00,
    metodoPagamento: 'pix',
    criadoEm: new Date('2024-12-15'),
    atualizadoEm: new Date('2024-12-15')
  },
  {
    id: '2',
    alunoId: '2',
    professorId: '1',
    quadraId: '1',
    unidadeId: '1',
    data: new Date('2024-12-20'),
    horarioInicio: '15:00',
    horarioFim: '16:00',
    tipo: 'aula',
    status: 'agendado',
    participantes: [
      { usuarioId: '2', nome: 'Maria Santos', confirmado: true, papel: 'organizador' }
    ],
    valor: 100.00,
    metodoPagamento: 'plano',
    criadoEm: new Date('2024-12-15'),
    atualizadoEm: new Date('2024-12-15')
  }
];

const BookingCalendarPage: React.FC = () => {
  const { addNotification } = useNotifications();
  const { user, hasPermission } = useAuth();
  
  // State
  const [agendamentos, setAgendamentos] = useLocalStorage<Agendamento[]>('agendamentos', mockAgendamentos);
  const [quadras] = useLocalStorage<Quadra[]>('quadras', []);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedQuadra, setSelectedQuadra] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [editingBooking, setEditingBooking] = useState<Agendamento | null>(null);

  // Permissions
  const canCreate = hasPermission('agendamentos', 'criar');
  const canEdit = hasPermission('agendamentos', 'editar');
  const canDelete = hasPermission('agendamentos', 'deletar');

  // Time slots for booking (6 AM to 10 PM, hourly slots)
  const timeSlots = useMemo(() => {
    const slots: TimeSlot[] = [];
    for (let hour = 6; hour <= 22; hour++) {
      const start = `${hour.toString().padStart(2, '0')}:00`;
      const end = `${(hour + 1).toString().padStart(2, '0')}:00`;
      slots.push({
        start,
        end,
        available: true // Will be calculated based on existing bookings
      });
    }
    return slots;
  }, []);

  // Filter agendamentos by selected date and quadra
  const filteredAgendamentos = useMemo(() => {
    return agendamentos.filter(agendamento => {
      const agendamentoDate = new Date(agendamento.data);
      const sameDate = agendamentoDate.toDateString() === selectedDate.toDateString();
      const sameQuadra = selectedQuadra === 'all' || agendamento.quadraId === selectedQuadra;
      return sameDate && sameQuadra;
    });
  }, [agendamentos, selectedDate, selectedQuadra]);

  // Calculate available time slots
  const availableTimeSlots = useMemo(() => {
    return timeSlots.map(slot => {
      const isOccupied = filteredAgendamentos.some(agendamento => {
        const startTime = agendamento.horarioInicio;
        const endTime = agendamento.horarioFim;
        return (
          (slot.start >= startTime && slot.start < endTime) ||
          (slot.end > startTime && slot.end <= endTime) ||
          (slot.start <= startTime && slot.end >= endTime)
        );
      });
      
      const quadraPrice = selectedQuadra !== 'all' 
        ? quadras.find(q => q.id === selectedQuadra)?.preco[slot.start]?.valor || 0
        : 0;

      return {
        ...slot,
        available: !isOccupied,
        price: quadraPrice,
        agendamentoId: isOccupied 
          ? filteredAgendamentos.find(a => 
              (slot.start >= a.horarioInicio && slot.start < a.horarioFim)
            )?.id
          : undefined
      };
    });
  }, [timeSlots, filteredAgendamentos, selectedQuadra, quadras]);

  // Calendar navigation
  const navigateDate = useCallback((direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
    setSelectedDate(newDate);
  }, [currentDate, viewMode]);

  // Handle booking creation/update
  const handleSaveBooking = useCallback((bookingData: Partial<Agendamento>) => {
    try {
      if (editingBooking) {
        // Update existing booking
        const updatedBookings = agendamentos.map(booking =>
          booking.id === editingBooking.id
            ? { ...booking, ...bookingData, atualizadoEm: new Date() }
            : booking
        );
        setAgendamentos(updatedBookings);
        addNotification({
          type: 'success',
          title: 'Agendamento atualizado',
          message: 'O agendamento foi atualizado com sucesso.'
        });
      } else {
        // Create new booking
        const newBooking: Agendamento = {
          id: generateId(),
          ...bookingData as Agendamento,
          criadoEm: new Date(),
          atualizadoEm: new Date()
        };
        setAgendamentos([...agendamentos, newBooking]);
        addNotification({
          type: 'success',
          title: 'Agendamento criado',
          message: 'O agendamento foi criado com sucesso.'
        });
      }
      setShowBookingModal(false);
      setEditingBooking(null);
      setSelectedTimeSlot(null);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao salvar agendamento. Tente novamente.'
      });
    }
  }, [editingBooking, agendamentos, setAgendamentos, addNotification]);

  // Handle booking deletion
  const handleDeleteBooking = useCallback((booking: Agendamento) => {
    if (window.confirm('Tem certeza que deseja cancelar este agendamento?')) {
      const updatedBookings = agendamentos.filter(b => b.id !== booking.id);
      setAgendamentos(updatedBookings);
      addNotification({
        type: 'success',
        title: 'Agendamento cancelado',
        message: 'O agendamento foi cancelado com sucesso.'
      });
    }
  }, [agendamentos, setAgendamentos, addNotification]);

  // Handle time slot click
  const handleTimeSlotClick = useCallback((slot: TimeSlot) => {
    if (!slot.available) {
      // Show booking details
      const booking = filteredAgendamentos.find(a => 
        slot.start >= a.horarioInicio && slot.start < a.horarioFim
      );
      if (booking) {
        setEditingBooking(booking);
        setShowBookingModal(true);
      }
    } else if (canCreate) {
      // Create new booking
      if (selectedQuadra === 'all') {
        toast.error('Selecione uma quadra para fazer o agendamento');
        return;
      }
      setSelectedTimeSlot(slot);
      setEditingBooking(null);
      setShowBookingModal(true);
    }
  }, [filteredAgendamentos, canCreate, selectedQuadra]);

  // Statistics
  const stats = useMemo(() => {
    const today = new Date();
    const todayBookings = agendamentos.filter(a => 
      new Date(a.data).toDateString() === today.toDateString()
    );
    
    const thisWeekBookings = agendamentos.filter(a => {
      const bookingDate = new Date(a.data);
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return bookingDate >= weekStart && bookingDate <= weekEnd;
    });

    return {
      todayTotal: todayBookings.length,
      todayConfirmed: todayBookings.filter(b => b.status === 'confirmado').length,
      weekTotal: thisWeekBookings.length,
      weekRevenue: thisWeekBookings.reduce((sum, b) => sum + b.valor, 0)
    };
  }, [agendamentos]);

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
                📅 Calendário de Agendamentos
                <span className="text-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full">
                  {stats.todayConfirmed} hoje
                </span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gerencie todos os agendamentos das suas quadras
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {canCreate && (
                <button
                  onClick={() => {
                    if (selectedQuadra === 'all') {
                      toast.error('Selecione uma quadra primeiro');
                      return;
                    }
                    setEditingBooking(null);
                    setSelectedTimeSlot(null);
                    setShowBookingModal(true);
                  }}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Plus size={16} />
                  Novo Agendamento
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-2xl font-bold text-blue-600">{stats.todayTotal}</div>
            <div className="text-sm text-blue-800 dark:text-blue-300">Agendamentos Hoje</div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <div className="text-2xl font-bold text-green-600">{stats.todayConfirmed}</div>
            <div className="text-sm text-green-800 dark:text-green-300">Confirmados Hoje</div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="text-2xl font-bold text-purple-600">{stats.weekTotal}</div>
            <div className="text-sm text-purple-800 dark:text-purple-300">Esta Semana</div>
          </div>
          
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="text-2xl font-bold text-orange-600">R$ {stats.weekRevenue.toFixed(0)}</div>
            <div className="text-sm text-orange-800 dark:text-orange-300">Receita Semanal</div>
          </div>
        </div>

        {/* Calendar Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            {/* Date Navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigateDate('prev')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <ChevronLeft size={20} />
              </button>
              
              <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {selectedDate.toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              
              <button
                onClick={() => navigateDate('next')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <ChevronRight size={20} />
              </button>
              
              <button
                onClick={() => {
                  const today = new Date();
                  setCurrentDate(today);
                  setSelectedDate(today);
                }}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30"
              >
                Hoje
              </button>
            </div>

            {/* View Mode and Court Filter */}
            <div className="flex items-center gap-4">
              <select
                value={selectedQuadra}
                onChange={(e) => setSelectedQuadra(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="all">Todas as quadras</option>
                {quadras.map(quadra => (
                  <option key={quadra.id} value={quadra.id}>
                    {quadra.nome}
                  </option>
                ))}
              </select>

              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                {(['day', 'week', 'month'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      viewMode === mode
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {mode === 'day' ? 'Dia' : mode === 'week' ? 'Semana' : 'Mês'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Calendar View */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {viewMode === 'day' && (
            <DayView
              timeSlots={availableTimeSlots}
              agendamentos={filteredAgendamentos}
              selectedQuadra={selectedQuadra}
              quadras={quadras}
              onTimeSlotClick={handleTimeSlotClick}
              onEditBooking={(booking) => {
                setEditingBooking(booking);
                setShowBookingModal(true);
              }}
              onDeleteBooking={canDelete ? handleDeleteBooking : undefined}
              canEdit={canEdit}
            />
          )}
          
          {viewMode === 'week' && (
            <div className="p-8 text-center text-gray-500">
              <Calendar size={48} className="mx-auto mb-4" />
              <p>Vista semanal será implementada em breve</p>
            </div>
          )}
          
          {viewMode === 'month' && (
            <div className="p-8 text-center text-gray-500">
              <Calendar size={48} className="mx-auto mb-4" />
              <p>Vista mensal será implementada em breve</p>
            </div>
          )}
        </div>

        {/* Booking Modal */}
        {showBookingModal && (
          <BookingModal
            booking={editingBooking}
            timeSlot={selectedTimeSlot}
            selectedDate={selectedDate}
            selectedQuadra={selectedQuadra}
            quadras={quadras}
            onSave={handleSaveBooking}
            onClose={() => {
              setShowBookingModal(false);
              setEditingBooking(null);
              setSelectedTimeSlot(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

// Day View Component
interface DayViewProps {
  timeSlots: TimeSlot[];
  agendamentos: Agendamento[];
  selectedQuadra: string;
  quadras: Quadra[];
  onTimeSlotClick: (slot: TimeSlot) => void;
  onEditBooking: (booking: Agendamento) => void;
  onDeleteBooking?: (booking: Agendamento) => void;
  canEdit: boolean;
}

const DayView: React.FC<DayViewProps> = ({
  timeSlots,
  agendamentos,
  selectedQuadra,
  quadras,
  onTimeSlotClick,
  onEditBooking,
  onDeleteBooking,
  canEdit
}) => {
  const selectedQuadraData = quadras.find(q => q.id === selectedQuadra);

  return (
    <div className="overflow-y-auto max-h-[600px]">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100">
          {selectedQuadra === 'all' 
            ? 'Todas as quadras' 
            : selectedQuadraData?.nome || 'Quadra selecionada'
          }
        </h3>
        {selectedQuadraData && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Capacidade: {selectedQuadraData.capacidade} pessoas • 
            Status: {selectedQuadraData.status}
          </p>
        )}
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {timeSlots.map((slot, index) => {
          const booking = agendamentos.find(a => 
            slot.start >= a.horarioInicio && slot.start < a.horarioFim
          );

          return (
            <div
              key={index}
              className={`flex items-center p-4 transition-colors cursor-pointer ${
                slot.available
                  ? 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  : 'bg-blue-50 dark:bg-blue-900/20'
              }`}
              onClick={() => onTimeSlotClick(slot)}
            >
              {/* Time */}
              <div className="w-20 flex-shrink-0">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {slot.start}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {slot.end}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 ml-4">
                {booking ? (
                  <BookingSlot 
                    booking={booking}
                    quadra={selectedQuadraData}
                    onEdit={canEdit ? onEditBooking : undefined}
                    onDelete={onDeleteBooking}
                  />
                ) : (
                  <EmptySlot 
                    slot={slot}
                    quadra={selectedQuadraData}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Booking Slot Component
interface BookingSlotProps {
  booking: Agendamento;
  quadra?: Quadra;
  onEdit?: (booking: Agendamento) => void;
  onDelete?: (booking: Agendamento) => void;
}

const BookingSlot: React.FC<BookingSlotProps> = ({ booking, quadra, onEdit, onDelete }) => {
  const statusColors = {
    'agendado': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    'confirmado': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    'em-andamento': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
    'finalizado': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    'cancelado': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    'nao-compareceu': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
  };

  const typeIcons = {
    'aula': '📚',
    'jogo-livre': '🎮',
    'treino': '💪',
    'evento': '🏆'
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{typeIcons[booking.tipo]}</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {booking.participantes[0]?.nome || 'Agendamento'}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full ${statusColors[booking.status]}`}>
            {booking.status.replace('-', ' ')}
          </span>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Users size={14} />
            {booking.participantes.length} pessoas
          </div>
          <div className="flex items-center gap-1">
            <DollarSign size={14} />
            R$ {booking.valor.toFixed(2)}
          </div>
          {booking.metodoPagamento && (
            <div className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              {booking.metodoPagamento}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 ml-4">
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(booking);
            }}
            className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded"
            title="Editar"
          >
            <Edit size={16} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(booking);
            }}
            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded"
            title="Cancelar"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

// Empty Slot Component
interface EmptySlotProps {
  slot: TimeSlot;
  quadra?: Quadra;
}

const EmptySlot: React.FC<EmptySlotProps> = ({ slot, quadra }) => {
  return (
    <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
      <div className="flex items-center gap-2">
        <Plus size={16} />
        <span>Horário disponível</span>
      </div>
      {slot.price && slot.price > 0 && (
        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
          <DollarSign size={14} />
          <span className="font-medium">R$ {slot.price.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
};

// Booking Modal Component (placeholder)
const BookingModal: React.FC<{
  booking: Agendamento | null;
  timeSlot: TimeSlot | null;
  selectedDate: Date;
  selectedQuadra: string;
  quadras: Quadra[];
  onSave: (booking: Partial<Agendamento>) => void;
  onClose: () => void;
}> = ({ booking, timeSlot, selectedDate, selectedQuadra, quadras, onSave, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
        <h3 className="text-lg font-bold mb-4">
          {booking ? 'Editar Agendamento' : 'Novo Agendamento'}
        </h3>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Data:</strong> {selectedDate.toLocaleDateString('pt-BR')}
            </p>
            {timeSlot && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Horário:</strong> {timeSlot.start} - {timeSlot.end}
              </p>
            )}
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Quadra:</strong> {quadras.find(q => q.id === selectedQuadra)?.nome}
            </p>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400">
            Modal completo de agendamento será implementado aqui com formulário detalhado.
          </p>
        </div>
        
        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              toast.success('Funcionalidade em desenvolvimento');
              onClose();
            }}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingCalendarPage;