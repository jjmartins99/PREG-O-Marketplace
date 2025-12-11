
import React, { useEffect, useState, useMemo } from 'react';
import { Product, Warehouse } from '../../types';
import mockApi from '../../services/mockApi';
import { useAuth } from '../../hooks/useAuth';
import { Pagination } from '../../components/Pagination';
import { AdjustStockModal } from '../../components/modals/AdjustStockModal';
import { useSettings } from '../../hooks/useSettings';
import { TransferStockModal } from '../../components/modals/TransferStockModal';
import { WarehouseDetailsModal } from '../../components/modals/WarehouseDetailsModal';
import { ChevronDownIcon, DownloadIcon, AlertTriangleIcon, XIcon, MapPinIcon, BellIcon, CheckCircleIcon } from '../../components/Icons';
import { LotDetailsModal } from '../../components/modals/LotDetailsModal';
import { ConfirmationModal } from '../../components/modals/ConfirmationModal';
import { StockLocationModal } from '../../components/modals/StockLocationModal';

const getDaysUntilExpiry = (expiryDate?: string): number | null => {
    if (!expiryDate) return null;
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        
        const dateParts = expiryDate.split('-').map(part => parseInt(part, 10));
        if (dateParts.length !== 3 || dateParts.some(isNaN)) {
             return null;
        }
        const expiry = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
        expiry.setHours(0, 0, 0, 0);

        if (isNaN(expiry.getTime())) return null;

        const diffTime = expiry.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch (e) {
        return null;
    }
};

const getExpiryStatus = (expiryDate: string | undefined, warningDays: number): { className: string; label: string; isExpired: boolean; isExpiringSoon: boolean; title: string } => {
    const diffDays = getDaysUntilExpiry(expiryDate);

    if (diffDays === null) return { 
        className: 'bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-500/20', 
        label: expiryDate || 'N/A', 
        isExpired: false,
        isExpiringSoon: false,
        title: 'Validade não aplicável'
    };
    
    if (diffDays < 0) {
        const days = Math.abs(diffDays);
        return { 
            className: 'bg-red-100 text-red-800 ring-1 ring-inset ring-red-600/20', 
            label: expiryDate!, 
            isExpired: true,
            isExpiringSoon: false,
            title: `Expirou há ${days} dia${days !== 1 ? 's' : ''}`
        };
    }
    if (diffDays <= warningDays) {
        return { 
            className: 'bg-yellow-100 text-yellow-800 ring-1 ring-inset ring-yellow-600/20', 
            label: expiryDate!, 
            isExpired: false,
            isExpiringSoon: true,
            title: `Expira em ${diffDays} dia${diffDays !== 1 ? 's' : ''}`
        };
    }
    return { 
        className: 'bg-green-100 text-green-800 ring-1 ring-inset ring-green-600/20', 
        label: expiryDate!, 
        isExpired: false,
        isExpiringSoon: false,
        title: `Válido por mais ${diffDays} dias`
    };
};

const InventoryRow: React.FC<{
    product: Product;
    onAdjustClick: (product: Product) => void;
    onTransferClick: (product: Product) => void;
    onViewWarehouseClick: (warehouse: Warehouse) => void;
    onViewLotClick: (product: Product) => void;
    onDeleteClick: (product: Product) => void;
    onViewLocationsClick: (product: Product) => void;
    otherLocationsCount: number;
    expiryWarningDays: number;
    isActionMenuOpen: boolean;
    onToggleActionMenu: () => void;
    lowStockThreshold: number;
}> = ({ product, onAdjustClick, onTransferClick, onViewWarehouseClick, onViewLotClick, onDeleteClick, onViewLocationsClick, otherLocationsCount, expiryWarningDays, isActionMenuOpen, onToggleActionMenu, lowStockThreshold }) => {
    const expiryInfo = getExpiryStatus(product.expiryDate, expiryWarningDays);
    const isLowStock = (product.stockLevel || 0) <= lowStockThreshold;
    
    return (
        <tr className={`border-b ${expiryInfo.isExpired ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'} transition-colors duration-150`}>
            <td className="py-3 px-6 text-sm text-gray-700 flex items-center">
                <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-md object-cover mr-4"/>
                <div>
                    <div>{product.name}</div>
                    <div className="text-xs text-gray-500">{product.sku}</div>
                </div>
            </td>
            <td className="py-3 px-6 text-sm text-gray-700">
                <div className="flex flex-col">
                    <span>{product.warehouse ? `${product.warehouse.name}` : 'N/A'}</span>
                    <span className="text-xs text-gray-500 mb-1">{product.warehouse ? product.warehouse.type : ''}</span>
                    {otherLocationsCount > 0 && (
                        <button 
                            onClick={(e) => { e.preventDefault(); onViewLocationsClick(product); }}
                            className="flex items-center text-xs font-semibold text-primary-600 hover:text-primary-800 hover:underline w-fit"
                        >
                            <MapPinIcon className="w-3 h-3 mr-1" />
                            + {otherLocationsCount} {otherLocationsCount === 1 ? 'local' : 'locais'}
                        </button>
                    )}
                </div>
            </td>
            <td className="py-3 px-6 text-sm text-gray-700 font-bold text-center">
                <span className={isLowStock ? 'text-red-600' : 'text-gray-700'}>{product.stockLevel}</span>
                {isLowStock && <span className="block text-[10px] text-red-500 font-normal">Stock Baixo</span>}
            </td>
            <td className="py-3 px-6 text-sm text-gray-700">{product.lot || 'N/A'}</td>
            <td className="py-3 px-6 text-sm text-gray-700" title={expiryInfo.title}>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${expiryInfo.className} cursor-help flex items-center w-fit`}>
                    {expiryInfo.label}
                    {(expiryInfo.isExpired || expiryInfo.isExpiringSoon) && (
                        <AlertTriangleIcon className="w-3 h-3 ml-1.5" />
                    )}
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
                                {otherLocationsCount > 0 && <a href="#" onClick={(e) => { e.preventDefault(); onViewLocationsClick(product); onToggleActionMenu(); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Ver Locais ({otherLocationsCount + 1})</a>}
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
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [warehouseFilter, setWarehouseFilter] = useState('all');
    const [expiryFilter, setExpiryFilter] = useState('all');
    const [stockFilter, setStockFilter] = useState('all');

    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const { expiryWarningDays, lowStockThreshold } = useSettings();
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
    
    // Notification State
    const [notification, setNotification] = useState<{message: string, type: 'success' | 'warning'} | null>(null);
    
    // New state for location modal
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [selectedProductForLocation, setSelectedProductForLocation] = useState<Product | null>(null);

    const showNotification = (message: string, type: 'success' | 'warning') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };

    useEffect(() => {
        const fetchProductsAndWarehouses = async () => {
            if(!user) return;
            setLoading(true);
            
            const [productsData, warehousesData] = await Promise.all([
                mockApi.getSellerProducts(user, { query: '' }, 1, 1000),
                mockApi.getVisibleWarehouses(user)
            ]);
            
            const stockableProducts = productsData.data.filter(p => p.trackStock);
            setAllProducts(stockableProducts);
            setWarehouses(warehousesData);
            setLoading(false);
        };
        
        if (user) fetchProductsAndWarehouses();
    }, [user, refreshKey]);

    const { filteredProducts, counts } = useMemo(() => {
        // 1. Base filtering (Search + Warehouse)
        const baseFiltered = allProducts.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesWarehouse = warehouseFilter === 'all' || p.warehouseId === warehouseFilter;
            return matchesSearch && matchesWarehouse;
        });

        // 2. Calculate counts based on baseFiltered to show relevant stats
        const currentCounts = {
            lowStock: 0,
            outOfStock: 0,
            expired: 0,
            expiringSoon: 0,
        };

        baseFiltered.forEach(p => {
             const stock = p.stockLevel || 0;
             if (stock <= lowStockThreshold) currentCounts.lowStock++;
             if (stock === 0) currentCounts.outOfStock++;

             const days = getDaysUntilExpiry(p.expiryDate);
             if (days !== null) {
                 if (days < 0) currentCounts.expired++;
                 else if (days >= 0 && days <= expiryWarningDays) currentCounts.expiringSoon++;
             }
        });

        // 3. Apply specific status filters
        const finalResult = baseFiltered.filter(p => {
            let matchesExpiry = true;
            if (expiryFilter !== 'all') {
                const days = getDaysUntilExpiry(p.expiryDate);
                if (expiryFilter === 'expired') {
                    matchesExpiry = days !== null && days < 0;
                } else if (expiryFilter === 'expiring_soon') {
                    matchesExpiry = days !== null && days >= 0 && days <= expiryWarningDays;
                } else if (expiryFilter === 'valid') {
                    matchesExpiry = days === null || days > expiryWarningDays;
                }
            }

            let matchesStock = true;
            if (stockFilter === 'low_stock') {
                matchesStock = (p.stockLevel || 0) <= lowStockThreshold;
            } else if (stockFilter === 'out_of_stock') {
                matchesStock = (p.stockLevel || 0) === 0;
            }

            return matchesExpiry && matchesStock;
        });

        return { filteredProducts: finalResult, counts: currentCounts };
    }, [allProducts, searchQuery, warehouseFilter, expiryFilter, stockFilter, expiryWarningDays, lowStockThreshold]);

    const limit = 10;
    const totalPages = Math.ceil(filteredProducts.length / limit);
    const paginatedProducts = filteredProducts.slice((currentPage - 1) * limit, currentPage * limit);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleWarehouseFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setWarehouseFilter(e.target.value);
        setCurrentPage(1);
    };

    const handleExpiryFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setExpiryFilter(e.target.value);
        setCurrentPage(1);
    };

    const handleStockFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStockFilter(e.target.value);
        setCurrentPage(1);
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setWarehouseFilter('all');
        setExpiryFilter('all');
        setStockFilter('all');
        setCurrentPage(1);
    };

    const handleOpenAdjustModal = (product: Product) => {
        setSelectedProduct(product);
        setIsAdjustModalOpen(true);
    };

    const handleStockUpdated = (updatedProduct: Product) => {
        setAllProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
        
        // Auto-trigger notification if stock drops below threshold
        if ((updatedProduct.stockLevel || 0) <= lowStockThreshold) {
            showNotification(`Alerta: O stock de "${updatedProduct.name}" ficou abaixo do limite (${updatedProduct.stockLevel} un).`, 'warning');
        } else {
            showNotification(`Stock de "${updatedProduct.name}" atualizado com sucesso.`, 'success');
        }
    };

    const handleNotifyLowStock = () => {
        const lowStockCount = counts.lowStock + counts.outOfStock;
        if (lowStockCount > 0) {
            showNotification(`Notificação enviada: ${lowStockCount} produtos com stock baixo ou esgotado identificados.`, 'success');
        } else {
            showNotification('Inventário saudável! Nenhum alerta necessário.', 'success');
        }
    };

    const handleOpenTransferModal = (product: Product) => {
        setTransferringProduct(product);
        setIsTransferModalOpen(true);
    };

    const handleStockTransferred = (sourceProduct: Product, quantitySent: number) => {
        setRefreshKey(oldKey => oldKey + 1);
        
        const currentStock = sourceProduct.stockLevel || 0;
        const newStock = currentStock - quantitySent;

        if (newStock <= lowStockThreshold) {
            showNotification(`Alerta: O stock de "${sourceProduct.name}" ficou abaixo do limite (${newStock} un).`, 'warning');
        } else {
            showNotification('Transferência de stock realizada com sucesso.', 'success');
        }
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
        showNotification('Produto removido com sucesso.', 'success');
    };
    
    const handleViewLocations = (product: Product) => {
        setSelectedProductForLocation(product);
        setIsLocationModalOpen(true);
    };

    const handleExportCSV = () => {
        if (filteredProducts.length === 0) {
            alert("Não há dados para exportar.");
            return;
        }

        const headers = ["Produto", "SKU", "Preço", "Armazém", "Stock Atual", "Lote", "Validade", "Estado"];
        
        const csvRows = filteredProducts.map(p => {
            const name = `"${p.name.replace(/"/g, '""')}"`;
            const sku = `"${p.sku.replace(/"/g, '""')}"`;
            const price = p.price;
            const warehouse = `"${(p.warehouse?.name || '').replace(/"/g, '""')}"`;
            const stock = p.stockLevel || 0;
            const lot = `"${(p.lot || '').replace(/"/g, '""')}"`;
            const expiry = `"${p.expiryDate || ''}"`;
            
            let status = "OK";
            if (stock === 0) status = "Sem Stock";
            else if (stock <= lowStockThreshold) status = "Stock Baixo";
            
            const days = getDaysUntilExpiry(p.expiryDate);
            if (days !== null) {
                if (days < 0) status = status === "OK" ? "Expirado" : `${status} / Expirado`;
                else if (days <= expiryWarningDays) status = status === "OK" ? "A Expirar" : `${status} / A Expirar`;
            }
            
            const statusCol = `"${status}"`;
            
            return [name, sku, price, warehouse, stock, lot, expiry, statusCol].join(",");
        });

        const csvContent = [headers.join(","), ...csvRows].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `inventario_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const hasActiveFilters = searchQuery !== '' || warehouseFilter !== 'all' || expiryFilter !== 'all' || stockFilter !== 'all';

    return (
        <>
            <div className="relative">
                <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
                    <h1 className="text-3xl font-bold text-gray-800">Gestão de Inventário</h1>
                    <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto items-center">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Pesquisar por nome ou SKU..."
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 w-full md:w-auto"
                        />
                        <select 
                            value={warehouseFilter}
                            onChange={handleWarehouseFilterChange}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 w-full md:w-auto"
                        >
                            <option value="all">Todos Armazéns</option>
                            {warehouses.map(wh => (
                                <option key={wh.id} value={wh.id}>{wh.name}</option>
                            ))}
                        </select>
                        <select
                            value={expiryFilter}
                            onChange={handleExpiryFilterChange}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 w-full md:w-auto"
                        >
                            <option value="all">Validade: Todos</option>
                            <option value="valid">Válidos</option>
                            <option value="expiring_soon">A Expirar Brevemente ({counts.expiringSoon})</option>
                            <option value="expired">Expirado ({counts.expired})</option>
                        </select>
                        <select
                            value={stockFilter}
                            onChange={handleStockFilterChange}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 w-full md:w-auto"
                        >
                            <option value="all">Stock: Todos</option>
                            <option value="low_stock">Stock Baixo ({counts.lowStock})</option>
                            <option value="out_of_stock">Sem Stock ({counts.outOfStock})</option>
                        </select>
                         {hasActiveFilters && (
                            <button
                                onClick={handleClearFilters}
                                className="px-4 py-2 text-sm text-red-600 hover:text-red-800 hover:underline"
                            >
                                Limpar Filtros
                            </button>
                        )}
                        <button
                            onClick={handleExportCSV}
                            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 w-full md:w-auto"
                            title="Exportar lista filtrada para CSV"
                        >
                            <DownloadIcon className="w-5 h-5 md:mr-2" />
                            <span className="md:inline">Exportar</span>
                        </button>
                        <button
                            onClick={handleNotifyLowStock}
                            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 w-full md:w-auto ml-2"
                            title="Enviar alerta de stock baixo"
                        >
                            <BellIcon className="w-5 h-5 md:mr-2" />
                            <span className="md:inline">Alertar Stock</span>
                        </button>
                    </div>
                </div>

                {counts.expired > 0 && expiryFilter !== 'expired' && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg shadow-sm flex flex-col md:flex-row justify-between items-center animate-fade-in">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="flex-shrink-0">
                                <AlertTriangleIcon className="h-5 w-5 text-red-500" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-red-800">
                                    Atenção: Foram encontrados <span className="font-bold">{counts.expired}</span> produtos expirados na lista atual.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setExpiryFilter('expired')}
                            className="w-full md:w-auto ml-0 md:ml-4 px-4 py-2 bg-red-100 text-red-800 text-sm font-semibold rounded hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors whitespace-nowrap"
                        >
                            Ver Expirados
                        </button>
                    </div>
                )}

                {expiryFilter === 'expired' && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                        <div className="flex justify-between items-center">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <AlertTriangleIcon className="h-5 w-5 text-red-400" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">
                                        Está a visualizar produtos expirados. Considere remover estes itens do inventário ou ajustá-los.
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setExpiryFilter('all')}
                                className="text-sm text-red-700 underline hover:text-red-900 whitespace-nowrap ml-4"
                            >
                                Limpar Filtro
                            </button>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Produto</th>
                                    <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Armazém / Local</th>
                                    <th className="py-3 px-6 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock</th>
                                    <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Lote</th>
                                    <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Validade</th>
                                    <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600 text-sm font-light">
                                {loading ? (
                                    <tr><td colSpan={6} className="text-center py-6">A carregar inventário...</td></tr>
                                ) : paginatedProducts.length > 0 ? (
                                   paginatedProducts.map(p => {
                                       // Check for same SKU in other warehouses/locations
                                       const otherLocationsCount = allProducts.filter(op => op.sku === p.sku && op.id !== p.id).length;
                                       
                                       return (
                                           <InventoryRow 
                                                key={p.id} 
                                                product={p} 
                                                onAdjustClick={handleOpenAdjustModal}
                                                onTransferClick={handleOpenTransferModal}
                                                onViewWarehouseClick={handleViewWarehouseDetails}
                                                onViewLotClick={handleViewLotDetails}
                                                onDeleteClick={handleOpenDeleteModal}
                                                onViewLocationsClick={handleViewLocations}
                                                otherLocationsCount={otherLocationsCount}
                                                expiryWarningDays={expiryWarningDays}
                                                isActionMenuOpen={openActionMenuId === p.id}
                                                onToggleActionMenu={() => setOpenActionMenuId(openActionMenuId === p.id ? null : p.id)}
                                                lowStockThreshold={lowStockThreshold}
                                           />
                                       );
                                   })
                                ) : (
                                    <tr><td colSpan={6} className="text-center py-6">Nenhum produto encontrado.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {filteredProducts.length > 0 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
                </div>

                {notification && (
                    <div className={`fixed bottom-4 right-4 px-6 py-4 rounded-lg shadow-lg text-white z-50 flex items-center animate-fade-in ${
                        notification.type === 'warning' ? 'bg-yellow-500' : 'bg-green-600'
                    }`}>
                        {notification.type === 'warning' ? <AlertTriangleIcon className="w-6 h-6 mr-3" /> : <CheckCircleIcon className="w-6 h-6 mr-3" />}
                        <div>
                            <h4 className="font-bold">{notification.type === 'warning' ? 'Alerta de Stock' : 'Sucesso'}</h4>
                            <p>{notification.message}</p>
                        </div>
                        <button onClick={() => setNotification(null)} className="ml-4 hover:text-gray-200"><XIcon className="w-4 h-4" /></button>
                    </div>
                )}
            </div>
            
            <AdjustStockModal 
                product={selectedProduct} 
                isOpen={isAdjustModalOpen} 
                onClose={() => setIsAdjustModalOpen(false)}
                onStockUpdated={handleStockUpdated}
            />
            <TransferStockModal 
                product={transferringProduct}
                user={user}
                isOpen={isTransferModalOpen}
                onClose={() => setIsTransferModalOpen(false)}
                onStockTransferred={handleStockTransferred}
            />
            <WarehouseDetailsModal
                warehouse={selectedWarehouse}
                isOpen={isWarehouseDetailsOpen}
                onClose={() => setIsWarehouseDetailsOpen(false)}
            />
            <LotDetailsModal
                product={selectedProductForLot}
                isOpen={isLotDetailsOpen}
                onClose={() => setIsLotDetailsOpen(false)}
            />
            <StockLocationModal
                sku={selectedProductForLocation?.sku || ''}
                productName={selectedProductForLocation?.name || ''}
                allProducts={allProducts}
                isOpen={isLocationModalOpen}
                onClose={() => setIsLocationModalOpen(false)}
            />
            <ConfirmationModal
                isOpen={isConfirmDeleteOpen}
                onClose={() => setIsConfirmDeleteOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Eliminar Produto"
                message={`Tem a certeza que deseja eliminar o produto "${productToDelete?.name}" do inventário? Esta ação é irreversível.`}
                confirmText="Eliminar"
                isConfirming={isDeleting}
            />
        </>
    );
};
