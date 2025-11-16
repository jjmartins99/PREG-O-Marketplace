import React, { useState } from 'react';
import { Product } from '../../types';
import { XIcon } from '../Icons';
import mockApi from '../../services/mockApi';

interface AdjustStockModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onStockUpdated: (updatedProduct: Product) => void;
}

export const AdjustStockModal: React.FC<AdjustStockModalProps> = ({ product, isOpen, onClose, onStockUpdated }) => {
  const [newStock, setNewStock] = useState(product?.stockLevel || 0);
  const [reason, setReason] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  React.useEffect(() => {
    if (product) {
      setNewStock(product.stockLevel || 0);
      setReason('');
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    const updatedProduct = await mockApi.updateStockLevel(product.id, newStock);
    if (updatedProduct) {
        onStockUpdated(updatedProduct);
    }
    setIsUpdating(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Ajustar Stock: {product.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
                <label htmlFor="currentStock" className="block text-sm font-medium text-gray-700">Stock Atual</label>
                <input
                    type="number"
                    id="currentStock"
                    disabled
                    value={product.stockLevel}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
                />
            </div>
            <div>
              <label htmlFor="newStock" className="block text-sm font-medium text-gray-700">Nova Quantidade</label>
              <input
                type="number"
                id="newStock"
                value={newStock}
                onChange={(e) => setNewStock(parseInt(e.target.value, 10))}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Motivo do Ajuste</label>
              <select 
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                required
              >
                <option value="">Selecione um motivo</option>
                <option value="physical_count">Contagem Física</option>
                <option value="damage">Produto Danificado</option>
                <option value="theft_loss">Perca ou Roubo</option>
                <option value="return">Devolução de Cliente</option>
              </select>
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={isUpdating} className="px-4 py-2 bg-primary-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-primary-700 disabled:bg-primary-300">
              {isUpdating ? 'A Atualizar...' : 'Atualizar Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
