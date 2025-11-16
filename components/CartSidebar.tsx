import React from 'react';
import { useCart } from '../hooks/useCart';
import { XIcon } from './Icons';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(value);

export const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose }) => {
  const { items, updateQuantity, removeFromCart, total, itemCount } = useCart();

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>
      <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-xl z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Carrinho ({itemCount})</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
              <XIcon className="w-6 h-6" />
            </button>
          </div>

          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500">O seu carrinho está vazio.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-4">
                {items.map(item => (
                  <li key={item.id} className="flex items-start space-x-4">
                    <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-md object-cover" />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-500">{formatCurrency(item.price)}</p>
                      <div className="flex items-center mt-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value, 10))}
                          className="w-16 px-2 py-1 border rounded-md text-center text-sm"
                        />
                         <button onClick={() => removeFromCart(item.id)} className="ml-4 text-xs text-red-500 hover:underline">Remover</button>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{formatCurrency(item.price * item.quantity)}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="p-4 border-t">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-medium text-gray-800">Total</span>
              <span className="text-xl font-bold text-primary-600">{formatCurrency(total)}</span>
            </div>
            <button 
              disabled={items.length === 0}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 disabled:bg-primary-300 transition-colors"
            >
              Finalizar Compra
            </button>
          </div>
        </div>
      </div>
    </>
  );
};