import React, { useState, useCallback, useMemo } from 'react';
import { Plus, Edit, Trash2, MapPin, Phone, Mail, Clock, Camera, Settings, Eye, Users } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { Unidade, Endereco, HorarioFuncionamento } from '@/types';
import { useLocalStorage } from '@/hooks/useStorage';
import { generateId } from '@/utils/helpers';
import toast from 'react-hot-toast';

// Mock data for initial setup
const mockUnidades: Unidade[] = [
  {
    id: '1',
    nome: 'CT Copacabana',
    endereco: {
      rua: 'Av. Atlântica',
      numero: '1000',
      bairro: 'Copacabana',
      cidade: 'Rio de Janeiro',
      estado: 'RJ',
      cep: '22021-001',
      coordenadas: { lat: -22.9711, lng: -43.1822 }
    },
    telefone: '(21) 99999-1234',
    email: 'copacabana@futevolei.com',
    responsavel: 'Carlos Silva',
    horarioFuncionamento: {
      segunda: { inicio: '06:00', fim: '22:00' },
      terca: { inicio: '06:00', fim: '22:00' },
      quarta: { inicio: '06:00', fim: '22:00' },
      quinta: { inicio: '06:00', fim: '22:00' },
      sexta: { inicio: '06:00', fim: '22:00' },
      sabado: { inicio: '08:00', fim: '20:00' },
      domingo: { inicio: '08:00', fim: '18:00' }
    },
    quadras: [],
    imagens: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'
    ],
    descricao: 'Centro de treinamento premium na orla de Copacabana, com vista para o mar e estrutura completa.',
    ativo: true,
    configuracoes: {
      permiteAgendamentoOnline: true,
      antecedenciaMinima: 2,
      antecedenciaMaxima: 30,
      cancelamentoAte: 4,
      valorTaxaCancelamento: 10.00,
      permiteMultiplosJogos: true
    },
    criadoEm: new Date('2024-01-15'),
    atualizadoEm: new Date('2024-01-15')
  },
  {
    id: '2',
    nome: 'CT Ipanema',
    endereco: {
      rua: 'Rua Visconde de Pirajá',
      numero: '500',
      bairro: 'Ipanema',
      cidade: 'Rio de Janeiro',
      estado: 'RJ',
      cep: '22410-000',
      coordenadas: { lat: -22.9843, lng: -43.1964 }
    },
    telefone: '(21) 99999-5678',
    email: 'ipanema@futevolei.com',
    responsavel: 'Ana Santos',
    horarioFuncionamento: {
      segunda: { inicio: '06:00', fim: '22:00' },
      terca: { inicio: '06:00', fim: '22:00' },
      quarta: { inicio: '06:00', fim: '22:00' },
      quinta: { inicio: '06:00', fim: '22:00' },
      sexta: { inicio: '06:00', fim: '22:00' },
      sabado: { inicio: '08:00', fim: '20:00' },
      domingo: { fechado: true, inicio: '', fim: '' }
    },
    quadras: [],
    imagens: [
      'https://images.unsplash.com/photo-1593352216840-82d5ab6c4b33?w=400'
    ],
    descricao: 'Unidade moderna no coração de Ipanema, ideal para profissionais e atletas.',
    ativo: true,
    configuracoes: {
      permiteAgendamentoOnline: true,
      antecedenciaMinima: 1,
      antecedenciaMaxima: 15,
      cancelamentoAte: 2,
      valorTaxaCancelamento: 5.00,
      permiteMultiplosJogos: false
    },
    criadoEm: new Date('2024-02-01'),
    atualizadoEm: new Date('2024-02-01')
  }
];

