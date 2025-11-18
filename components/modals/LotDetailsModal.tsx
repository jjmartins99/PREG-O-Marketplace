
import React from 'react';
import { Product } from '../../types';
import { XIcon, TagIcon } from '../Icons';

interface LotDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LotDetailsModal: React.FC<LotDetailsModalProps> = ({ product, isOpen, onClose }) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <TagIcon className="w-5 h-5 mr-2 text-primary-600"/>
            Detalhes do Lote
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <span className="font-medium text-gray-500 text-sm">Produto:</span>
            <p className="text-gray-800 text-base">{product.name}</p>
          </div>
          <div>
            <span className="font-medium text-gray-500 text-sm">Número do Lote:</span>
            <p className="text-gray-800 text-base font-mono bg-gray-100 px-2 py-1 rounded-md inline-block">{product.lot || 'N/A'}</p>
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
