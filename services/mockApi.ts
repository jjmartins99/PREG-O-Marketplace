import { User, UserRole, Product, ProductKind, Delivery, DeliveryCompany, Company, Warehouse, WarehouseType, PaginatedResponse, ProductFilters, UserFilters } from '../types';

const companies: Company[] = [
    { id: 'c-main', name: 'PREGÃO Casa Mãe', parentId: null },
    { id: 'c-branch-1', name: 'Filial Luanda Sul', parentId: 'c-main' },
    { id: 'c-branch-2', name: 'Filial Talatona', parentId: 'c-main' },
    { id: 'c-branch-1-sub', name: 'Ponto de Venda - Shopping Avenida', parentId: 'c-branch-1' },
];

let warehouses: Warehouse[] = [
    // Main company warehouses
    { id: 'wh-main-general', name: 'Armazém Geral (Sede)', location: 'Luanda', type: WarehouseType.GENERAL, companyId: 'c-main' },
    { id: 'wh-main-store', name: 'Armazém da Loja (Sede)', location: 'Luanda', type: WarehouseType.STORE, companyId: 'c-main' },
    // Branch 1 warehouses
    { id: 'wh-b1-general', name: 'Armazém Geral (Luanda Sul)', location: 'Luanda Sul', type: WarehouseType.GENERAL, companyId: 'c-branch-1' },
    { id: 'wh-b1-store', name: 'Armazém da Loja (Luanda Sul)', location: 'Luanda Sul', type: WarehouseType.STORE, companyId: 'c-branch-1' },
    // Branch 2 warehouses
    { id: 'wh-b2-store', name: 'Armazém da Loja (Talatona)', location: 'Talatona', type: WarehouseType.STORE, companyId: 'c-branch-2' },
     // Sub-branch warehouse
    { id: 'wh-b1s-store', name: 'Armazém da Loja (Shopping Avenida)', location: 'Shopping Avenida', type: WarehouseType.STORE, companyId: 'c-branch-1-sub' },
];

const users: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@pregao.com', role: UserRole.ADMIN, avatarUrl: 'https://i.pravatar.cc/150?u=admin', companyId: 'c-main' },
  { id: '2', name: 'Seller One', email: 'seller1@pregao.com', role: UserRole.SELLER, avatarUrl: 'https://i.pravatar.cc/150?u=seller1', companyId: 'c-branch-1' },
  { id: '3', name: 'Buyer One', email: 'buyer1@pregao.com', role: UserRole.BUYER, avatarUrl: 'https://i.pravatar.cc/150?u=buyer1', companyId: 'c-main' },
  { id: '4', name: 'Marco Silva', email: 'driver1@pregao.com', role: UserRole.DRIVER, avatarUrl: 'https://i.pravatar.cc/150?u=driver1', companyId: 'c-main' },
  { id: '5', name: 'Ana Pereira', email: 'driver2@pregao.com', role: UserRole.DRIVER, avatarUrl: 'https://i.pravatar.cc/150?u=driver2', companyId: 'c-main' },
  { id: '6', name: 'Gerente Loja', email: 'manager@pregao.com', role: UserRole.MANAGER, avatarUrl: 'https://i.pravatar.cc/150?u=manager', companyId: 'c-branch-2' },
  { id: '7', name: 'Supervisor Logistica', email: 'supervisor@pregao.com', role: UserRole.SUPERVISOR, avatarUrl: 'https://i.pravatar.cc/150?u=supervisor', companyId: 'c-main' },
  { id: '8', name: 'Gestor de Grupo', email: 'groupmanager@pregao.com', role: UserRole.GROUP_MANAGER, avatarUrl: 'https://i.pravatar.cc/150?u=groupmanager', companyId: 'c-main' },
];

let products: Product[] = [
  { id: 'p1', name: 'Arroz Tio Lucas 25kg', description: 'Arroz agulha de alta qualidade.', sku: 'PROD001', price: 15000, kind: ProductKind.GOOD, trackStock: true, unit: 'UN', packaging: [{id: 'pkg1', name: 'Fardo', unit: 'FAR', conversionFactor: 4, price: 58000}], imageUrl: 'https://picsum.photos/seed/arroz/400/300', warehouseId: 'wh-main-general', stockLevel: 120, lot: 'LOTE2024A', expiryDate: '2025-12-31' },
  { id: 'p2', name: 'Óleo Fula 1L', description: 'Óleo vegetal para cozinha.', sku: 'PROD002', price: 1200, kind: ProductKind.GOOD, trackStock: true, unit: 'UN', packaging: [{id: 'pkg2', name: 'Caixa', unit: 'CX', conversionFactor: 12, price: 14000}], imageUrl: 'https://picsum.photos/seed/oleo/400/300', warehouseId: 'wh-main-general', stockLevel: 300, lot: 'LOTE2024B', expiryDate: '2026-06-30' },
  { id: 'p3', name: 'Serviço de Instalação', description: 'Instalação de equipamento standard (2 horas).', sku: 'SERV001', price: 25000, kind: ProductKind.SERVICE, trackStock: false, unit: 'HR', packaging: [], imageUrl: 'https://picsum.photos/seed/servico/400/300', warehouseId: 'wh-main-general' },
  { id: 'p4', name: 'Sumo Compal 1L', description: 'Sumo de Laranja natural.', sku: 'PROD003', price: 900, kind: ProductKind.GOOD, trackStock: true, unit: 'UN', packaging: [{id: 'pkg3', name: 'Grade', unit: 'GRD', conversionFactor: 6, price: 5200}], imageUrl: 'https://picsum.photos/seed/sumo/400/300', warehouseId: 'wh-b1-store', stockLevel: 250, lot: 'LOTE2024C', expiryDate: '2025-03-01' },
  { id: 'p5', name: 'Cimento Portland 50kg', description: 'Cimento para construção civil.', sku: 'PROD004', price: 4500, kind: ProductKind.GOOD, trackStock: true, unit: 'UN', packaging: [], imageUrl: 'https://picsum.photos/seed/cimento/400/300', warehouseId: 'wh-b1-store', stockLevel: 500 },
  { id: 'p6', name: 'Consultoria de Negócios', description: 'Sessão de consultoria estratégica (1 hora).', sku: 'SERV002', price: 50000, kind: ProductKind.SERVICE, trackStock: false, unit: 'HR', packaging: [], imageUrl: 'https://picsum.photos/seed/consultoria/400/300', warehouseId: 'wh-main-general' },
  { id: 'p7', name: 'Caixa de Ferramentas', description: 'Kit completo para reparações.', sku: 'PROD005', price: 35000, kind: ProductKind.GOOD, trackStock: true, unit: 'UN', packaging: [], imageUrl: 'https://picsum.photos/seed/ferramentas/400/300', warehouseId: 'wh-b2-store', stockLevel: 30 },
  { id: 'p8', name: 'Lâmpada LED', description: 'Lâmpada de baixo consumo.', sku: 'PROD006', price: 1500, kind: ProductKind.GOOD, trackStock: true, unit: 'UN', packaging: [], imageUrl: 'https://picsum.photos/seed/lampada/400/300', warehouseId: 'wh-b1s-store', stockLevel: 200 },
];

const deliveries: Delivery[] = [
    { id: 'd1', orderId: 'o1', driver: users.find(u=>u.role === UserRole.DRIVER)!, vehicle: { brand: 'Toyota', model: 'Hilux', licensePlate: 'LD-01-02-AA' }, status: 'Em Trânsito', estimatedDelivery: '14:30', currentLocation: { lat: -8.8368, lng: 13.2343 } },
    { id: 'd2', orderId: 'o2', driver: users.find(u=>u.role === UserRole.DRIVER && u.name.includes('Ana'))!, vehicle: { brand: 'Haojue', model: 'M-150', licensePlate: 'BE-03-04-BB' }, status: 'Aguardando', estimatedDelivery: '16:00', currentLocation: { lat: -12.5763, lng: 13.4155 } },
];

const deliveryCompanies: DeliveryCompany[] = [
    { id: 'c1', name: 'Entrega Rápida Lda', drivers: [users[3]] },
    { id: 'c2', name: 'MotoBoys Express', drivers: [users[4]] },
];

const getDescendantCompanyIds = (companyId: string): string[] => {
    const children = companies.filter(c => c.parentId === companyId);
    let descendants = children.map(c => c.id);
    children.forEach(child => {
        descendants = [...descendants, ...getDescendantCompanyIds(child.id)];
    });
    return descendants;
};

const embedWarehouse = (product: Product): Product => {
    const warehouse = warehouses.find(w => w.id === product.warehouseId);
    return { ...product, warehouse };
};

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
    
    const data = filteredProducts.slice(start, end).map(embedWarehouse);
    return { data, total, page, limit };
  },

  getSellerProducts: async (user: User, filters: { query?: string }, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Product>> => {
    await new Promise(res => setTimeout(res, 500));
    
    let visibleCompanyIds: string[] = [];

    if (user.role === UserRole.GROUP_MANAGER) {
        visibleCompanyIds = [user.companyId, ...getDescendantCompanyIds(user.companyId)];
    } else { // SELLER, MANAGER, ADMIN (who sees everything in this context)
        if (user.role === UserRole.ADMIN) {
             visibleCompanyIds = companies.map(c => c.id);
        } else {
            visibleCompanyIds = [user.companyId];
        }
    }
    
    const companyWarehouses = warehouses.filter(w => visibleCompanyIds.includes(w.companyId));
    const companyWarehouseIds = companyWarehouses.map(w => w.id);
    
    let companyProducts = products.filter(p => companyWarehouseIds.includes(p.warehouseId));

    if (filters.query) {
        const query = filters.query.toLowerCase();
        companyProducts = companyProducts.filter(p => p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query));
    }
    
    const total = companyProducts.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    
    const data = companyProducts.slice(start, end).map(embedWarehouse);
    return { data, total, page, limit };
  },

  addProduct: async (productData: Omit<Product, 'id' | 'imageUrl' | 'packaging'>): Promise<Product> => {
    await new Promise(res => setTimeout(res, 500));
    // FIX: Added missing 'packaging' property to conform to the Product type.
    const newProduct: Product = {
      id: `p${products.length + 1}-${Math.random().toString(16).slice(2)}`,
      imageUrl: `https://picsum.photos/seed/${encodeURIComponent(productData.name)}/400/300`,
      packaging: [],
      ...productData,
    };
    products.unshift(newProduct);
    return embedWarehouse(newProduct);
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
    return newProducts.map(embedWarehouse);
  },

  updateProduct: async (productId: string, productData: Partial<Product>): Promise<Product | undefined> => {
      await new Promise(res => setTimeout(res, 500));
      const productIndex = products.findIndex(p => p.id === productId);
      if (productIndex > -1) {
          products[productIndex] = { ...products[productIndex], ...productData };
          return embedWarehouse(products[productIndex]);
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
    
    const dataWithCompany = filteredUsers.slice(start, end).map(user => {
        const company = companies.find(c => c.id === user.companyId);
        return { ...user, companyName: company?.name || 'N/A' };
    });

    return { data: dataWithCompany, total, page, limit };
  },
  
  getDeliveries: async (): Promise<Delivery[]> => {
    await new Promise(res => setTimeout(res, 500));
    return deliveries;
  },

  getDeliveryCompanies: async (): Promise<DeliveryCompany[]> => {
    await new Promise(res => setTimeout(res, 500));
    return deliveryCompanies;
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
          return embedWarehouse(products[productIndex]);
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
  
  getCompanyHierarchy: async (): Promise<Company[]> => {
    await new Promise(res => setTimeout(res, 300));
    return companies;
  },

  createCompany: async (name: string, parentId: string | null): Promise<Company> => {
    await new Promise(res => setTimeout(res, 500));
    const newCompany: Company = {
        id: `c-${Date.now()}`,
        name,
        parentId,
    };
    companies.push(newCompany);

    // Create default warehouses
    const newStoreWarehouse: Warehouse = {
        id: `wh-${newCompany.id}-store`,
        name: `Armazém da Loja (${name})`,
        location: 'N/D',
        type: WarehouseType.STORE,
        companyId: newCompany.id,
    };
    const newGeneralWarehouse: Warehouse = {
        id: `wh-${newCompany.id}-general`,
        name: `Armazém Geral (${name})`,
        location: 'N/D',
        type: WarehouseType.GENERAL,
        companyId: newCompany.id,
    };
    warehouses.push(newStoreWarehouse, newGeneralWarehouse);

    return newCompany;
  },

  getWarehouses: async (): Promise<Warehouse[]> => {
    await new Promise(res => setTimeout(res, 200));
    return warehouses;
  },

  getVisibleWarehouses: async (user: User): Promise<Warehouse[]> => {
    await new Promise(res => setTimeout(res, 200));
    
    let visibleCompanyIds: string[] = [];
    if (user.role === UserRole.GROUP_MANAGER) {
        visibleCompanyIds = [user.companyId, ...getDescendantCompanyIds(user.companyId)];
    } else if (user.role === UserRole.ADMIN) {
        return warehouses;
    } else {
        visibleCompanyIds = [user.companyId];
    }
    
    return warehouses.filter(w => visibleCompanyIds.includes(w.companyId));
  },
};

export default api;
