import React, { useState } from 'react';
import { Wallet as Volleyball, Calendar, DollarSign, User, Phone, Mail, Hash, CheckCircle, Send, Loader2 } from 'lucide-react';

interface PaymentReportProps {
  payment: any;
  player: any;
  onClose: () => void;
  onSendEmail?: () => Promise<void>;
}

export default function PaymentReport({ payment, player, onClose, onSendEmail }: PaymentReportProps) {
  const [isSending, setIsSending] = useState(false);

  const handleSendEmail = async () => {
    if (!onSendEmail) return;
    setIsSending(true);
    try {
      await onSendEmail();
    } finally {
      setIsSending(false);
    }
  };
  const currentDate = new Date().toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header con botones */}
        <div className="flex justify-between items-center p-4 border-b bg-purple-50">
          <h3 className="text-lg font-semibold text-purple-900">Vista Previa del Reporte</h3>
          <div className="flex space-x-2">
            {onSendEmail && (
              <button
                onClick={handleSendEmail}
                disabled={isSending}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-1"
              >
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span>{isSending ? 'Enviando...' : 'Enviar por Correo'}</span>
              </button>
            )}
            <button
              onClick={() => window.print()}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Imprimir
            </button>
            <button
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>

        {/* Contenido del reporte */}
        <div id="payment-report" className="p-8 bg-white">
          {/* Header del reporte */}
          <div className="text-center mb-8 border-b-2 border-purple-600 pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mr-4">
                <Volleyball className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-purple-900">KIBA VOLLEYBALL</h1>
                <p className="text-purple-600 font-medium">Sistema de Gestión del Equipo</p>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">COMPROBANTE DE PAGO</h2>
            <p className="text-gray-600">Recibo Oficial de Mensualidad</p>
          </div>

          {/* Información del recibo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Información del pago */}
            <div className="bg-purple-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Detalles del Pago
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Recibo No.:</span>
                  <span className="font-medium text-gray-900">#{payment.id.slice(-8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Período:</span>
                  <span className="font-medium text-gray-900">{payment.month} {payment.year}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monto:</span>
                  <span className="font-bold text-2xl text-purple-600">${payment.amount.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado:</span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    payment.status === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {payment.status === 'paid' ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        PAGADO
                      </>
                    ) : (
                      'PENDIENTE'
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fecha de Vencimiento:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(payment.due_date).toLocaleDateString('es-CO')}
                  </span>
                </div>
                {payment.paid_date && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fecha de Pago:</span>
                    <span className="font-medium text-green-600">
                      {new Date(payment.paid_date).toLocaleDateString('es-CO')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Información del jugador */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Información del Jugador
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-lg font-bold text-white">#{player.jersey_number || '?'}</span>
                  </div>
                  <div>
                    <p className="font-bold text-lg text-gray-900">{player.name}</p>
                    <p className="text-purple-600 font-medium">{player.position}</p>
                  </div>
                </div>
                
                <div className="space-y-2 pt-3 border-t">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{player.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">{player.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">
                      Miembro desde: {new Date(player.join_date).toLocaleDateString('es-CO')}
                    </span>
                  </div>
                  {player.group_name && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {player.group_name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Resumen y términos */}
          <div className="border-t-2 border-gray-200 pt-6">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <h4 className="font-semibold text-yellow-800 mb-2">Información Importante:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Este comprobante es válido como prueba de pago</li>
                <li>• Conserve este documento para sus registros</li>
                <li>• Los pagos deben realizarse antes de la fecha de vencimiento</li>
                <li>• Para consultas, contacte a la administración del equipo</li>
              </ul>
            </div>

            {/* Footer */}
            <div className="text-center text-gray-500 text-sm border-t pt-4">
              <p className="mb-2">
                <strong>KIBA VOLLEYBALL TEAM</strong> - Sistema de Gestión
              </p>
              <p>Documento generado el {currentDate}</p>
              <p className="mt-2 text-xs">
                Este es un documento generado automáticamente por el sistema de gestión KIBA
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos para impresión */}
      <style jsx>{`
        @media print {
          .fixed {
            position: static !important;
          }
          
          body * {
            visibility: hidden;
          }
          
          #payment-report, #payment-report * {
            visibility: visible;
          }
          
          #payment-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
          }
          
          .bg-purple-50,
          .bg-gray-50,
          .bg-yellow-50 {
            background-color: #f8f9fa !important;
            -webkit-print-color-adjust: exact;
          }
          
          .text-purple-600,
          .text-purple-900 {
            color: #7c3aed !important;
            -webkit-print-color-adjust: exact;
          }
          
          .bg-purple-600 {
            background-color: #7c3aed !important;
            -webkit-print-color-adjust: exact;
          }
          
          .border-purple-600 {
            border-color: #7c3aed !important;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}