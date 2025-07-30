import React, { useState, useCallback, useMemo } from 'react';
import { 
  Plus, Edit, Trash2, Eye, EyeOff, Shield, User, Users, Mail, Phone, 
  MapPin, Calendar, Clock, Star, AlertCircle, CheckCircle, X, Crown,
  Key, Settings, Download, Filter, Search, MoreVertical
} from 'lucide-react';
import { useNotifications } from '@/contexts/EnhancedNotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { Usuario, Permission } from '@/types';
import { useLocalStorage } from '@/hooks/useStorage';
import { generateId } from '@/utils/helpers';
import { authService } from '@/services/authService';
import toast from 'react-hot-toast';

const UserManagementPage: React.FC = () => {
  const { addNotification } = useNotifications();
  const { user: currentUser, hasPermission } = useAuth();
  const [usuarios, setUsuarios] = useLocalStorage<Usuario[]>('system_users', []);
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'admin' | 'gestor' | 'professor' | 'aluno' | 'recepcionista'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'nome' | 'tipo' | 'criadoEm' | 'ultimoLogin'>('nome');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [viewingUser, setViewingUser] = useState<Usuario | null>(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Permissions
  const canCreate = hasPermission('usuarios', 'criar');
  const canEdit = hasPermission('usuarios', 'editar');
  const canDelete = hasPermission('usuarios', 'deletar');
  const canViewDetails = hasPermission('usuarios', 'ler');

  // Filtered and sorted users
  const filteredUsers = useMemo(() => {
    let filtered = usuarios.filter(usuario => {
      // Search filter
      const matchesSearch = !searchTerm || 
        usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (usuario.telefone && usuario.telefone.includes(searchTerm));

      // Type filter
      const matchesType = filterType === 'all' || usuario.tipo === filterType;

      // Status filter
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'active' && usuario.ativo) ||
        (filterStatus === 'inactive' && !usuario.ativo);

      return matchesSearch && matchesType && matchesStatus;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];

      if (sortBy === 'criadoEm' || sortBy === 'ultimoLogin') {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue?.toLowerCase() || '';
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [usuarios, searchTerm, filterType, filterStatus, sortBy, sortOrder]);

  // Statistics
  const stats = useMemo(() => {
    const typeCount = usuarios.reduce((acc, user) => {
      acc[user.tipo] = (acc[user.tipo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: usuarios.length,
      active: usuarios.filter(u => u.ativo).length,
      inactive: usuarios.filter(u => !u.ativo).length,
      ...typeCount
    };
  }, [usuarios]);

  // Handlers
  const handleSaveUser = useCallback(async (userData: Partial<Usuario>) => {
    try {
      if (editingUser) {
        // Update existing user
        const updatedUsers = usuarios.map(user =>
          user.id === editingUser.id
            ? { ...user, ...userData, atualizadoEm: new Date() }
            : user
        );
        setUsuarios(updatedUsers);
        
        addNotification({
          tipo: 'sistema',
          titulo: 'Usuário atualizado',
          mensagem: `${userData.nome} foi atualizado com sucesso.`,
          prioridade: 'media',
          canais: ['app']
        });
      } else {
        // Create new user
        const result = await authService.register({
          nome: userData.nome!,
          email: userData.email!,
          senha: userData.senha || 'senha123', // Default password
          tipo: userData.tipo!,
          unidade: userData.unidade,
          telefone: userData.telefone
        });

        if (result.success && result.data) {
          setUsuarios(prev => [...prev, result.data!]);
          
          addNotification({
            tipo: 'sistema',
            titulo: 'Usuário criado',
            mensagem: `${result.data.nome} foi criado com sucesso.`,
            prioridade: 'media',
            canais: ['app']
          });
        } else {
          throw new Error(result.error || 'Erro ao criar usuário');
        }
      }
      
      setShowModal(false);
      setEditingUser(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao salvar usuário';
      addNotification({
        tipo: 'sistema',
        titulo: 'Erro',
        mensagem: message,
        prioridade: 'alta',
        canais: ['app']
      });
    }
  }, [editingUser, usuarios, setUsuarios, addNotification]);

  const handleDeleteUser = useCallback((user: Usuario) => {
    if (user.id === currentUser?.id) {
      toast.error('Você não pode excluir sua própria conta');
      return;
    }

    if (window.confirm(`Tem certeza que deseja excluir o usuário "${user.nome}"?`)) {
      const updatedUsers = usuarios.filter(u => u.id !== user.id);
      setUsuarios(updatedUsers);
      
      addNotification({
        tipo: 'sistema',
        titulo: 'Usuário excluído',
        mensagem: `${user.nome} foi excluído do sistema.`,
        prioridade: 'media',
        canais: ['app']
      });
    }
  }, [currentUser, usuarios, setUsuarios, addNotification]);

  const handleToggleStatus = useCallback((user: Usuario) => {
    if (user.id === currentUser?.id) {
      toast.error('Você não pode desativar sua própria conta');
      return;
    }

    const updatedUsers = usuarios.map(u =>
      u.id === user.id 
        ? { ...u, ativo: !u.ativo, atualizadoEm: new Date() }
        : u
    );
    setUsuarios(updatedUsers);

    addNotification({
      tipo: 'sistema',
      titulo: `Usuário ${user.ativo ? 'desativado' : 'ativado'}`,
      mensagem: `${user.nome} foi ${user.ativo ? 'desativado' : 'ativado'} no sistema.`,
      prioridade: 'media',
      canais: ['app']
    });
  }, [currentUser, usuarios, setUsuarios, addNotification]);

  const handleResetPassword = useCallback((user: Usuario) => {
    if (window.confirm(`Tem certeza que deseja redefinir a senha de "${user.nome}" para "senha123"?`)) {
      // In a real app, this would make an API call
      toast.success(`Senha de ${user.nome} foi redefinida para "senha123"`);
      
      addNotification({
        tipo: 'sistema',
        titulo: 'Senha redefinida',
        mensagem: `A senha de ${user.nome} foi redefinida.`,
        prioridade: 'media',
        canais: ['app']
      });
    }
  }, [addNotification]);

  const handleExportUsers = useCallback(() => {
    const csvData = filteredUsers.map(user => ({
      Nome: user.nome,
      Email: user.email,
      Tipo: user.tipo,
      Telefone: user.telefone || '',
      Unidade: user.unidade || '',
      Status: user.ativo ? 'Ativo' : 'Inativo',
      'Data de Criação': new Date(user.criadoEm).toLocaleDateString('pt-BR'),
      'Último Login': user.ultimoLogin ? new Date(user.ultimoLogin).toLocaleDateString('pt-BR') : 'Nunca'
    }));

    // Simple CSV export (in a real app, use a proper CSV library)
    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Lista de usuários exportada com sucesso');
  }, [filteredUsers]);

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
                👥 Gestão de Usuários
                <span className="text-lg bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-3 py-1 rounded-full">
                  {stats.active} ativos
                </span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gerencie todos os usuários do sistema
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportUsers}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
              >
                <Download size={16} />
                Exportar
              </button>
              
              {canCreate && (
                <button
                  onClick={() => {
                    setEditingUser(null);
                    setShowModal(true);
                  }}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Plus size={16} />
                  Novo Usuário
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-blue-800 dark:text-blue-300">Total</div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-green-800 dark:text-green-300">Ativos</div>
          </div>
          
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
            <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
            <div className="text-sm text-red-800 dark:text-red-300">Inativos</div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="text-2xl font-bold text-purple-600">{stats.admin || 0}</div>
            <div className="text-sm text-purple-800 dark:text-purple-300">Admins</div>
          </div>
          
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="text-2xl font-bold text-orange-600">{stats.professor || 0}</div>
            <div className="text-sm text-orange-800 dark:text-orange-300">Professores</div>
          </div>
          
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
            <div className="text-2xl font-bold text-indigo-600">{stats.aluno || 0}</div>
            <div className="text-sm text-indigo-800 dark:text-indigo-300">Alunos</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Buscar usuários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Todos os tipos</option>
              <option value="admin">👑 Administradores</option>
              <option value="gestor">🏢 Gestores</option>
              <option value="professor">📚 Professores</option>
              <option value="aluno">🎓 Alunos</option>
              <option value="recepcionista">📞 Recepcionistas</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Todos os status</option>
              <option value="active">✅ Ativos</option>
              <option value="inactive">❌ Inativos</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="nome">Nome</option>
              <option value="tipo">Tipo</option>
              <option value="criadoEm">Data de Criação</option>
              <option value="ultimoLogin">Último Login</option>
            </select>

            {/* Sort Order */}
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              {sortOrder === 'asc' ? '↑ A-Z' : '↓ Z-A'}
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece criando o primeiro usuário'
                }
              </p>
              {canCreate && !searchTerm && (
                <button
                  onClick={() => {
                    setEditingUser(null);
                    setShowModal(true);
                  }}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors mx-auto"
                >
                  <Plus size={16} />
                  Criar Primeiro Usuário
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-200">
                      Usuário
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-200">
                      Tipo
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-200">
                      Contato
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-200">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-200">
                      Último Login
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-200">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUsers.map(usuario => (
                    <UserTableRow
                      key={usuario.id}
                      user={usuario}
                      isCurrentUser={usuario.id === currentUser?.id}
                      onEdit={canEdit ? (user) => {
                        setEditingUser(user);
                        setShowModal(true);
                      } : undefined}
                      onDelete={canDelete ? handleDeleteUser : undefined}
                      onToggleStatus={canEdit ? handleToggleStatus : undefined}
                      onResetPassword={canEdit ? handleResetPassword : undefined}
                      onViewDetails={canViewDetails ? (user) => setViewingUser(user) : undefined}
                      onManagePermissions={canEdit ? (user) => {
                        setSelectedUserId(user.id);
                        setShowPermissionsModal(true);
                      } : undefined}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modals */}
        {showModal && (
          <UserModal
            user={editingUser}
            onSave={handleSaveUser}
            onClose={() => {
              setShowModal(false);
              setEditingUser(null);
            }}
          />
        )}

        {viewingUser && (
          <UserDetailModal
            user={viewingUser}
            onClose={() => setViewingUser(null)}
          />
        )}

        {showPermissionsModal && selectedUserId && (
          <PermissionsModal
            userId={selectedUserId}
            onClose={() => {
              setShowPermissionsModal(false);
              setSelectedUserId(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

// User Table Row Component
interface UserTableRowProps {
  user: Usuario;
  isCurrentUser: boolean;
  onEdit?: (user: Usuario) => void;
  onDelete?: (user: Usuario) => void;
  onToggleStatus?: (user: Usuario) => void;
  onResetPassword?: (user: Usuario) => void;
  onViewDetails?: (user: Usuario) => void;
  onManagePermissions?: (user: Usuario) => void;
}

const UserTableRow: React.FC<UserTableRowProps> = ({
  user,
  isCurrentUser,
  onEdit,
  onDelete,
  onToggleStatus,
  onResetPassword,
  onViewDetails,
  onManagePermissions
}) => {
  const [showActions, setShowActions] = useState(false);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'admin': return <Crown className="text-purple-600" size={16} />;
      case 'gestor': return <Shield className="text-blue-600" size={16} />;
      case 'professor': return <User className="text-green-600" size={16} />;
      case 'aluno': return <Star className="text-yellow-600" size={16} />;
      case 'recepcionista': return <Phone className="text-gray-600" size={16} />;
      default: return <User className="text-gray-600" size={16} />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      admin: 'Administrador',
      gestor: 'Gestor',
      professor: 'Professor',
      aluno: 'Aluno',
      recepcionista: 'Recepcionista'
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            {user.avatar ? (
              <img src={user.avatar} alt={user.nome} className="w-10 h-10 rounded-full" />
            ) : (
              <User className="text-gray-500" size={20} />
            )}
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
              {user.nome}
              {isCurrentUser && (
                <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 px-2 py-1 rounded-full">
                  Você
                </span>
              )}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {user.email}
            </div>
          </div>
        </div>
      </td>
      
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          {getTypeIcon(user.tipo)}
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {getTypeLabel(user.tipo)}
          </span>
        </div>
        {user.unidade && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {user.unidade}
          </div>
        )}
      </td>
      
      <td className="py-4 px-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Mail size={14} />
            {user.email}
          </div>
          {user.telefone && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Phone size={14} />
              {user.telefone}
            </div>
          )}
        </div>
      </td>
      
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          {user.ativo ? (
            <CheckCircle className="text-green-500" size={16} />
          ) : (
            <AlertCircle className="text-red-500" size={16} />
          )}
          <span className={`text-sm font-medium ${
            user.ativo 
              ? 'text-green-700 dark:text-green-400'
              : 'text-red-700 dark:text-red-400'
          }`}>
            {user.ativo ? 'Ativo' : 'Inativo'}
          </span>
        </div>
      </td>
      
      <td className="py-4 px-4">
        {user.ultimoLogin ? (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {new Date(user.ultimoLogin).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        ) : (
          <span className="text-sm text-gray-400">Nunca</span>
        )}
      </td>
      
      <td className="py-4 px-4 text-right">
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
          >
            <MoreVertical size={16} />
          </button>
          
          {showActions && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowActions(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                {onViewDetails && (
                  <button
                    onClick={() => {
                      onViewDetails(user);
                      setShowActions(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Eye size={14} />
                    Ver Detalhes
                  </button>
                )}
                
                {onEdit && (
                  <button
                    onClick={() => {
                      onEdit(user);
                      setShowActions(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Edit size={14} />
                    Editar
                  </button>
                )}
                
                {onManagePermissions && (
                  <button
                    onClick={() => {
                      onManagePermissions(user);
                      setShowActions(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Shield size={14} />
                    Permissões
                  </button>
                )}
                
                {onResetPassword && !isCurrentUser && (
                  <button
                    onClick={() => {
                      onResetPassword(user);
                      setShowActions(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Key size={14} />
                    Redefinir Senha
                  </button>
                )}
                
                {onToggleStatus && !isCurrentUser && (
                  <button
                    onClick={() => {
                      onToggleStatus(user);
                      setShowActions(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    {user.ativo ? <EyeOff size={14} /> : <Eye size={14} />}
                    {user.ativo ? 'Desativar' : 'Ativar'}
                  </button>
                )}
                
                {onDelete && !isCurrentUser && (
                  <button
                    onClick={() => {
                      onDelete(user);
                      setShowActions(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600 dark:text-red-400"
                  >
                    <Trash2 size={14} />
                    Excluir
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

// User Modal Component (placeholder - would be implemented in detail)
const UserModal: React.FC<{
  user: Usuario | null;
  onSave: (user: Partial<Usuario>) => void;
  onClose: () => void;
}> = ({ user, onSave, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
        <h3 className="text-lg font-bold mb-4">
          {user ? 'Editar Usuário' : 'Novo Usuário'}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Modal completo de usuário será implementado aqui.
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

// User Detail Modal Component (placeholder)
const UserDetailModal: React.FC<{
  user: Usuario;
  onClose: () => void;
}> = ({ user, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Detalhes do Usuário</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              {user.avatar ? (
                <img src={user.avatar} alt={user.nome} className="w-16 h-16 rounded-full" />
              ) : (
                <User className="text-gray-500" size={32} />
              )}
            </div>
            <div>
              <h4 className="text-xl font-semibold">{user.nome}</h4>
              <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium mb-2">Informações Gerais</h5>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Tipo:</span>
                  <span className="ml-2 font-medium">{user.tipo}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className={`ml-2 font-medium ${user.ativo ? 'text-green-600' : 'text-red-600'}`}>
                    {user.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Telefone:</span>
                  <span className="ml-2 font-medium">{user.telefone || 'Não informado'}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Unidade:</span>
                  <span className="ml-2 font-medium">{user.unidade || 'Não definida'}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h5 className="font-medium mb-2">Atividade</h5>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Criado em:</span>
                  <span className="ml-2 font-medium">
                    {new Date(user.criadoEm).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Último login:</span>
                  <span className="ml-2 font-medium">
                    {user.ultimoLogin 
                      ? new Date(user.ultimoLogin).toLocaleDateString('pt-BR')
                      : 'Nunca'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Permissions Modal Component (placeholder)
const PermissionsModal: React.FC<{
  userId: string;
  onClose: () => void;
}> = ({ userId, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Gerenciar Permissões</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Sistema de permissões granulares será implementado aqui.
        </p>
        
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage;