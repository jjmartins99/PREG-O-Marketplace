import React, { useEffect, useState, useMemo } from 'react';
import { Product } from '../../types';
import mockApi, { MOCK_WAREHOUSES } from '../../services/mockApi';
import { useAuth } from '../../hooks/useAuth';
import { Pagination } from '../../components/Pagination';
import { AdjustStockModal } from '../../components/modals/AdjustStockModal';

const InventoryRow: React.FC<{ product: Product; onAdjustClick: (product: Product) => void }> = ({ product, onAdjustClick }) => (
    <tr className="border-b hover:bg-gray-50">
        <td className="py-3 px-6 text-sm text-gray-700 flex items-center">
            <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-md object-cover mr-4"/>
            <div>
                <div>{product.name}</div>
                <div className="text-xs text-gray-500">{product.sku}</div>
            </div>
        </td>
        <td className="py-3 px-6 text-sm text-gray-700">{MOCK_WAREHOUSES.find(w => w.id === product.warehouseId)?.name || 'N/A'}</td>
        <td className="py-3 px-6 text-sm text-gray-700 font-bold text-center">{product.stockLevel}</td>
        <td className="py-3 px-6 text-sm text-gray-700">{product.lot || 'N/A'}</td>
        <td className="py-3 px-6 text-sm text-gray-700">{product.expiryDate || 'N/A'}</td>
        <td className="py-3 px-6 text-sm">
             <button onClick={() => onAdjustClick(product)} className="font-medium text-primary-600 hover:underline mr-4">Ajustar</button>
             <button className="font-medium text-gray-500 hover:underline">Transferir</button>
        </td>
    </tr>
);

export const InventoryPage: React.FC = () => {
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            if(!user) return;
            setLoading(true);
            // Fetch all products for inventory view, then filter client-side
            const data = await mockApi.getProducts({ query: '' }, 1, 100);
            const stockableProducts = data.data.filter(p => p.trackStock);
            setAllProducts(stockableProducts);
            setLoading(false);
        };
        if (user) fetchProducts();
    }, [user]);

    const filteredProducts = useMemo(() => {
        return allProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [allProducts, searchQuery]);

    const limit = 10;
    const totalPages = Math.ceil(filteredProducts.length / limit);
    const paginatedProducts = filteredProducts.slice((currentPage - 1) * limit, currentPage * limit);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleOpenAdjustModal = (product: Product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleStockUpdated = (updatedProduct: Product) => {
        setAllProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    };

    return (
        <>
            <div>
                <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
                    <h1 className="text-3xl font-bold text-gray-800">Gestão de Inventário</h1>
                    <div className="flex space-x-2 items-center">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Pesquisar por nome ou SKU..."
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Produto</th>
                                    <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Armazém</th>
                                    <th className="py-3 px-6 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock Atual</th>
                                    <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Lote</th>
                                    <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Validade</th>
                                    <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600 text-sm font-light">
                                {loading ? (
                                    <tr><td colSpan={6} className="text-center py-6">A carregar inventário...</td></tr>
                                ) : paginatedProducts.length > 0 ? (
                                   paginatedProducts.map(p => <InventoryRow key={p.id} product={p} onAdjustClick={handleOpenAdjustModal} />)
                                ) : (
                                    <tr><td colSpan={6} className="text-center py-6">Nenhum produto encontrado.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {paginatedProducts.length > 0 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
                </div>
            </div>
            <AdjustStockModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={selectedProduct}
                onStockUpdated={handleStockUpdated}
            />
        </>
    );
};
