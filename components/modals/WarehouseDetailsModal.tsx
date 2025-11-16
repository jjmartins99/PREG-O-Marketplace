
import React from 'react';
import { Warehouse } from '../../types';
import { XIcon } from '../Icons';

interface WarehouseDetailsModalProps {
  warehouse: Warehouse | null;
  isOpen: boolean;
  onClose: () => void;
}

export const WarehouseDetailsModal: React.FC<WarehouseDetailsModalProps> = ({ warehouse, isOpen, onClose }) => {
  if (!isOpen || !warehouse) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Detalhes do Armazém</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <span className="font-medium text-gray-500 text-sm">Nome:</span>
            <p className="text-gray-800 text-base">{warehouse.name}</p>
          </div>
          <div>
            <span className="font-medium text-gray-500 text-sm">Tipo:</span>
            <p className="text-gray-800 text-base">{warehouse.type}</p>
          </div>
          <div>
            <span className="font-medium text-gray-500 text-sm">Localização:</span>
            <p className="text-gray-800 text-base">{warehouse.location}</p>
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-primary-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-primary-700">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
