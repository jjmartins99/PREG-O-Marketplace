
import React, { useState } from 'react';
import { useCart } from '../hooks/useCart';
import { XIcon, CheckCircleIcon } from './Icons';
import { CartItem } from '../types';
import { ConfirmationModal } from './modals/ConfirmationModal';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(value);

export const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose }) => {
  const { items, updateQuantity, removeFromCart, total, itemCount, clearCart } = useCart();
  const [error, setError] = useState<string | null>(null);
  const [errorItemId, setErrorItemId] = useState<string | null>(null);
  const [itemConfirmingRemoval, setItemConfirmingRemoval] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleQuantityChange = (cartItemId: string, newQuantity: number) => {
      setError(null);
      setErrorItemId(null);
      
      // Case 1: Input is empty or NaN -> Reset to 1 to maintain validity
      if (isNaN(newQuantity)) {
          updateQuantity(cartItemId, 1);
          return;
      }

      // Case 2: User typed 0 -> Ask for confirmation to remove
      if (newQuantity === 0) {
          setItemConfirmingRemoval(cartItemId);
          return;
      }
      
      // Case 3: Negative numbers -> Ignore
      if (newQuantity < 0) return;

      const result = updateQuantity(cartItemId, newQuantity);
      if (result) {
          setError(result);
          setErrorItemId(cartItemId);
          // Auto-hide error after 4 seconds
          setTimeout(() => {
              setError(null);
              setErrorItemId(null);
          }, 4000);
      }
  };

  const handleConfirmRemoval = () => {
      if (itemConfirmingRemoval) {
          removeFromCart(itemConfirmingRemoval);
          setItemConfirmingRemoval(null);
      }
  };

  const getItemNameForConfirmation = () => {
      if (!itemConfirmingRemoval) return '';
      const item = items.find(i => i.cartItemId === itemConfirmingRemoval);
      return item ? item.name : 'este item';
  };

  const getMaxQuantity = (item: CartItem) => {
      if (!item.trackStock || item.stockLevel === undefined) return undefined;
      
      // Calculate stock used by OTHER items of the same product (e.g. different packaging)
      const otherItemsConsumption = items
          .filter(i => i.id === item.id && i.cartItemId !== item.cartItemId)
          .reduce((acc, i) => acc + (i.quantity * i.conversionFactor), 0);
      
      const availableStockForThisItem = item.stockLevel - otherItemsConsumption;
      // Determine max quantity for THIS specific packaging
      return Math.max(0, Math.floor(availableStockForThisItem / item.conversionFactor));
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    // Simulate API processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    clearCart();
    setIsCheckingOut(false);
    setIsSuccess(true);
  };

  const handleCloseSuccess = () => {
      setIsSuccess(false);
      onClose();
  };

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
          
          {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mx-4 mt-4 text-sm relative shadow-sm animate-pulse" role="alert">
                  <p className="font-medium">Atenção:</p>
                  <p>{error}</p>
                  <button onClick={() => setError(null)} className="absolute top-1 right-1 text-red-500 hover:text-red-800">
                      <span className="text-xs font-bold">✕</span>
                  </button>
              </div>
          )}

          {isSuccess ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                  <div className="bg-green-100 p-4 rounded-full mb-6">
                    <CheckCircleIcon className="w-16 h-16 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Sucesso!</h3>
                  <p className="text-gray-600 mb-8">A sua compra foi registada com sucesso.</p>
                  <button 
                      onClick={handleCloseSuccess}
                      className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                  >
                      Continuar a Comprar
                  </button>
              </div>
          ) : items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500">O seu carrinho está vazio.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-4">
                {items.map(item => {
                  const maxQty = getMaxQuantity(item);
                  return (
                  <li key={item.cartItemId} className="flex items-start space-x-4">
                    <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-md object-cover" />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-500">{formatCurrency(item.price)}</p>
                      <div className="flex items-center mt-2">
                        <input
                          type="number"
                          min="0" // Allow 0 to trigger confirmation
                          max={maxQty}
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.cartItemId, parseInt(e.target.value, 10))}
                          className={`w-16 px-2 py-1 border rounded-md text-center text-sm transition-colors duration-200 ${errorItemId === item.cartItemId ? 'border-red-500 ring-1 ring-red-500 bg-red-50 text-red-900' : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'}`}
                        />
                         <button onClick={() => setItemConfirmingRemoval(item.cartItemId)} className="ml-4 text-xs text-red-500 hover:underline">Remover</button>
                      </div>
                      {maxQty !== undefined && item.quantity >= maxQty && (
                          <span className="text-[10px] text-orange-600 mt-1 block">Máx. disponível atingido</span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{formatCurrency(item.price * item.quantity)}</p>
                  </li>
                  );
                })}
              </ul>
            </div>
          )}

          {!isSuccess && (
              <div className="p-4 border-t">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-medium text-gray-800">Total</span>
                  <span className="text-xl font-bold text-primary-600">{formatCurrency(total)}</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  disabled={items.length === 0 || isCheckingOut}
                  className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 disabled:bg-primary-300 transition-colors flex justify-center items-center"
                >
                  {isCheckingOut ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        A Processar...
                      </>
                  ) : (
                      'Finalizar Compra'
                  )}
                </button>
              </div>
          )}
        </div>
      </div>
      
      <ConfirmationModal
          isOpen={!!itemConfirmingRemoval}
          onClose={() => setItemConfirmingRemoval(null)}
          onConfirm={handleConfirmRemoval}
          title="Remover do Carrinho"
          message={`Tem a certeza que deseja remover "${getItemNameForConfirmation()}" do seu carrinho?`}
          confirmText="Remover"
      />
    </>
  );
};
