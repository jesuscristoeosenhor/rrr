import React, { useState, useCallback, useMemo } from 'react';
import { Plus, Edit, Trash2, MapPin, Clock, DollarSign, Settings, Eye, AlertCircle, CheckCircle, Wrench, Camera } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { Quadra, PrecoPorHorario } from '@/types';
import { useLocalStorage } from '@/hooks/useStorage';
import { generateId } from '@/utils/helpers';
import toast from 'react-hot-toast';

// Mock data for initial setup
const mockQuadras: Quadra[] = [
  {
    id: '1',
    numero: 1,
    nome: 'Quadra Principal',
    tipo: 'futevolei',
    unidadeId: '1',
    status: 'disponivel',
    capacidade: 8,
    preco: {
      '06:00': { valor: 80.00 },
      '07:00': { valor: 80.00 },
      '08:00': { valor: 80.00 },
      '09:00': { valor: 80.00 },
      '10:00': { valor: 80.00 },
      '11:00': { valor: 80.00 },
      '12:00': { valor: 100.00 },
      '13:00': { valor: 100.00 },
      '14:00': { valor: 100.00 },
      '15:00': { valor: 100.00 },
      '16:00': { valor: 100.00 },
      '17:00': { valor: 120.00 },
      '18:00': { valor: 120.00 },
      '19:00': { valor: 120.00 },
      '20:00': { valor: 120.00 },
      '21:00': { valor: 100.00 }
    },
    equipamentos: ['Rede oficial', 'Marcação completa', 'Iluminação LED', 'Som ambiente'],
    observacoes: 'Quadra premium com vista para o mar, ideal para competições.',
    imagens: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'
    ],
    dimensoes: {
      largura: 18,
      comprimento: 9
    },
    criadoEm: new Date('2024-01-15'),
    atualizadoEm: new Date('2024-01-15')
  },
  {
    id: '2',
    numero: 2,
    nome: 'Quadra Treino',
    tipo: 'futevolei',
    unidadeId: '1',
    status: 'disponivel',
    capacidade: 6,
    preco: {
      '06:00': { valor: 60.00 },
      '07:00': { valor: 60.00 },
      '08:00': { valor: 60.00 },
      '09:00': { valor: 60.00 },
      '10:00': { valor: 60.00 },
      '11:00': { valor: 60.00 },
      '12:00': { valor: 80.00 },
      '13:00': { valor: 80.00 },
      '14:00': { valor: 80.00 },
      '15:00': { valor: 80.00 },
      '16:00': { valor: 80.00 },
      '17:00': { valor: 100.00 },
      '18:00': { valor: 100.00 },
      '19:00': { valor: 100.00 },
      '20:00': { valor: 100.00 },
      '21:00': { valor: 80.00 }
    },
    equipamentos: ['Rede oficial', 'Marcação completa', 'Iluminação LED'],
    observacoes: 'Quadra ideal para treinos e aulas.',
    imagens: [
      'https://images.unsplash.com/photo-1593352216840-82d5ab6c4b33?w=400'
    ],
    dimensoes: {
      largura: 18,
      comprimento: 9
    },
    criadoEm: new Date('2024-01-15'),
    atualizadoEm: new Date('2024-01-15')
  },
  {
    id: '3',
    numero: 1,
    nome: 'Quadra Premium',
    tipo: 'futevolei',
    unidadeId: '2',
    status: 'manutencao',
    capacidade: 8,
    preco: {
      '06:00': { valor: 90.00 },
      '07:00': { valor: 90.00 },
      '08:00': { valor: 90.00 },
      '09:00': { valor: 90.00 },
      '10:00': { valor: 90.00 },
      '11:00': { valor: 90.00 },
      '12:00': { valor: 110.00 },
      '13:00': { valor: 110.00 },
      '14:00': { valor: 110.00 },
      '15:00': { valor: 110.00 },
      '16:00': { valor: 110.00 },
      '17:00': { valor: 130.00 },
      '18:00': { valor: 130.00 },
      '19:00': { valor: 130.00 },
      '20:00': { valor: 130.00 },
      '21:00': { valor: 110.00 }
    },
    equipamentos: ['Rede oficial', 'Marcação completa', 'Iluminação LED', 'Som ambiente', 'Arquibancada'],
    observacoes: 'Em manutenção - troca da areia prevista para esta semana.',
    imagens: [],
    dimensoes: {
      largura: 18,
      comprimento: 9
    },
    criadoEm: new Date('2024-02-01'),
    atualizadoEm: new Date('2024-02-01')
  }
];

