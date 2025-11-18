
import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { XIcon, ShoppingCartIcon } from '../Icons';
import { useCart } from '../../hooks/useCart';

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ product, isOpen, onClose }) => {
  const { addToCart, items } = useCart();
  const [selectedPackagingId, setSelectedPackagingId] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
        setSelectedPackagingId('');
        setQuantity(1);
        setError(null);
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const selectedPackaging = product.packaging?.find(p => p.id === selectedPackagingId);
  
  const currentPrice = selectedPackaging ? selectedPackaging.price : product.price;
  const conversionFactor = selectedPackaging ? selectedPackaging.conversionFactor : 1;
  const unitPrice = currentPrice / conversionFactor;
  
  const baseUnitName = product.unit;

  const getMaxQuantity = () => {
      if (!product.trackStock || product.stockLevel === undefined) return undefined;
      
      // Calculate how much of this product is ALREADY in the cart (across all packages)
      const inCartConsumption = items
          .filter(i => i.id === product.id)
          .reduce((acc, i) => acc + (i.quantity * i.conversionFactor), 0);
      
      const available = product.stockLevel - inCartConsumption;
      // Return available quantity in terms of the currently selected packaging
      return Math.max(0, Math.floor(available / conversionFactor));
  };

  const maxQty = getMaxQuantity();

  const handleAddToCart = () => {
      setError(null);
      const productToAdd = {
          ...product,
          price: currentPrice,
          name: selectedPackaging ? `${product.name} (${selectedPackaging.name})` : product.name
      };
      
      const result = addToCart(productToAdd, quantity, selectedPackagingId, conversionFactor);
      
      if (result) {
          setError(result);
      } else {
          onClose();
      }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl flex flex-col md:flex-row overflow-hidden max-h-[90vh]">
        <div className="w-full md:w-1/2 h-64 md:h-auto relative bg-gray-100">
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain" />
             <button onClick={onClose} className="absolute top-4 left-4 md:hidden p-2 bg-white rounded-full text-gray-600 shadow-md">
                <XIcon className="w-6 h-6" />
            </button>
        </div>
        
        <div className="w-full md:w-1/2 p-6 flex flex-col overflow-y-auto">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">{product.name}</h2>
                    <p className="text-sm text-gray-500 mt-1">SKU: {product.sku}</p>
                </div>
                <button onClick={onClose} className="hidden md:block text-gray-400 hover:text-gray-600">
                    <XIcon className="w-6 h-6" />
                </button>
            </div>

            <p className="mt-4 text-gray-600">{product.description}</p>
            
            {error && (
                <div className="mt-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-3 text-sm">
                    <p>{error}</p>
                </div>
            )}

            <div className="mt-6 border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Selecione a Embalagem</label>
                <div className="flex flex-wrap gap-2">
                    <button
                        className={`px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${selectedPackagingId === '' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}
                        onClick={() => setSelectedPackagingId('')}
                    >
                        Unidade ({product.unit})
                    </button>
                    {product.packaging?.map(pkg => (
                        <button
                            key={pkg.id}
                            className={`px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${selectedPackagingId === pkg.id ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}
                            onClick={() => setSelectedPackagingId(pkg.id)}
                        >
                            {pkg.name} ({pkg.unit})
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-auto pt-6">
                <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-baseline">
                        <span className="text-3xl font-bold text-gray-900">
                            {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(currentPrice)}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">/ {selectedPackaging ? selectedPackaging.name : 'Unidade'}</span>
                    </div>
                    
                    <div className="mt-2 pt-2 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center text-sm text-gray-600">
                        <span className="font-medium mr-2">Preço por {baseUnitName}:</span>
                        <span className="font-bold text-gray-800">
                            {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(unitPrice)}
                        </span>
                         {selectedPackaging && (
                            <span className="mt-1 sm:mt-0 sm:ml-auto text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full inline-block">
                                Contém {selectedPackaging.conversionFactor} {baseUnitName}
                            </span>
                        )}
                    </div>
                    {maxQty !== undefined && (
                        <div className="mt-2 text-xs text-gray-500">
                            Stock disponível: <span className={maxQty < 5 ? 'text-red-600 font-bold' : 'font-semibold'}>{maxQty}</span> unidades nesta embalagem.
                        </div>
                    )}
                </div>

                <div className="flex space-x-4">
                     <div className="w-24">
                        <label htmlFor="quantity" className="block text-xs font-medium text-gray-700 mb-1">Qtd</label>
                        <input
                            type="number"
                            id="quantity"
                            min="1"
                            max={maxQty}
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm border py-2 px-3"
                        />
                     </div>
                    <button
                        onClick={handleAddToCart}
                        disabled={maxQty !== undefined && maxQty < 1}
                        className="flex-1 bg-primary-600 border border-transparent rounded-md py-2 px-4 flex items-center justify-center text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mt-auto disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        <ShoppingCartIcon className="w-5 h-5 mr-2" />
                        {maxQty !== undefined && maxQty < 1 ? 'Sem Stock' : 'Adicionar ao Carrinho'}
                    </button>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};
