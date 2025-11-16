export enum UserRole {
  ADMIN = 'Administrador',
  MANAGER = 'Gerente',
  SUPERVISOR = 'Supervisor',
  SELLER = 'Vendedor',
  BUYER = 'Comprador',
  DRIVER = 'Motorista'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
}

export enum ProductKind {
  GOOD = 'GOOD',
  SERVICE = 'SERVICE',
}

export interface Packaging {
  id: string;
  name: string; // e.g., Caixa, Grade
  unit: string; // e.g., CX, GRD
  conversionFactor: number;
  barcode?: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  barcode?: string;
  price: number;
  kind: ProductKind;
  trackStock: boolean;
  unit: string; // UN, KG, L, M
  packaging: Packaging[];
  imageUrl: string;
  warehouseId: string;
  stockLevel?: number; // Only for goods
  lot?: string; // Only for goods
  expiryDate?: string; // Only for goods
}

export interface CartItem extends Product {
    quantity: number;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
}

export interface Order {
  id: string;
  customerName: string;
  status: 'Pendente' | 'Processando' | 'Enviado' | 'Entregue' | 'Cancelado';
  date: string;
  total: number;
  items: { productId: string; quantity: number; price: number }[];
}

export interface Delivery {
    id: string;
    orderId: string;
    driver: {
        id: string;
        name: string;
        avatarUrl: string;
    };
    vehicle: {
        brand: string;
        model: string;
        licensePlate: string;
    };
    status: 'Aguardando' | 'Em Trânsito' | 'Entregue';
    estimatedDelivery: string;
    currentLocation: { lat: number; lng: number };
}

export interface Company {
    id: string;
    name: string;
    drivers: User[];
}

// API and Pagination Types
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}

export interface ProductFilters {
    query?: string;
    kind?: ProductKind | 'all';
    warehouseId?: string | 'all';
    sortBy?: 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';
}

export interface UserFilters {
    query?: string;
    role?: UserRole | 'all';
}