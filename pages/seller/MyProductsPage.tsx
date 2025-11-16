import React, { useEffect, useState } from 'react';
import { Product, ProductKind } from '../../types';
import mockApi from '../../services/mockApi';
import { useAuth } from '../../hooks/useAuth';
import { Pagination } from '../../components/Pagination';
import { ImportProductsModal } from '../../components/modals/ImportProductsModal';
import { ProductFormModal } from '../../components/modals/ProductFormModal';
import { PlusIcon } from '../../components/Icons';

const ProductRow: React.FC<{ product: Product; onEdit: (product: Product) => void }> = ({ product, onEdit }) => (
    <tr className="border-b hover:bg-gray-50">
        <td className="py-3 px-6 text-sm text-gray-700 flex items-center">
            <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-md object-cover mr-4"/>
            {product.name}
        </td>
        <td className="py-3 px-6 text-sm text-gray-700">{product.sku}</td>
        <td className="py-3 px-6 text-sm text-gray-700">{new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(product.price)}</td>
        <td className="py-3 px-6 text-sm text-gray-700">
            {product.kind === ProductKind.GOOD ? (
                 <span className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">Mercadoria</span>
            ) : (
                <span className="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">Serviço</span>
            )}
        </td>
        <td className="py-3 px-6 text-sm text-gray-700 text-center">{product.trackStock ? product.stockLevel : 'N/A'}</td>
        <td className="py-3 px-6 text-sm">
             <button onClick={() => onEdit(product)} className="font-medium text-primary-600 hover:underline">Editar</button>
        </td>
    </tr>
);

export const MyProductsPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const fetchProducts = async () => {
            if(!user) return;
            setLoading(true);
            const limit = 10;
            const data = await mockApi.getSellerProducts(user, { query: searchQuery }, currentPage, limit);
            setProducts(data.data);
            setTotalPages(Math.ceil(data.total / limit));
            setLoading(false);
        };
        const timer = setTimeout(() => {
            if (user) fetchProducts();
        }, 300); // Debounce search

        return () => clearTimeout(timer);
    }, [user, currentPage, searchQuery, refreshKey]);
    
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); // Reset to first page on new search
    };

    const handleAddProduct = () => {
        setEditingProduct(null);
        setIsFormModalOpen(true);
    };

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setIsFormModalOpen(true);
    };

    const handleModalClose = () => {
        setIsFormModalOpen(false);
        setEditingProduct(null);
    };

    const handleModalSave = (savedProduct: Product) => {
        setRefreshKey(oldKey => oldKey + 1);
        handleModalClose();
    };
    
    const handleImportSuccess = () => {
        setRefreshKey(oldKey => oldKey + 1);
        setIsImportModalOpen(false);
    };

    return (
        <>
            <div>
                <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
                    <h1 className="text-3xl font-bold text-gray-800">Meus Produtos</h1>
                    <div className="flex space-x-2 items-center">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Pesquisar por nome ou SKU..."
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        />
                        <button onClick={() => setIsImportModalOpen(true)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300">Importar</button>
                        <button onClick={handleAddProduct} className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700 flex items-center">
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Adicionar Produto
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Produto</th>
                                    <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">SKU</th>
                                    <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Preço</th>
                                    <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tipo</th>
                                    <th className="py-3 px-6 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock</th>
                                    <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600 text-sm font-light">
                                {loading ? (
                                    <tr><td colSpan={6} className="text-center py-6">A carregar produtos...</td></tr>
                                ) : products.length > 0 ? (
                                   products.map(p => <ProductRow key={p.id} product={p} onEdit={handleEditProduct} />)
                                ) : (
                                    <tr><td colSpan={6} className="text-center py-6">Nenhum produto encontrado.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {products.length > 0 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
                </div>
            </div>
            <ImportProductsModal 
                isOpen={isImportModalOpen} 
                onClose={() => setIsImportModalOpen(false)}
                onImportSuccess={handleImportSuccess}
            />
            <ProductFormModal 
                isOpen={isFormModalOpen}
                onClose={handleModalClose}
                onSave={handleModalSave}
                product={editingProduct}
                user={user}
            />
        </>
    );
};