const UnitsPage: React.FC = () => {
  const { addNotification } = useNotifications();
  const { hasPermission } = useAuth();
  const [unidades, setUnidades] = useLocalStorage<Unidade[]>('unidades', mockUnidades);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unidade | null>(null);
  const [viewingUnit, setViewingUnit] = useState<Unidade | null>(null);

  // Permissions
  const canCreate = hasPermission('unidades', 'criar');
  const canEdit = hasPermission('unidades', 'editar');
  const canDelete = hasPermission('unidades', 'deletar');

  // Filtered units
  const filteredUnits = useMemo(() => {
    return unidades.filter(unit => {
      const matchesSearch = unit.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           unit.endereco.cidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           unit.responsavel.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'active' && unit.ativo) ||
                           (filterStatus === 'inactive' && !unit.ativo);
      
      return matchesSearch && matchesStatus;
    });
  }, [unidades, searchTerm, filterStatus]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: unidades.length,
      active: unidades.filter(u => u.ativo).length,
      inactive: unidades.filter(u => !u.ativo).length,
      withOnlineBooking: unidades.filter(u => u.configuracoes.permiteAgendamentoOnline).length
    };
  }, [unidades]);

  const handleSave = useCallback((unitData: Partial<Unidade>) => {
    try {
      if (editingUnit) {
        // Update existing unit
        const updatedUnits = unidades.map(unit =>
          unit.id === editingUnit.id
            ? { ...unit, ...unitData, atualizadoEm: new Date() }
            : unit
        );
        setUnidades(updatedUnits);
        addNotification({
          type: 'success',
          title: 'Unidade atualizada',
          message: `${unitData.nome} foi atualizada com sucesso.`
        });
      } else {
        // Create new unit
        const newUnit: Unidade = {
          id: generateId(),
          ...unitData as Unidade,
          criadoEm: new Date(),
          atualizadoEm: new Date()
        };
        setUnidades([...unidades, newUnit]);
        addNotification({
          type: 'success',
          title: 'Unidade criada',
          message: `${newUnit.nome} foi criada com sucesso.`
        });
      }
      setShowModal(false);
      setEditingUnit(null);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao salvar unidade. Tente novamente.'
      });
    }
  }, [editingUnit, unidades, setUnidades, addNotification]);

  const handleDelete = useCallback((unit: Unidade) => {
    if (window.confirm(`Tem certeza que deseja excluir a unidade "${unit.nome}"?`)) {
      const updatedUnits = unidades.filter(u => u.id !== unit.id);
      setUnidades(updatedUnits);
      addNotification({
        type: 'success',
        title: 'Unidade excluída',
        message: `${unit.nome} foi excluída com sucesso.`
      });
    }
  }, [unidades, setUnidades, addNotification]);

  const handleToggleStatus = useCallback((unit: Unidade) => {
    const updatedUnits = unidades.map(u =>
      u.id === unit.id 
        ? { ...u, ativo: !u.ativo, atualizadoEm: new Date() }
        : u
    );
    setUnidades(updatedUnits);
    addNotification({
      type: 'success',
      title: `Unidade ${unit.ativo ? 'desativada' : 'ativada'}`,
      message: `${unit.nome} foi ${unit.ativo ? 'desativada' : 'ativada'} com sucesso.`
    });
  }, [unidades, setUnidades, addNotification]);

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
                🏢 Gestão de Unidades
                <span className="text-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full">
                  {stats.active} ativas
                </span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gerencie todas as unidades do seu centro de treinamento
              </p>
            </div>
            
            {canCreate && (
              <button
                onClick={() => {
                  setEditingUnit(null);
                  setShowModal(true);
                }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Plus size={16} />
                Nova Unidade
              </button>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-blue-800 dark:text-blue-300">Total de Unidades</div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-green-800 dark:text-green-300">Unidades Ativas</div>
          </div>
          
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
            <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
            <div className="text-sm text-red-800 dark:text-red-300">Unidades Inativas</div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="text-2xl font-bold text-purple-600">{stats.withOnlineBooking}</div>
            <div className="text-sm text-purple-800 dark:text-purple-300">Com Agendamento Online</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar por nome, cidade ou responsável..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            
            <div className="flex gap-2">
              {[
                { id: 'all', label: 'Todas', count: stats.total },
                { id: 'active', label: 'Ativas', count: stats.active },
                { id: 'inactive', label: 'Inativas', count: stats.inactive }
              ].map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setFilterStatus(filter.id as any)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === filter.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Units Grid */}
        {filteredUnits.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
            <div className="text-6xl mb-4">🏢</div>
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
              {searchTerm ? 'Nenhuma unidade encontrada' : 'Nenhuma unidade cadastrada'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm 
                ? 'Tente ajustar os filtros de busca'
                : 'Comece criando sua primeira unidade'
              }
            </p>
            {canCreate && !searchTerm && (
              <button
                onClick={() => {
                  setEditingUnit(null);
                  setShowModal(true);
                }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors mx-auto"
              >
                <Plus size={16} />
                Criar Primeira Unidade
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUnits.map(unit => (
              <UnitCard
                key={unit.id}
                unit={unit}
                onEdit={canEdit ? (unit) => {
                  setEditingUnit(unit);
                  setShowModal(true);
                } : undefined}
                onDelete={canDelete ? handleDelete : undefined}
                onToggleStatus={canEdit ? handleToggleStatus : undefined}
                onView={(unit) => setViewingUnit(unit)}
              />
            ))}
          </div>
        )}

        {/* Modals */}
        {showModal && (
          <UnitModal
            unit={editingUnit}
            onSave={handleSave}
            onClose={() => {
              setShowModal(false);
              setEditingUnit(null);
            }}
          />
        )}

        {viewingUnit && (
          <UnitDetailModal
            unit={viewingUnit}
            onClose={() => setViewingUnit(null)}
          />
        )}
      </div>
    </div>
  );
};

// Unit Card Component
interface UnitCardProps {
  unit: Unidade;
  onEdit?: (unit: Unidade) => void;
  onDelete?: (unit: Unidade) => void;
  onToggleStatus?: (unit: Unidade) => void;
  onView?: (unit: Unidade) => void;
}

const UnitCard: React.FC<UnitCardProps> = ({ 
  unit, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  onView 
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 transition-all hover:shadow-md ${
      unit.ativo 
        ? 'border-green-200 dark:border-green-700' 
        : 'border-red-200 dark:border-red-700'
    }`}>
      {/* Image */}
      <div className="relative h-48 rounded-t-xl overflow-hidden">
        {unit.imagens.length > 0 ? (
          <img
            src={unit.imagens[0]}
            alt={unit.nome}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <Camera className="text-gray-400" size={48} />
          </div>
        )}
        
        {/* Status Badge */}
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
          unit.ativo
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        }`}>
          {unit.ativo ? '✅ Ativa' : '❌ Inativa'}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">
              {unit.nome}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <MapPin size={14} />
              {unit.endereco.cidade}, {unit.endereco.estado}
            </p>
          </div>
        </div>

        {/* Description */}
        {unit.descricao && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
            {unit.descricao}
          </p>
        )}

        {/* Contact Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Phone size={14} />
            {unit.telefone}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Mail size={14} />
            {unit.email}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Users size={14} />
            Responsável: {unit.responsavel}
          </div>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-2 mb-4">
          {unit.configuracoes.permiteAgendamentoOnline && (
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 rounded-full">
              📱 Agendamento Online
            </span>
          )}
          {unit.quadras.length > 0 && (
            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 rounded-full">
              🎾 {unit.quadras.length} Quadras
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            {onView && (
              <button
                onClick={() => onView(unit)}
                className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Ver detalhes"
              >
                <Eye size={16} />
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(unit)}
                className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Editar"
              >
                <Edit size={16} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(unit)}
                className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Excluir"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
          
          {onToggleStatus && (
            <button
              onClick={() => onToggleStatus(unit)}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                unit.ativo
                  ? 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400'
                  : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400'
              }`}
            >
              {unit.ativo ? 'Desativar' : 'Ativar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Unit Modal Component (placeholder - would be implemented separately)
const UnitModal: React.FC<{
  unit: Unidade | null;
  onSave: (unit: Partial<Unidade>) => void;
  onClose: () => void;
}> = ({ unit, onSave, onClose }) => {
  // This would be a full form modal for creating/editing units
  // For now, just a placeholder
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
        <h3 className="text-lg font-bold mb-4">
          {unit ? 'Editar Unidade' : 'Nova Unidade'}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Modal de criação/edição de unidade será implementado aqui.
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
              // Mock save
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

// Unit Detail Modal Component (placeholder)
const UnitDetailModal: React.FC<{
  unit: Unidade;
  onClose: () => void;
}> = ({ unit, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Detalhes da Unidade</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <Plus className="rotate-45" size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-lg">{unit.nome}</h4>
            <p className="text-gray-600 dark:text-gray-400">{unit.descricao}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium mb-2">📍 Endereço</h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {unit.endereco.rua}, {unit.endereco.numero}<br />
                {unit.endereco.bairro}<br />
                {unit.endereco.cidade}, {unit.endereco.estado}<br />
                CEP: {unit.endereco.cep}
              </p>
            </div>
            
            <div>
              <h5 className="font-medium mb-2">📞 Contato</h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Telefone:</strong> {unit.telefone}<br />
                <strong>Email:</strong> {unit.email}<br />
                <strong>Responsável:</strong> {unit.responsavel}
              </p>
            </div>
          </div>
          
          <div>
            <h5 className="font-medium mb-2">⏰ Horário de Funcionamento</h5>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(unit.horarioFuncionamento).map(([dia, horario]) => (
                <div key={dia} className="flex justify-between">
                  <span className="capitalize">{dia}:</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {horario.fechado ? 'Fechado' : `${horario.inicio} - ${horario.fim}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitsPage;