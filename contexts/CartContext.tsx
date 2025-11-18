
import React, { createContext, useState, ReactNode, useMemo } from 'react';
import { CartItem, Product } from '../types';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, variantId?: string, conversionFactor?: number) => string | null;
  updateQuantity: (cartItemId: string, quantity: number) => string | null;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  itemCount: number;
  total: number;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const getProductTotalUnitsInCart = (productId: string, excludeCartItemId?: string): number => {
      return items
        .filter(item => item.id === productId && item.cartItemId !== excludeCartItemId)
        .reduce((acc, item) => acc + (item.quantity * item.conversionFactor), 0);
  };

  const addToCart = (product: Product, quantity: number = 1, variantId?: string, conversionFactor: number = 1): string | null => {
    // Generate a unique ID for the cart item based on Product + Warehouse + Packaging
    // This ensures strict grouping: same product, same warehouse, same packaging = same line item.
    const cartItemId = `${product.id}-${product.warehouseId || 'no_wh'}-${variantId || 'unit'}`;

    // Stock Validation
    if (product.trackStock && product.stockLevel !== undefined) {
        const currentTotalUnits = getProductTotalUnitsInCart(product.id, cartItemId); // Pass current cartItemId to exclude it? No, actually we want total existing units of THIS product ID.
        // However, if we are updating an existing item, the 'currentTotalUnits' calculation logic needs to represent the state accurately.
        // getProductTotalUnitsInCart calculates what is CURRENTLY in items.
        
        // If we are adding to an EXISTING item, we need to see if (current + new) <= stock.
        // The simple logic is: sum of all units in cart for this product + new units <= stock.
        
        const totalUnitsAlreadyInCart = getProductTotalUnitsInCart(product.id);
        const requestedUnits = quantity * conversionFactor;
        
        if (totalUnitsAlreadyInCart + requestedUnits > product.stockLevel) {
            const availableUnits = Math.max(0, product.stockLevel - totalUnitsAlreadyInCart);
            const maxQty = Math.floor(availableUnits / conversionFactor);
            return `Stock insuficiente para "${product.name}". Apenas ${maxQty} unidade(s) disponível(is) nesta embalagem (Restam ${availableUnits} ${product.unit} no total).`;
        }
    }

    setItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.cartItemId === cartItemId);

      if (existingItemIndex > -1) {
        // Item exists, update quantity
        const newItems = [...prevItems];
        const existingItem = newItems[existingItemIndex];
        newItems[existingItemIndex] = {
            ...existingItem,
            quantity: existingItem.quantity + quantity
        };
        return newItems;
      }

      // Item does not exist, add new
      return [...prevItems, { ...product, cartItemId, quantity, variantId, conversionFactor }];
    });

    return null;
  };

  const updateQuantity = (cartItemId: string, quantity: number): string | null => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return null;
    }

    const item = items.find(i => i.cartItemId === cartItemId);
    if (!item) return "Item não encontrado";

    // Stock Validation
    if (item.trackStock && item.stockLevel !== undefined) {
        // Calculate units taken by OTHER lines of the same product
        const otherUnits = getProductTotalUnitsInCart(item.id, cartItemId);
        const requestedUnits = quantity * item.conversionFactor;

        if (otherUnits + requestedUnits > item.stockLevel) {
             const availableUnits = Math.max(0, item.stockLevel - otherUnits);
             const maxQty = Math.floor(availableUnits / item.conversionFactor);
             return `Stock insuficiente para "${item.name}". Quantidade máxima permitida: ${maxQty}.`;
        }
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.cartItemId === cartItemId ? { ...item, quantity } : item
      )
    );
    return null;
  };

  const removeFromCart = (cartItemId: string) => {
    setItems(prevItems => prevItems.filter(item => item.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const total = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);

  return (
    <CartContext.Provider value={{ items, addToCart, updateQuantity, removeFromCart, clearCart, itemCount, total }}>
      {children}
    </CartContext.Provider>
  );
};
