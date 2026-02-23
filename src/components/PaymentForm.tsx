import React from 'react';
import { X, Save } from 'lucide-react';

interface PaymentFormProps {
  editingItem: any;
  paymentForm: {
    player_id: string;
    amount: number;
    month: string;
    year: number;
    status: 'paid' | 'pending';
    due_date: string;
    category: string;
  };
  players: any[];
  months: string[];
  categories: string[];
  operationLoading: boolean;
  onFormChange: (field: string, value: string | number) => void;
  onSave: () => void;
  onClose: () => void;
}

export default function PaymentForm({
  editingItem,
  paymentForm,
  players,
  months,
  categories,
  operationLoading,
  onFormChange,
  onSave,
  onClose
}: PaymentFormProps) {
  /**
   * Filtra los jugadores según la categoría seleccionada
   * Si no hay categoría seleccionada, muestra todos los jugadores
   * Busca jugadores que pertenezcan a grupos con la categoría seleccionada
   */
  const filteredPlayersByCategory = paymentForm.category
    ? players.filter(player => player.group_category === paymentForm.category)
    : players;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {editingItem ? 'Editar Pago' : 'Nuevo Pago'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select
              value={paymentForm.category}
              onChange={(e) => {
                onFormChange('category', e.target.value);
                onFormChange('player_id', '');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Todas las categorías</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jugador *</label>
            <select
              value={paymentForm.player_id}
              onChange={(e) => onFormChange('player_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Seleccionar jugador</option>
              {filteredPlayersByCategory.map(player => (
                <option key={player.id} value={player.id}>{player.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mes *</label>
            <select
              value={paymentForm.month}
              onChange={(e) => onFormChange('month', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Seleccionar mes</option>
              {months.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
            <input
              type="number"
              value={paymentForm.year}
              onChange={(e) => onFormChange('year', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              min="2020"
              max="2030"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad ($)</label>
            <input
              type="number"
              value={paymentForm.amount}
              onChange={(e) => onFormChange('amount', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              min="0"
              step="0.01"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={paymentForm.status}
              onChange={(e) => onFormChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="pending">Pendiente</option>
              <option value="paid">Pagado</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Vencimiento *</label>
            <input
              type="date"
              value={paymentForm.due_date}
              onChange={(e) => onFormChange('due_date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex space-x-3 mt-6">
          <button
            onClick={onSave}
            disabled={operationLoading}
            className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            {operationLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>{editingItem ? 'Actualizar' : 'Guardar'}</span>
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}