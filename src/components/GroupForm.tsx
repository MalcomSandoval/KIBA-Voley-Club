import React from 'react';
import { X, Save } from 'lucide-react';

interface GroupFormProps {
  editingItem: any;
  groupForm: {
    name: string;
    category: string;
    schedule: string;
    coach: string;
    max_players: number;
  };
  categories: string[];
  operationLoading: boolean;
  onFormChange: (field: string, value: string | number) => void;
  onSave: () => void;
  onClose: () => void;
}

export default function GroupForm({
  editingItem,
  groupForm,
  categories,
  operationLoading,
  onFormChange,
  onSave,
  onClose
}: GroupFormProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {editingItem ? 'Editar Grupo' : 'Nuevo Grupo'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input
              type="text"
              value={groupForm.name}
              onChange={(e) => onFormChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Nombre del grupo"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
            <select
              value={groupForm.category}
              onChange={(e) => onFormChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Seleccionar categoría</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Entrenador *</label>
            <input
              type="text"
              value={groupForm.coach}
              onChange={(e) => onFormChange('coach', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Nombre del entrenador"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Horario</label>
            <input
              type="text"
              value={groupForm.schedule}
              onChange={(e) => onFormChange('schedule', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Ej: Lun, Mié, Vie 18:00-20:00"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Máximo de Jugadores</label>
            <input
              type="number"
              value={groupForm.max_players}
              onChange={(e) => onFormChange('max_players', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              min="1"
              max="30"
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