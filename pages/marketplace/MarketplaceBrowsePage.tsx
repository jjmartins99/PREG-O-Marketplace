import React, { useEffect, useState, useMemo } from 'react';
import { Product, ProductFilters, ProductKind, Warehouse } from '../../types';
import mockApi from '../../services/mockApi';
import { Pagination } from '../../components/Pagination';
import { useCart } from '../../hooks/useCart';

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
    const { addToCart } = useCart();

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group flex flex-col">
            <div className="h-48 overflow-hidden">
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold text-gray-800 truncate flex-grow">{product.name}</h3>
                <p className="text-sm text-gray-500 mb-3 h-10">{product.description}</p>
                <div className="flex justify-between items-center mt-auto">
                    <span className="text-xl font-bold text-primary-600">{new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(product.price)}</span>
                    <button 
                        onClick={() => addToCart(product)}
                        className="bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-600 transition-colors"
                    >
                        Adicionar
                    </button>
                </div>
            </div>
        </div>
    );
};

const FilterPanel: React.FC<{ filters: ProductFilters, onFilterChange: (filters: ProductFilters) => void }> = ({ filters, onFilterChange }) => {
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

    useEffect(() => {
        mockApi.getWarehouses().then(setWarehouses);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        onFilterChange({ ...filters, [name]: value });
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
            <div className="w-full md:flex-1">
                <input
                    type="text"
                    name="query"
                    value={filters.query || ''}
                    onChange={handleInputChange}
                    placeholder="Pesquisar por nome ou SKU..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
            </div>
            <div className="w-full md:w-auto flex gap-4">
                <select name="kind" value={filters.kind} onChange={handleInputChange} className="w-full md:w-40 px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500">
                    <option value="all">Todo Tipo</option>
                    <option value={ProductKind.GOOD}>Mercadoria</option>
                    <option value={ProductKind.SERVICE}>Serviço</option>
                </select>
                <select name="warehouseId" value={filters.warehouseId} onChange={handleInputChange} className="w-full md:w-40 px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500">
                    <option value="all">Todo Armazém</option>
                    {warehouses.map(wh => <option key={wh.id} value={wh.id}>{wh.name}</option>)}
                </select>
                <select name="sortBy" value={filters.sortBy} onChange={handleInputChange} className="w-full md:w-40 px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500">
                    <option value="name-asc">Ordenar por</option>
                    <option value="price-asc">Preço (Baixo > Alto)</option>
                    <option value="price-desc">Preço (Alto > Baixo)</option>
                    <option value="name-asc">Nome (A-Z)</option>
                    <option value="name-desc">Nome (Z-A)</option>
                </select>
            </div>
        </div>
    );
};


export const MarketplaceBrowsePage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [filters, setFilters] = useState<ProductFilters>({ kind: 'all', warehouseId: 'all', sortBy: 'name-asc', query: '' });

    const debouncedFilters = useMemo(() => filters, [filters]);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            const limit = 8;
            const data = await mockApi.getProducts(debouncedFilters, currentPage, limit);
            setProducts(data.data);
            setTotalPages(Math.ceil(data.total / limit));
            setLoading(false);
        };
        const timer = setTimeout(() => {
            fetchProducts();
        }, 300); // Debounce search input

        return () => clearTimeout(timer);
    }, [debouncedFilters, currentPage]);

    const handleFilterChange = (newFilters: ProductFilters) => {
        setCurrentPage(1);
        setFilters(newFilters);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Marketplace</h1>
            <FilterPanel filters={filters} onFilterChange={handleFilterChange} />
            
            {loading ? (
                 <div className="text-center py-10">A carregar produtos...</div>
            ) : products.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </>
            ) : (
                <div className="text-center py-10 bg-white rounded-lg shadow-sm">
                    <h3 className="text-xl font-semibold text-gray-700">Nenhum produto encontrado</h3>
                    <p className="text-gray-500 mt-2">Tente ajustar os seus filtros de pesquisa.</p>
                </div>
            )}
        </div>
    );
};