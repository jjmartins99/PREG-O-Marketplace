import { User, UserRole, Product, ProductKind, Delivery, Company, Warehouse, PaginatedResponse, ProductFilters, UserFilters } from '../types';

const users: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@pregao.com', role: UserRole.ADMIN, avatarUrl: 'https://i.pravatar.cc/150?u=admin' },
  { id: '2', name: 'Seller One', email: 'seller1@pregao.com', role: UserRole.SELLER, avatarUrl: 'https://i.pravatar.cc/150?u=seller1' },
  { id: '3', name: 'Buyer One', email: 'buyer1@pregao.com', role: UserRole.BUYER, avatarUrl: 'https://i.pravatar.cc/150?u=buyer1' },
  { id: '4', name: 'Marco Silva', email: 'driver1@pregao.com', role: UserRole.DRIVER, avatarUrl: 'https://i.pravatar.cc/150?u=driver1' },
  { id: '5', name: 'Ana Pereira', email: 'driver2@pregao.com', role: UserRole.DRIVER, avatarUrl: 'https://i.pravatar.cc/150?u=driver2' },
  { id: '6', name: 'Gerente Loja', email: 'manager@pregao.com', role: UserRole.MANAGER, avatarUrl: 'https://i.pravatar.cc/150?u=manager' },
  { id: '7', name: 'Supervisor Logistica', email: 'supervisor@pregao.com', role: UserRole.SUPERVISOR, avatarUrl: 'https://i.pravatar.cc/150?u=supervisor' },
  
];

const warehouses: Warehouse[] = [
    { id: 'wh1', name: 'Armazém Principal', location: 'Luanda' },
    { id: 'wh2', name: 'Filial Benguela', location: 'Benguela' },
];

let products: Product[] = [
  { id: 'p1', name: 'Arroz Tio Lucas 25kg', description: 'Arroz agulha de alta qualidade.', sku: 'PROD001', price: 15000, kind: ProductKind.GOOD, trackStock: true, unit: 'UN', packaging: [{id: 'pkg1', name: 'Fardo', unit: 'FAR', conversionFactor: 4, price: 58000}], imageUrl: 'https://picsum.photos/seed/arroz/400/300', warehouseId: 'wh1', stockLevel: 120, lot: 'LOTE2024A', expiryDate: '2025-12-31' },
  { id: 'p2', name: 'Óleo Fula 1L', description: 'Óleo vegetal para cozinha.', sku: 'PROD002', price: 1200, kind: ProductKind.GOOD, trackStock: true, unit: 'UN', packaging: [{id: 'pkg2', name: 'Caixa', unit: 'CX', conversionFactor: 12, price: 14000}], imageUrl: 'https://picsum.photos/seed/oleo/400/300', warehouseId: 'wh1', stockLevel: 300, lot: 'LOTE2024B', expiryDate: '2026-06-30' },
  { id: 'p3', name: 'Serviço de Instalação', description: 'Instalação de equipamento standard (2 horas).', sku: 'SERV001', price: 25000, kind: ProductKind.SERVICE, trackStock: false, unit: 'HR', packaging: [], imageUrl: 'https://picsum.photos/seed/servico/400/300', warehouseId: 'wh1' },
  { id: 'p4', name: 'Sumo Compal 1L', description: 'Sumo de Laranja natural.', sku: 'PROD003', price: 900, kind: ProductKind.GOOD, trackStock: true, unit: 'UN', packaging: [{id: 'pkg3', name: 'Grade', unit: 'GRD', conversionFactor: 6, price: 5200}], imageUrl: 'https://picsum.photos/seed/sumo/400/300', warehouseId: 'wh2', stockLevel: 250, lot: 'LOTE2024C', expiryDate: '2025-03-01' },
  { id: 'p5', name: 'Cimento Portland 50kg', description: 'Cimento para construção civil.', sku: 'PROD004', price: 4500, kind: ProductKind.GOOD, trackStock: true, unit: 'UN', packaging: [], imageUrl: 'https://picsum.photos/seed/cimento/400/300', warehouseId: 'wh2', stockLevel: 500 },
  { id: 'p6', name: 'Consultoria de Negócios', description: 'Sessão de consultoria estratégica (1 hora).', sku: 'SERV002', price: 50000, kind: ProductKind.SERVICE, trackStock: false, unit: 'HR', packaging: [], imageUrl: 'https://picsum.photos/seed/consultoria/400/300', warehouseId: 'wh1' },
];