const CourtsPage: React.FC = () => {
  const { addNotification } = useNotifications();
  const { hasPermission } = useAuth();
  const [quadras, setQuadras] = useLocalStorage<Quadra[]>('quadras', mockQuadras);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'disponivel' | 'manutencao' | 'indisponivel'>('all');
  const [filterType, setFilterType] = useState<'all' | 'futevolei' | 'volei' | 'beach-tennis' | 'futsal'>('all');
  const [filterUnit, setFilterUnit] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingCourt, setEditingCourt] = useState<Quadra | null>(null);
  const [viewingCourt, setViewingCourt] = useState<Quadra | null>(null);

  // Permissions
  const canCreate = hasPermission('quadras', 'criar');
  const canEdit = hasPermission('quadras', 'editar');
  const canDelete = hasPermission('quadras', 'deletar');

  // Get unique units for filter
  const units = useMemo(() => {
    const uniqueUnits = Array.from(new Set(quadras.map(q => q.unidadeId)));
    return uniqueUnits.map(id => ({
      id,
      nome: `Unidade ${id}` // In real app, would fetch unit name
    }));
  }, [quadras]);

  // Filtered courts
  const filteredCourts = useMemo(() => {
    return quadras.filter(court => {
      const matchesSearch = court.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           court.numero.toString().includes(searchTerm) ||
                           court.tipo.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || court.status === filterStatus;
      const matchesType = filterType === 'all' || court.tipo === filterType;
      const matchesUnit = filterUnit === 'all' || court.unidadeId === filterUnit;
      
      return matchesSearch && matchesStatus && matchesType && matchesUnit;
    });
  }, [quadras, searchTerm, filterStatus, filterType, filterUnit]);

  // Statistics
  const stats = useMemo(() => {
    const byStatus = quadras.reduce((acc, court) => {
      acc[court.status] = (acc[court.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avgPrice = quadras.length > 0 
      ? quadras.reduce((sum, court) => {
          const prices = Object.values(court.preco).map(p => p.valor);
          const courtAvg = prices.reduce((a, b) => a + b, 0) / prices.length;
          return sum + courtAvg;
        }, 0) / quadras.length
      : 0;

    return {
      total: quadras.length,
      disponivel: byStatus.disponivel || 0,
      ocupada: byStatus.ocupada || 0,
      manutencao: byStatus.manutencao || 0,
      indisponivel: byStatus.indisponivel || 0,
      avgPrice: avgPrice
    };
  }, [quadras]);

  const handleSave = useCallback((courtData: Partial<Quadra>) => {
    try {
      if (editingCourt) {
        // Update existing court
        const updatedCourts = quadras.map(court =>
          court.id === editingCourt.id
            ? { ...court, ...courtData, atualizadoEm: new Date() }
            : court
        );
        setQuadras(updatedCourts);
        addNotification({
          type: 'success',
          title: 'Quadra atualizada',
          message: `${courtData.nome} foi atualizada com sucesso.`
        });
      } else {
        // Create new court
        const newCourt: Quadra = {
          id: generateId(),
          ...courtData as Quadra,
          criadoEm: new Date(),
          atualizadoEm: new Date()
        };
        setQuadras([...quadras, newCourt]);
        addNotification({
          type: 'success',
          title: 'Quadra criada',
          message: `${newCourt.nome} foi criada com sucesso.`
        });
      }
      setShowModal(false);
      setEditingCourt(null);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao salvar quadra. Tente novamente.'
      });
    }
  }, [editingCourt, quadras, setQuadras, addNotification]);

  const handleDelete = useCallback((court: Quadra) => {
    if (window.confirm(`Tem certeza que deseja excluir a quadra "${court.nome}"?`)) {
      const updatedCourts = quadras.filter(c => c.id !== court.id);
      setQuadras(updatedCourts);
      addNotification({
        type: 'success',
        title: 'Quadra excluída',
        message: `${court.nome} foi excluída com sucesso.`
      });
    }
  }, [quadras, setQuadras, addNotification]);

  const handleChangeStatus = useCallback((court: Quadra, newStatus: Quadra['status']) => {
    const updatedCourts = quadras.map(c =>
      c.id === court.id 
        ? { ...c, status: newStatus, atualizadoEm: new Date() }
        : c
    );
    setQuadras(updatedCourts);
    
    const statusLabels = {
      'disponivel': 'disponível',
      'ocupada': 'ocupada',
      'manutencao': 'em manutenção',
      'indisponivel': 'indisponível'
    };
    
    addNotification({
      type: 'success',
      title: 'Status alterado',
      message: `${court.nome} agora está ${statusLabels[newStatus]}.`
    });
  }, [quadras, setQuadras, addNotification]);

  const getStatusIcon = (status: Quadra['status']) => {
    switch (status) {
      case 'disponivel': return <CheckCircle className="text-green-500" size={16} />;
      case 'ocupada': return <AlertCircle className="text-blue-500" size={16} />;
      case 'manutencao': return <Wrench className="text-orange-500" size={16} />;
      case 'indisponivel': return <AlertCircle className="text-red-500" size={16} />;
      default: return <AlertCircle className="text-gray-500" size={16} />;
    }
  };

  const getStatusColor = (status: Quadra['status']) => {
    switch (status) {
      case 'disponivel': return 'border-green-200 dark:border-green-700';
      case 'ocupada': return 'border-blue-200 dark:border-blue-700';
      case 'manutencao': return 'border-orange-200 dark:border-orange-700';
      case 'indisponivel': return 'border-red-200 dark:border-red-700';
      default: return 'border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
                🎾 Gestão de Quadras
                <span className="text-lg bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-3 py-1 rounded-full">
                  {stats.disponivel} disponíveis
                </span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gerencie todas as quadras do seu centro de treinamento
              </p>
            </div>
            
            {canCreate && (
              <button
                onClick={() => {
                  setEditingCourt(null);
                  setShowModal(true);
                }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Plus size={16} />
                Nova Quadra
              </button>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-blue-800 dark:text-blue-300">Total</div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <div className="text-2xl font-bold text-green-600">{stats.disponivel}</div>
            <div className="text-sm text-green-800 dark:text-green-300">Disponíveis</div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-2xl font-bold text-blue-600">{stats.ocupada}</div>
            <div className="text-sm text-blue-800 dark:text-blue-300">Ocupadas</div>
          </div>
          
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="text-2xl font-bold text-orange-600">{stats.manutencao}</div>
            <div className="text-sm text-orange-800 dark:text-orange-300">Manutenção</div>
          </div>
          
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
            <div className="text-2xl font-bold text-red-600">{stats.indisponivel}</div>
            <div className="text-sm text-red-800 dark:text-red-300">Indisponíveis</div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="text-2xl font-bold text-purple-600">R$ {stats.avgPrice.toFixed(0)}</div>
            <div className="text-sm text-purple-800 dark:text-purple-300">Preço Médio</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <input
                type="text"
                placeholder="Buscar quadras..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">Todos os status</option>
                <option value="disponivel">✅ Disponíveis</option>
                <option value="ocupada">🔵 Ocupadas</option>
                <option value="manutencao">🔧 Em manutenção</option>
                <option value="indisponivel">❌ Indisponíveis</option>
              </select>
            </div>
            
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">Todos os tipos</option>
                <option value="futevolei">🏐 Futevôlei</option>
                <option value="volei">🏐 Vôlei</option>
                <option value="beach-tennis">🎾 Beach Tennis</option>
                <option value="futsal">⚽ Futsal</option>
              </select>
            </div>
            
            <div>
              <select
                value={filterUnit}
                onChange={(e) => setFilterUnit(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">Todas as unidades</option>
                {units.map(unit => (
                  <option key={unit.id} value={unit.id}>
                    {unit.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Courts Grid */}
        {filteredCourts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
            <div className="text-6xl mb-4">🎾</div>
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
              {searchTerm ? 'Nenhuma quadra encontrada' : 'Nenhuma quadra cadastrada'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm 
                ? 'Tente ajustar os filtros de busca'
                : 'Comece criando sua primeira quadra'
              }
            </p>
            {canCreate && !searchTerm && (
              <button
                onClick={() => {
                  setEditingCourt(null);
                  setShowModal(true);
                }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors mx-auto"
              >
                <Plus size={16} />
                Criar Primeira Quadra
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourts.map(court => (
              <CourtCard
                key={court.id}
                court={court}
                onEdit={canEdit ? (court) => {
                  setEditingCourt(court);
                  setShowModal(true);
                } : undefined}
                onDelete={canDelete ? handleDelete : undefined}
                onChangeStatus={canEdit ? handleChangeStatus : undefined}
                onView={(court) => setViewingCourt(court)}
                getStatusIcon={getStatusIcon}
                getStatusColor={getStatusColor}
              />
            ))}
          </div>
        )}

        {/* Modals */}
        {showModal && (
          <CourtModal
            court={editingCourt}
            onSave={handleSave}
            onClose={() => {
              setShowModal(false);
              setEditingCourt(null);
            }}
          />
        )}

        {viewingCourt && (
          <CourtDetailModal
            court={viewingCourt}
            onClose={() => setViewingCourt(null)}
            getStatusIcon={getStatusIcon}
          />
        )}
      </div>
    </div>
  );
};

// Court Card Component
interface CourtCardProps {
  court: Quadra;
  onEdit?: (court: Quadra) => void;
  onDelete?: (court: Quadra) => void;
  onChangeStatus?: (court: Quadra, newStatus: Quadra['status']) => void;
  onView?: (court: Quadra) => void;
  getStatusIcon: (status: Quadra['status']) => JSX.Element;
  getStatusColor: (status: Quadra['status']) => string;
}

const CourtCard: React.FC<CourtCardProps> = ({ 
  court, 
  onEdit, 
  onDelete, 
  onChangeStatus, 
  onView,
  getStatusIcon,
  getStatusColor
}) => {
  const avgPrice = useMemo(() => {
    const prices = Object.values(court.preco).map(p => p.valor);
    return prices.reduce((a, b) => a + b, 0) / prices.length;
  }, [court.preco]);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 transition-all hover:shadow-md ${getStatusColor(court.status)}`}>
      {/* Image */}
      <div className="relative h-48 rounded-t-xl overflow-hidden">
        {court.imagens.length > 0 ? (
          <img
            src={court.imagens[0]}
            alt={court.nome}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <Camera className="text-gray-400" size={48} />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-white dark:bg-gray-800 px-2 py-1 rounded-full text-xs font-medium shadow-lg">
          {getStatusIcon(court.status)}
          <span className="capitalize">{court.status.replace('_', ' ')}</span>
        </div>

        {/* Court Number */}
        <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded-full text-sm font-bold">
          #{court.numero}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">
              {court.nome}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 capitalize">
              <MapPin size={14} />
              {court.tipo.replace('-', ' ')}
            </p>
          </div>
        </div>

        {/* Price and Capacity */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400 mb-1">
              <DollarSign size={14} />
              <span className="text-xs font-medium">Preço Médio</span>
            </div>
            <div className="text-lg font-bold text-gray-800 dark:text-gray-100">
              R$ {avgPrice.toFixed(0)}
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 mb-1">
              <Clock size={14} />
              <span className="text-xs font-medium">Capacidade</span>
            </div>
            <div className="text-lg font-bold text-gray-800 dark:text-gray-100">
              {court.capacidade} pessoas
            </div>
          </div>
        </div>

        {/* Equipment */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Equipamentos:</h4>
          <div className="flex flex-wrap gap-1">
            {court.equipamentos.slice(0, 3).map((equipment, index) => (
              <span key={index} className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 rounded-full">
                {equipment}
              </span>
            ))}
            {court.equipamentos.length > 3 && (
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded-full">
                +{court.equipamentos.length - 3} mais
              </span>
            )}
          </div>
        </div>

        {/* Dimensions */}
        {court.dimensoes && (
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            📏 {court.dimensoes.comprimento}m × {court.dimensoes.largura}m
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            {onView && (
              <button
                onClick={() => onView(court)}
                className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Ver detalhes"
              >
                <Eye size={16} />
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(court)}
                className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Editar"
              >
                <Edit size={16} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(court)}
                className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Excluir"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
          
          {onChangeStatus && (
            <div className="relative">
              <select
                value={court.status}
                onChange={(e) => onChangeStatus(court, e.target.value as Quadra['status'])}
                className="text-xs px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="disponivel">✅ Disponível</option>
                <option value="ocupada">🔵 Ocupada</option>
                <option value="manutencao">🔧 Manutenção</option>
                <option value="indisponivel">❌ Indisponível</option>
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Court Modal Component (placeholder)
const CourtModal: React.FC<{
  court: Quadra | null;
  onSave: (court: Partial<Quadra>) => void;
  onClose: () => void;
}> = ({ court, onSave, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
        <h3 className="text-lg font-bold mb-4">
          {court ? 'Editar Quadra' : 'Nova Quadra'}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Modal de criação/edição de quadra será implementado aqui.
        </p>
        <div className="flex gap-2">
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

// Court Detail Modal Component
const CourtDetailModal: React.FC<{
  court: Quadra;
  onClose: () => void;
  getStatusIcon: (status: Quadra['status']) => JSX.Element;
}> = ({ court, onClose, getStatusIcon }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold">Detalhes da Quadra</h3>
            {getStatusIcon(court.status)}
            <span className="capitalize text-sm px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
              {court.status.replace('_', ' ')}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <Plus className="rotate-45" size={20} />
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-lg mb-2">{court.nome}</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Número:</span>
                  <span className="ml-2 font-medium">#{court.numero}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Tipo:</span>
                  <span className="ml-2 font-medium capitalize">{court.tipo.replace('-', ' ')}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Capacidade:</span>
                  <span className="ml-2 font-medium">{court.capacidade} pessoas</span>
                </div>
                {court.dimensoes && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Dimensões:</span>
                    <span className="ml-2 font-medium">
                      {court.dimensoes.comprimento}m × {court.dimensoes.largura}m
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Equipment */}
            <div>
              <h5 className="font-medium mb-2">🛠️ Equipamentos</h5>
              <div className="flex flex-wrap gap-2">
                {court.equipamentos.map((equipment, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 rounded-full"
                  >
                    {equipment}
                  </span>
                ))}
              </div>
            </div>

            {/* Observations */}
            {court.observacoes && (
              <div>
                <h5 className="font-medium mb-2">📝 Observações</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  {court.observacoes}
                </p>
              </div>
            )}
          </div>

          {/* Pricing */}
          <div>
            <h5 className="font-medium mb-4">💰 Tabela de Preços por Horário</h5>
            <div className="grid grid-cols-2 gap-2 text-sm max-h-64 overflow-y-auto">
              {Object.entries(court.preco)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([horario, preco]) => (
                  <div
                    key={horario}
                    className={`flex justify-between items-center p-2 rounded ${
                      preco.promocional
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700'
                        : 'bg-gray-50 dark:bg-gray-700'
                    }`}
                  >
                    <span className="font-medium">{horario}</span>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-green-600 dark:text-green-400">
                        R$ {preco.valor.toFixed(2)}
                      </span>
                      {preco.promocional && (
                        <span className="text-xs text-green-600 dark:text-green-400">🏷️</span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Images */}
        {court.imagens.length > 0 && (
          <div className="mt-6">
            <h5 className="font-medium mb-4">📸 Fotos da Quadra</h5>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {court.imagens.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${court.nome} - foto ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourtsPage;