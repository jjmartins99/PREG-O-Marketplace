
import React, { useEffect, useState, useMemo } from 'react';
import { Product, Warehouse, User } from '../../types';
import mockApi from '../../services/mockApi';
import { useAuth } from '../../hooks/useAuth';
import { Pagination } from '../../components/Pagination';
import { AdjustStockModal } from '../../components/modals/AdjustStockModal';
import { useSettings } from '../../hooks/useSettings';
import { TransferStockModal } from '../../components/modals/TransferStockModal';
import { WarehouseDetailsModal } from '../../components/modals/WarehouseDetailsModal';
import { ChevronDownIcon } from '../../components/Icons';
import { LotDetailsModal } from '../../components/modals/LotDetailsModal';
import { ConfirmationModal } from '../../components/modals/ConfirmationModal';

const getExpiryStatus = (expiryDate: string | undefined, warningDays: number): { className: string; label: string; isExpired: boolean } => {
    if (!expiryDate) return { className: 'bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-500/20', label: 'N/A', isExpired: false };

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        
        const dateParts = expiryDate.split('-').map(part => parseInt(part, 10));
        if (dateParts.length !== 3 || dateParts.some(isNaN)) {
             return { className: 'bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-500/20', label: expiryDate, isExpired: false };
        }
        const expiry = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
        expiry.setHours(0, 0, 0, 0);

        if (isNaN(expiry.getTime())) return { className: 'bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-500/20', label: expiryDate, isExpired: false };

        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            return { className: 'bg-red-100 text-red-800 ring-1 ring-inset ring-red-600/20', label: expiryDate, isExpired: true };
        }
        if (diffDays <= warningDays) {
            return { className: 'bg-yellow-100 text-yellow-800 ring-1 ring-inset ring-yellow-600/20', label: expiryDate, isExpired: false };
        }
        return { className: 'bg-green-100 text-green-800 ring-1 ring-inset ring-green-600/20', label: expiryDate, isExpired: false };
    } catch (e) {
        return { className: 'bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-500/20', label: expiryDate, isExpired: false };
    }
};

const InventoryRow: React.FC<{
    product: Product;
    onAdjustClick: (product: Product) => void;
    onTransferClick: (product: Product) => void;
    onViewWarehouseClick: (warehouse: Warehouse) => void;
    onViewLotClick: (product: Product) => void;
    onDeleteClick: (product: Product) => void;
    expiryWarningDays: number;
    isActionMenuOpen: boolean;
    onToggleActionMenu: () => void;
}> = ({ product, onAdjustClick, onTransferClick, onViewWarehouseClick, onViewLotClick, onDeleteClick, expiryWarningDays, isActionMenuOpen, onToggleActionMenu }) => {
    const expiryInfo = getExpiryStatus(product.expiryDate, expiryWarningDays);
    
    return (
        <tr className={`border-b ${expiryInfo.isExpired ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'} transition-colors duration-150`}>
            <td className="py-3 px-6 text-sm text-gray-700 flex items-center">
                <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-md object-cover mr-4"/>
                <div>
                    <div>{product.name}</div>
                    <div className="text-xs text-gray-500">{product.sku}</div>
                </div>
            </td>
            <td className="py-3 px-6 text-sm text-gray-700">{product.warehouse ? `${product.warehouse.name} (${product.warehouse.type})` : 'N/A'}</td>
            <td className="py-3 px-6 text-sm text-gray-700 font-bold text-center">{product.stockLevel}</td>
            <td className="py-3 px-6 text-sm text-gray-700">{product.lot || 'N/A'}</td>
            <td className="py-3 px-6 text-sm text-gray-700">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${expiryInfo.className}`}>
                    {expiryInfo.label}
                </span>
            </td>
            <td className="py-3 px-6 text-sm">
                 <div className="relative">
                    <button
                        onClick={onToggleActionMenu}
                        className="flex items-center px-3 py-1.5 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        Ações
                        <ChevronDownIcon className="w-4 h-4 ml-2 -mr-1" />
                    </button>
                    {isActionMenuOpen && (
                        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                            <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                <a href="#" onClick={(e) => { e.preventDefault(); onAdjustClick(product); onToggleActionMenu(); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Ajustar Stock</a>
                                <a href="#" onClick={(e) => { e.preventDefault(); onTransferClick(product); onToggleActionMenu(); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Transferir Stock</a>
                                {product.warehouse && <a href="#" onClick={(e) => { e.preventDefault(); onViewWarehouseClick(product.warehouse!); onToggleActionMenu(); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Ver Armazém</a>}
                                {product.lot && <a href="#" onClick={(e) => { e.preventDefault(); onViewLotClick(product); onToggleActionMenu(); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Ver Lote</a>}
                                <div className="border-t border-gray-100 my-1"></div>
                                <a href="#" onClick={(e) => { e.preventDefault(); onDeleteClick(product); onToggleActionMenu(); }} className="block px-4 py-2 text-sm text-red-700 hover:bg-red-50" role="menuitem">Eliminar</a>
                            </div>
                        </div>
                    )}
                </div>
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
    const [isWarehouseDetailsOpen, setIsWarehouseDetailsOpen] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
    const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
    const [isLotDetailsOpen, setIsLotDetailsOpen] = useState(false);
    const [selectedProductForLot, setSelectedProductForLot] = useState<Product | null>(null);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            if(!user) return;
            setLoading(true);
            const data = await mockApi.getSellerProducts(user, { query: '' }, 1, 1000); // Fetch all for user scope
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

    const handleViewWarehouseDetails = (warehouse: Warehouse) => {
        setSelectedWarehouse(warehouse);
        setIsWarehouseDetailsOpen(true);
    };

    const handleViewLotDetails = (product: Product) => {
        setSelectedProductForLot(product);
        setIsLotDetailsOpen(true);
    };

    const handleOpenDeleteModal = (product: Product) => {
        setProductToDelete(product);
        setIsConfirmDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!productToDelete) return;
        setIsDeleting(true);
        await mockApi.deleteProduct(productToDelete.id);
        setIsDeleting(false);
        setIsConfirmDeleteOpen(false);
        setProductToDelete(null);
        setRefreshKey(k => k + 1);
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
                                   paginatedProducts.map(p => <InventoryRow 
                                        key={p.id} 
                                        product={p} 
                                        onAdjustClick={handleOpenAdjustModal} 
                                        onTransferClick={handleOpenTransferModal} 
                                        onViewWarehouseClick={handleViewWarehouseDetails} 
                                        onViewLotClick={handleViewLotDetails}
                                        onDeleteClick={handleOpenDeleteModal}
                                        expiryWarningDays={expiryWarningDays} 
                                        isActionMenuOpen={openActionMenuId === p.id}
                                        onToggleActionMenu={() => setOpenActionMenuId(prevId => (prevId === p.id ? null : p.id))}
                                   />)
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
                user={user}
                onStockTransferred={handleStockTransferred}
            />
            <WarehouseDetailsModal
                isOpen={isWarehouseDetailsOpen}
                onClose={() => setIsWarehouseDetailsOpen(false)}
                warehouse={selectedWarehouse}
            />
            <LotDetailsModal
                isOpen={isLotDetailsOpen}
                onClose={() => setIsLotDetailsOpen(false)}
                product={selectedProductForLot}
            />
            <ConfirmationModal
                isOpen={isConfirmDeleteOpen}
                onClose={() => setIsConfirmDeleteOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Eliminar Produto"
                message={`Tem a certeza que deseja eliminar o produto "${productToDelete?.name}"? Esta ação não pode ser desfeita.`}
                confirmText="Eliminar"
                isConfirming={isDeleting}
            />
        </>
    );
};
