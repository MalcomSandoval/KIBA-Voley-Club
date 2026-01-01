import React, { useState } from 'react';
import { Users, CreditCard, Users as Users2, Home, Plus, Search, CreditCard as Edit, Trash2, Wallet as Volleyball, Phone, Mail, Calendar, DollarSign, CheckCircle, XCircle, X, Save, LogOut, Hash } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useSupabaseData } from './hooks/useSupabaseData';
import Auth from './components/Auth';
import PlayerForm from './components/PlayerForm';
import PaymentForm from './components/PaymentForm';
import GroupForm from './components/GroupForm';

type Section = 'dashboard' | 'players' | 'payments' | 'groups';
type FormType = 'player' | 'payment' | 'group' | null;

function App() {
  const { user, loading: authLoading, signOut } = useAuth();
  const {
    players,
    payments,
    groups,
    loading: dataLoading,
    createGroup,
    updateGroup,
    deleteGroup,
    createPlayer,
    updatePlayer,
    deletePlayer,
    createPayment,
    updatePayment,
    deletePayment,
    togglePaymentStatus
  } = useSupabaseData(user?.id);

  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState<FormType>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [operationLoading, setOperationLoading] = useState(false);

  // Form states
  const [playerForm, setPlayerForm] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    group_id: '',
    birth_date: '',
    emergency_contact: '',
    join_date: new Date().toISOString().split('T')[0],
    jersey_number: ''
  });

  const [paymentForm, setPaymentForm] = useState({
    player_id: '',
    amount: 45,
    month: '',
    year: new Date().getFullYear(),
    status: 'pending' as 'paid' | 'pending',
    due_date: ''
  });

  const [groupForm, setGroupForm] = useState({
    name: '',
    category: '',
    schedule: '',
    coach: '',
    max_players: 12
  });

  const positions = ['Atacante/Rematador', 'Líbero', 'Central/Bloqueador', 'Colocador/Armador', 'Opuesto', 'Receptor/Pasador'];
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const categories = ['Sub-12', 'Sub-14', 'Sub-16', 'Sub-18', 'Juvenil', 'Adultos', 'Veteranos'];

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'players', label: 'Jugadores', icon: Users },
    { id: 'payments', label: 'Pagos', icon: CreditCard },
    { id: 'groups', label: 'Grupos', icon: Users2 }
  ];

  // Helper functions
  const resetForms = () => {
    setPlayerForm({
      name: '',
      email: '',
      phone: '',
      position: '',
      group_id: '',
      birth_date: '',
      emergency_contact: '',
      join_date: new Date().toISOString().split('T')[0],
      jersey_number: ''
    });
    setPaymentForm({
      player_id: '',
      amount: 45,
      month: '',
      year: new Date().getFullYear(),
      status: 'pending',
      due_date: ''
    });
    setGroupForm({
      name: '',
      category: '',
      schedule: '',
      coach: '',
      max_players: 12
    });
    setEditingItem(null);
  };

  const closeForm = () => {
    setShowForm(null);
    resetForms();
  };

  // Input handlers to prevent re-rendering issues
  const handlePlayerFormChange = (field: string, value: string | number) => {
    setPlayerForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePaymentFormChange = (field: string, value: string | number) => {
    setPaymentForm(prev => ({ ...prev, [field]: value }));
  };

  const handleGroupFormChange = (field: string, value: string | number) => {
    setGroupForm(prev => ({ ...prev, [field]: value }));
  };
  // CRUD Operations for Players
  const handleSavePlayer = async () => {
    if (!playerForm.name || !playerForm.email || !playerForm.phone || !playerForm.position || !playerForm.jersey_number) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      setOperationLoading(true);
      if (editingItem) {
        await updatePlayer(editingItem.id, playerForm);
      } else {
        await createPlayer(playerForm);
      }
      closeForm();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleEditPlayer = (player: any) => {
    setPlayerForm({
      name: player.name,
      email: player.email,
      phone: player.phone,
      position: player.position,
      group_id: player.group_id || '',
      birth_date: player.birth_date || '',
      emergency_contact: player.emergency_contact || '',
      join_date: player.join_date || new Date().toISOString().split('T')[0],
      jersey_number: player.jersey_number || ''
    });
    setEditingItem(player);
    setShowForm('player');
  };

  const handleDeletePlayer = async (playerId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este jugador?')) {
      try {
        setOperationLoading(true);
        await deletePlayer(playerId);
      } catch (error: any) {
        alert(error.message);
      } finally {
        setOperationLoading(false);
      }
    }
  };

  // CRUD Operations for Payments
  const handleSavePayment = async () => {
    if (!paymentForm.player_id || !paymentForm.month || !paymentForm.due_date) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      setOperationLoading(true);
      if (editingItem) {
        await updatePayment(editingItem.id, paymentForm);
      } else {
        await createPayment(paymentForm);
      }
      closeForm();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleEditPayment = (payment: any) => {
    setPaymentForm({
      player_id: payment.player_id,
      amount: payment.amount,
      month: payment.month,
      year: payment.year,
      status: payment.status,
      due_date: payment.due_date
    });
    setEditingItem(payment);
    setShowForm('payment');
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este pago?')) {
      try {
        setOperationLoading(true);
        await deletePayment(paymentId);
      } catch (error: any) {
        alert(error.message);
      } finally {
        setOperationLoading(false);
      }
    }
  };

  const handleTogglePaymentStatus = async (paymentId: string) => {
    try {
      setOperationLoading(true);
      await togglePaymentStatus(paymentId);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setOperationLoading(false);
    }
  };

  // CRUD Operations for Groups
  const handleSaveGroup = async () => {
    if (!groupForm.name || !groupForm.category || !groupForm.coach) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      setOperationLoading(true);
      if (editingItem) {
        await updateGroup(editingItem.id, groupForm);
      } else {
        await createGroup(groupForm);
      }
      closeForm();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleEditGroup = (group: any) => {
    setGroupForm({
      name: group.name,
      category: group.category,
      schedule: group.schedule,
      coach: group.coach,
      max_players: group.max_players
    });
    setEditingItem(group);
    setShowForm('group');
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      setOperationLoading(true);
      await deleteGroup(groupId);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setOperationLoading(false);
    }
  };

  // Filter functions
  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.jersey_number?.toString().includes(searchTerm)
  );

  const filteredPayments = payments.filter(payment =>
    payment.player_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.month.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Show loading or auth screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <Volleyball className="h-8 w-8 text-purple-600 animate-spin" />
          </div>
          <p className="text-white">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={() => {}} />;
  }

  // Form Components

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Jugadores</p>
              <p className="text-3xl font-bold text-gray-900">{players.length}</p>
            </div>
            <Users className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pagos al Día</p>
              <p className="text-3xl font-bold text-gray-900">
                {payments.filter(p => p.status === 'paid').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pagos Pendientes</p>
              <p className="text-3xl font-bold text-gray-900">
                {payments.filter(p => p.status === 'pending').length}
              </p>
            </div>
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Grupos Activos</p>
              <p className="text-3xl font-bold text-gray-900">{groups.length}</p>
            </div>
            <Users2 className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Últimos Jugadores</h3>
          <div className="space-y-3">
            {players.slice(0, 5).map(player => (
              <div key={player.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-purple-600">#{player.jersey_number || '?'}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{player.name}</p>
                  <p className="text-sm text-gray-500">{player.position}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pagos Recientes</h3>
          <div className="space-y-3">
            {payments.slice(0, 5).map(payment => (
              <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{payment.player_name}</p>
                  <p className="text-sm text-gray-500">{payment.month} {payment.year}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">${payment.amount.toLocaleString('es-CO')}</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    payment.status === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {payment.status === 'paid' ? 'Pagado' : 'Pendiente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPlayers = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, posición o número..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowForm('player')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Agregar Jugador</span>
        </button>
      </div>

      {dataLoading ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 mt-2">Cargando jugadores...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlayers.map(player => (
            <div key={player.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                    <span className="text-lg font-bold text-white">#{player.jersey_number || '?'}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{player.name}</h3>
                    <p className="text-sm text-purple-600 font-medium">{player.position}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEditPlayer(player)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDeletePlayer(player.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{player.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{player.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Unido: {new Date(player.join_date).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {player.group_name || 'Sin grupo'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderPayments = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar pagos..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowForm('payment')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo Pago</span>
        </button>
      </div>

      {dataLoading ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 mt-2">Cargando pagos...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jugador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Período
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vencimiento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map(payment => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                          <DollarSign className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="text-sm font-medium text-gray-900">{payment.player_name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.month} {payment.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${payment.amount.toLocaleString('es-CO')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleTogglePaymentStatus(payment.id)}
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                          payment.status === 'paid' 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {payment.status === 'paid' ? 'Pagado' : 'Pendiente'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(payment.due_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditPayment(payment)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeletePayment(payment.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderGroups = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar grupos..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowForm('group')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo Grupo</span>
        </button>
      </div>

      {dataLoading ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 mt-2">Cargando grupos...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredGroups.map(group => (
            <div key={group.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users2 className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                    <p className="text-sm text-purple-600 font-medium">{group.category}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEditGroup(group)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteGroup(group.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Entrenador:</span>
                  <span className="text-sm font-medium text-gray-900">{group.coach}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Horario:</span>
                  <span className="text-sm font-medium text-gray-900">{group.schedule}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Jugadores:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {group.current_players}/{group.max_players}
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(group.current_players / group.max_players) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'players':
        return renderPlayers();
      case 'payments':
        return renderPayments();
      case 'groups':
        return renderGroups();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-4 border-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Volleyball className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">KIBA Volleyball</h1>
                <p className="text-xs text-gray-500">Sistema de Gestión</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveSection(item.id as Section);
                        setSearchTerm('');
                        setShowForm(null);
                      }}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeSection === item.id
                          ? 'bg-purple-100 text-purple-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={signOut}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-white border-b border-gray-200">
        <div className="flex overflow-x-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id as Section);
                  setSearchTerm('');
                  setShowForm(null);
                }}
                className={`flex flex-col items-center space-y-1 px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors ${
                  activeSection === item.id
                    ? 'text-purple-700 border-b-2 border-purple-700'
                    : 'text-gray-600'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 capitalize">{activeSection}</h2>
          <p className="text-gray-600 mt-1">
            {activeSection === 'dashboard' && 'Resumen general del equipo Kiba'}
            {activeSection === 'players' && 'Gestión de jugadores del equipo'}
            {activeSection === 'payments' && 'Control de pagos y mensualidades'}
            {activeSection === 'groups' && 'Administración de grupos y categorías'}
          </p>
        </div>
        
        {renderContent()}
      </main>

      {/* Forms */}
      {showForm === 'player' && (
        <PlayerForm
          editingItem={editingItem}
          playerForm={playerForm}
          groups={groups}
          positions={positions}
          operationLoading={operationLoading}
          onFormChange={handlePlayerFormChange}
          onSave={handleSavePlayer}
          onClose={closeForm}
        />
      )}
      {showForm === 'payment' && (
        <PaymentForm
          editingItem={editingItem}
          paymentForm={paymentForm}
          players={players}
          months={months}
          operationLoading={operationLoading}
          onFormChange={handlePaymentFormChange}
          onSave={handleSavePayment}
          onClose={closeForm}
        />
      )}
      {showForm === 'group' && (
        <GroupForm
          editingItem={editingItem}
          groupForm={groupForm}
          categories={categories}
          operationLoading={operationLoading}
          onFormChange={handleGroupFormChange}
          onSave={handleSaveGroup}
          onClose={closeForm}
        />
      )}
    </div>
  );
}

export default App;