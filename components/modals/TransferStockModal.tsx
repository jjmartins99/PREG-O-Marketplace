import React, { useState, useEffect } from 'react';
import { Product, Warehouse, User } from '../../types';
import { XIcon } from '../Icons';
import mockApi from '../../services/mockApi';

interface TransferStockModalProps {
  product: Product | null;
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onStockTransferred: () => void;
}

export const TransferStockModal: React.FC<TransferStockModalProps> = ({ product, user, isOpen, onClose, onStockTransferred }) => {
  const [quantity, setQuantity] = useState(1);
  const [destinationWarehouseId, setDestinationWarehouseId] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [error, setError] = useState('');
  const [availableWarehouses, setAvailableWarehouses] = useState<Warehouse[]>([]);

  useEffect(() => {
    if (product && user && isOpen) {
      mockApi.getVisibleWarehouses(user).then(whs => {
          setAvailableWarehouses(whs.filter(w => w.id !== product.warehouseId));
      });
      setQuantity(1);
      setDestinationWarehouseId('');
      setError('');
    }
  }, [product, user, isOpen]);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (quantity <= 0) {
      setError('A quantidade deve ser maior que zero.');
      return;
    }
    if (quantity > (product.stockLevel || 0)) {
      setError('A quantidade a transferir não pode ser maior que o stock atual.');
      return;
    }
    if (!destinationWarehouseId) {
      setError('Por favor, selecione um armazém de destino.');
      return;
    }

    setIsTransferring(true);
    const success = await mockApi.transferStock(product.id, destinationWarehouseId, quantity);
    
    if (success) {
        onStockTransferred();
        onClose();
    } else {
        setError('Ocorreu um erro ao transferir o stock. Tente novamente.');
    }
    setIsTransferring(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Transferir Stock</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
                <h3 className="font-medium text-gray-800">{product.name}</h3>
                <p className="text-sm text-gray-500">Stock atual: {product.stockLevel} em {product.warehouse?.name}</p>
            </div>
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantidade a Transferir</label>
              <input
                type="number"
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                min="1"
                max={product.stockLevel}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            <div>
              <label htmlFor="destination" className="block text-sm font-medium text-gray-700">Transferir Para</label>
              <select 
                id="destination"
                value={destinationWarehouseId}
                onChange={(e) => setDestinationWarehouseId(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                required
              >
                <option value="">Selecione o destino</option>
                {availableWarehouses.map(wh => (
                    <option key={wh.id} value={wh.id}>{wh.name} ({wh.type})</option>
                ))}
              </select>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
          <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={isTransferring} className="px-4 py-2 bg-primary-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-primary-700 disabled:bg-primary-300">
              {isTransferring ? 'A Transferir...' : 'Confirmar Transferência'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};