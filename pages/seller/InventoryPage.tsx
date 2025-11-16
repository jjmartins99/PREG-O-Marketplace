import React, { useEffect, useState, useMemo } from 'react';
import { Product } from '../../types';
import mockApi, { MOCK_WAREHOUSES } from '../../services/mockApi';
import { useAuth } from '../../hooks/useAuth';
import { Pagination } from '../../components/Pagination';
import { AdjustStockModal } from '../../components/modals/AdjustStockModal';
import { useSettings } from '../../hooks/useSettings';
import { TransferStockModal } from '../../components/modals/TransferStockModal';

const getExpiryStatus = (expiryDate: string | undefined, warningDays: number): { className: string; label: string } => {
    if (!expiryDate) return { className: 'text-gray-500', label: 'N/A' };

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        const expiry = new Date(expiryDate);
         if (isNaN(expiry.getTime())) return { className: '', label: expiryDate };

        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            return { className: 'bg-red-100 text-red-800', label: expiryDate };
        }
        if (diffDays <= warningDays) {
            return { className: 'bg-yellow-100 text-yellow-800', label: expiryDate };
        }
        return { className: 'bg-green-100 text-green-800', label: expiryDate };
    } catch (e) {
        return { className: '', label: expiryDate };
    }
};

const InventoryRow: React.FC<{ product: Product; onAdjustClick: (product: Product) => void; onTransferClick: (product: Product) => void; expiryWarningDays: number; }> = ({ product, onAdjustClick, onTransferClick, expiryWarningDays }) => {
    const expiryInfo = getExpiryStatus(product.expiryDate, expiryWarningDays);
    
    return (
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
            <td className="py-3 px-6 text-sm text-gray-700">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${expiryInfo.className}`}>
                    {expiryInfo.label}
                </span>
            </td>
            <td className="py-3 px-6 text-sm">
                 <button onClick={() => onAdjustClick(product)} className="font-medium text-primary-600 hover:underline mr-4">Ajustar</button>
                 <button onClick={() => onTransferClick(product)} className="font-medium text-primary-600 hover:underline">Transferir</button>
            </td>
        </tr>
    );
};


export const InventoryPage: React.FC = () => {
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const { expiryWarningDays } = useSettings();
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [transferringProduct, setTransferringProduct] = useState<Product | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const fetchProducts = async () => {
            if(!user) return;
            setLoading(true);
            const data = await mockApi.getProducts({ query: '' }, 1, 1000); // Fetch all
            const stockableProducts = data.data.filter(p => p.trackStock);
            setAllProducts(stockableProducts);
            setLoading(false);
        };
        if (user) fetchProducts();
    }, [user, refreshKey]);

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
        setIsAdjustModalOpen(true);
    };

    const handleStockUpdated = (updatedProduct: Product) => {
        setAllProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    };

    const handleOpenTransferModal = (product: Product) => {
        setTransferringProduct(product);
        setIsTransferModalOpen(true);
    };

    const handleStockTransferred = () => {
        setRefreshKey(oldKey => oldKey + 1);
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
                                   paginatedProducts.map(p => <InventoryRow key={p.id} product={p} onAdjustClick={handleOpenAdjustModal} onTransferClick={handleOpenTransferModal} expiryWarningDays={expiryWarningDays} />)
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
                isOpen={isAdjustModalOpen}
                onClose={() => setIsAdjustModalOpen(false)}
                product={selectedProduct}
                onStockUpdated={handleStockUpdated}
            />
            <TransferStockModal
                isOpen={isTransferModalOpen}
                onClose={() => setIsTransferModalOpen(false)}
                product={transferringProduct}
                onStockTransferred={handleStockTransferred}
            />
        </>
    );
};