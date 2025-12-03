
import React from 'react';
import { Product } from '../../types';
import { XIcon, MapPinIcon } from '../Icons';

interface StockLocationModalProps {
  sku: string;
  productName: string;
  allProducts: Product[];
  isOpen: boolean;
  onClose: () => void;
}

export const StockLocationModal: React.FC<StockLocationModalProps> = ({ sku, productName, allProducts, isOpen, onClose }) => {
  if (!isOpen) return null;

  // Filter products by SKU to find all locations
  const productLocations = allProducts.filter(p => p.sku === sku);
  const totalStock = productLocations.reduce((sum, p) => sum + (p.stockLevel || 0), 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <MapPinIcon className="w-5 h-5 mr-2 text-primary-600"/>
            Distribuição de Stock
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6">
            <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-800">{productName}</h3>
                <p className="text-sm text-gray-500">SKU: {sku}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                 <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Stock Total Global:</span>
                    <span className="text-xl font-bold text-primary-600">{totalStock} <span className="text-sm font-normal text-gray-500">{productLocations[0]?.unit}</span></span>
                 </div>
            </div>

            <h4 className="font-semibold text-gray-700 mb-3">Detalhes por Armazém</h4>
            <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full bg-white divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Armazém</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lote</th>
                             <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {productLocations.map((p) => (
                            <tr key={p.id}>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {p.warehouse?.name || 'N/A'}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                    {p.warehouse?.type || 'N/A'}
                                </td>
                                 <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                    {p.lot || '-'}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right font-bold">
                                    {p.stockLevel}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