const deliveries: Delivery[] = [
    { id: 'd1', orderId: 'o1', driver: users.find(u=>u.role === UserRole.DRIVER)!, vehicle: { brand: 'Toyota', model: 'Hilux', licensePlate: 'LD-01-02-AA' }, status: 'Em Trânsito', estimatedDelivery: '14:30', currentLocation: { lat: -8.8368, lng: 13.2343 } },
    { id: 'd2', orderId: 'o2', driver: users.find(u=>u.role === UserRole.DRIVER && u.name.includes('Ana'))!, vehicle: { brand: 'Haojue', model: 'M-150', licensePlate: 'BE-03-04-BB' }, status: 'Aguardando', estimatedDelivery: '16:00', currentLocation: { lat: -12.5763, lng: 13.4155 } },
];

const companies: Company[] = [
    { id: 'c1', name: 'Entrega Rápida Lda', drivers: [users[3]] },
    { id: 'c2', name: 'MotoBoys Express', drivers: [users[4]] },
];

const api = {
  login: async (email: string): Promise<User | undefined> => {
    console.log(`Attempting login for: ${email}`);
    await new Promise(res => setTimeout(res, 500));
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },
  
  getProducts: async (filters: ProductFilters, page: number = 1, limit: number = 1000): Promise<PaginatedResponse<Product>> => {
    await new Promise(res => setTimeout(res, 500));
    let filteredProducts = [...products];

    if (filters.query) {
      const query = filters.query.toLowerCase();
      filteredProducts = filteredProducts.filter(p => p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query));
    }
    if (filters.kind && filters.kind !== 'all') {
      filteredProducts = filteredProducts.filter(p => p.kind === filters.kind);
    }
    if (filters.warehouseId && filters.warehouseId !== 'all') {
      filteredProducts = filteredProducts.filter(p => p.warehouseId === filters.warehouseId);
    }

    if (filters.sortBy) {
        filteredProducts.sort((a, b) => {
            switch(filters.sortBy) {
                case 'price-asc': return a.price - b.price;
                case 'price-desc': return b.price - a.price;
                case 'name-asc': return a.name.localeCompare(b.name);
                case 'name-desc': return b.name.localeCompare(a.name);
                default: return 0;
            }
        });
    }

    const total = filteredProducts.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return { data: filteredProducts.slice(start, end), total, page, limit };
  },

  getSellerProducts: async (sellerId: string, filters: { query?: string }, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Product>> => {
    await new Promise(res => setTimeout(res, 500));
    // In a real app, products would be associated with a seller
    let sellerProducts = products; // .filter(p => ['p1', 'p2', 'p3', 'p6'].includes(p.id));

    if (filters.query) {
        const query = filters.query.toLowerCase();
        sellerProducts = sellerProducts.filter(p => p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query));
    }
    
    const total = sellerProducts.length;
    const start = (page - 1) * limit;
    const end = start + limit;

    return { data: sellerProducts.slice(start, end), total, page, limit };
  },

  addProduct: async (productData: Omit<Product, 'id' | 'imageUrl'>): Promise<Product> => {
    await new Promise(res => setTimeout(res, 500));
    const newProduct: Product = {
      id: `p${products.length + 1}-${Math.random().toString(16).slice(2)}`,
      imageUrl: `https://picsum.photos/seed/${encodeURIComponent(productData.name)}/400/300`,
      ...productData,
    };
    products.unshift(newProduct);
    return newProduct;
  },

  addMultipleProducts: async (productsData: Omit<Product, 'id' | 'imageUrl' | 'packaging'>[]): Promise<Product[]> => {
    await new Promise(res => setTimeout(res, 1000)); // Simulate network delay
    const newProducts: Product[] = productsData.map((productData, index) => ({
      id: `p${products.length + 1 + index}-${Math.random().toString(16).slice(2)}`,
      imageUrl: `https://picsum.photos/seed/${encodeURIComponent(productData.name)}/400/300`,
      ...productData,
      packaging: [], // Assuming no packaging from CSV for simplicity
    }));
    products.unshift(...newProducts);
    return newProducts;
  },

  updateProduct: async (productId: string, productData: Partial<Product>): Promise<Product | undefined> => {
      await new Promise(res => setTimeout(res, 500));
      const productIndex = products.findIndex(p => p.id === productId);
      if (productIndex > -1) {
          products[productIndex] = { ...products[productIndex], ...productData };
          return products[productIndex];
      }
      return undefined;
  },

  getUsers: async (filters: UserFilters, page: number = 1, limit: number = 10): Promise<PaginatedResponse<User>> => {
    await new Promise(res => setTimeout(res, 500));
    let filteredUsers = users.filter(u => u.role !== UserRole.ADMIN);

    if (filters.query) {
        const query = filters.query.toLowerCase();
        filteredUsers = filteredUsers.filter(u => u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query));
    }
    if (filters.role && filters.role !== 'all') {
        filteredUsers = filteredUsers.filter(u => u.role === filters.role);
    }

    const total = filteredUsers.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return { data: filteredUsers.slice(start, end), total, page, limit };
  },
  
  getDeliveries: async (): Promise<Delivery[]> => {
    await new Promise(res => setTimeout(res, 500));
    return deliveries;
  },

  getCompanies: async (): Promise<Company[]> => {
    await new Promise(res => setTimeout(res, 500));
    return companies;
  },
  
  getSummaryCounts: async (): Promise<{products: number, users: number, deliveries: number}> => {
    await new Promise(res => setTimeout(res, 300));
    return {
        products: products.length,
        users: users.length,
        deliveries: deliveries.filter(d => d.status !== 'Entregue').length
    };
  },

  updateStockLevel: async (productId: string, newStockLevel: number): Promise<Product | undefined> => {
      await new Promise(res => setTimeout(res, 500));
      const productIndex = products.findIndex(p => p.id === productId);
      if (productIndex > -1) {
          products[productIndex].stockLevel = newStockLevel;
          return products[productIndex];
      }
      return undefined;
  },

  transferStock: async (sourceProductId: string, toWarehouseId: string, quantity: number): Promise<boolean> => {
    await new Promise(res => setTimeout(res, 800));
    const sourceProductIndex = products.findIndex(p => p.id === sourceProductId);

    if (sourceProductIndex === -1) {
        console.error("Source product not found for transfer");
        return false;
    }
    
    const sourceProduct = products[sourceProductIndex];

    if (!sourceProduct.stockLevel || quantity > sourceProduct.stockLevel) {
        console.error("Transfer quantity exceeds available stock");
        return false;
    }

    const existingProductInDestIndex = products.findIndex(p => p.sku === sourceProduct.sku && p.warehouseId === toWarehouseId);
    
    sourceProduct.stockLevel -= quantity;
    
    if (existingProductInDestIndex > -1) {
        const destProduct = products[existingProductInDestIndex];
        if (destProduct.stockLevel !== undefined) {
           destProduct.stockLevel += quantity;
        } else {
           destProduct.stockLevel = quantity;
        }
    } else {
        const newProductEntry: Product = {
            ...sourceProduct,
            id: `p${products.length + 1}-${Math.random().toString(16).slice(2)}`,
            warehouseId: toWarehouseId,
            stockLevel: quantity,
            lot: `TRANSF-${sourceProduct.lot || ''}`,
            expiryDate: sourceProduct.expiryDate,
        };
        products.unshift(newProductEntry);
    }
    
    return true;
  },
};

export const MOCK_WAREHOUSES = warehouses;
export default api;