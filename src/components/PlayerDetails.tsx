import React from 'react';
import { X, Mail, Phone, Calendar, Hash, Users, Shirt, AlertCircle } from 'lucide-react';
import { formatDateDisplay, calculateAge } from '../lib/dateUtils';

interface PlayerDetailsProps {
  player: any;
  onClose: () => void;
}

export default function PlayerDetails({ player, onClose }: PlayerDetailsProps) {
  const age = calculateAge(player.birth_date);

  const getPositionColor = (position: string) => {
    const colors: { [key: string]: string } = {
      'Atacante/Rematador': 'bg-red-100 text-red-800',
      'Líbero': 'bg-blue-100 text-blue-800',
      'Central/Bloqueador': 'bg-purple-100 text-purple-800',
      'Colocador/Armador': 'bg-green-100 text-green-800',
      'Opuesto': 'bg-yellow-100 text-yellow-800',
      'Sin posición definida': 'bg-gray-100 text-gray-800'
    };
    return colors[position] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-md">
              <span className="text-2xl font-bold text-purple-600">#{player.jersey_number || '?'}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{player.name}</h2>
              <p className={`text-sm font-medium mt-1 px-3 py-1 rounded-full inline-block ${getPositionColor(player.position)}`}>
                {player.position}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Información de contacto */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Mail className="h-5 w-5 text-purple-600" />
              <span>Información de Contacto</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 font-medium">Correo Electrónico</p>
                <p className="text-gray-900 mt-1">{player.email || 'No especificado'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Teléfono</p>
                <p className="text-gray-900 mt-1">{player.phone || 'No especificado'}</p>
              </div>
            </div>
          </div>

          {/* Información personal */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <span>Información Personal</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 font-medium flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Fecha de Nacimiento</span>
                </p>
                <p className="text-gray-900 mt-2">{formatDateDisplay(player.birth_date)}</p>
                {age !== null && (
                  <p className="text-sm text-purple-600 mt-1 font-medium">{age} años</p>
                )}
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 font-medium flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Fecha de Unión</span>
                </p>
                <p className="text-gray-900 mt-2">{formatDateDisplay(player.join_date)}</p>
              </div>
            </div>
          </div>

          {/* Información del grupo */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <span>Información del Grupo</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 font-medium">Grupo</p>
                <p className="text-gray-900 mt-1">{player.group_name || 'Sin grupo'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Categoría</p>
                <p className="text-gray-900 mt-1">{player.group_category || 'Sin categoría'}</p>
              </div>
            </div>
          </div>

          {/* Contacto de emergencia */}
          {player.emergency_contact && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span>Contacto de Emergencia</span>
              </h3>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-gray-900">{player.emergency_contact}</p>
              </div>
            </div>
          )}

          {/* Resumen */}
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-800">
              <strong>{player.name}</strong> es un jugador activo en el equipo KIBA Volleyball desde {formatDateDisplay(player.join_date)}. 
              Juega en la posición de <strong>{player.position}</strong> y pertenece al grupo <strong>{player.group_name || 'sin asignar'}</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
