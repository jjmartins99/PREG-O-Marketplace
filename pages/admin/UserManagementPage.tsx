import React, { useEffect, useState } from 'react';
import { User, UserFilters, UserRole } from '../../types';
import mockApi from '../../services/mockApi';
import { Pagination } from '../../components/Pagination';


const UserRow: React.FC<{ user: User }> = ({ user }) => (
    <tr className="border-b hover:bg-gray-50">
        <td className="py-3 px-6 text-sm text-gray-700 flex items-center">
             <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full object-cover mr-4"/>
            <div>
                <div className="font-medium">{user.name}</div>
                <div className="text-gray-500 text-xs">{user.email}</div>
            </div>
        </td>
        <td className="py-3 px-6 text-sm text-gray-700">{user.companyName}</td>
        <td className="py-3 px-6 text-sm text-gray-700">{user.role}</td>
        <td className="py-3 px-6 text-sm">
             <button className="font-medium text-primary-600 hover:underline mr-4">Editar</button>
             <button className="font-medium text-red-600 hover:underline">Remover</button>
        </td>
    </tr>
);

export const UserManagementPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [filters, setFilters] = useState<UserFilters>({ role: 'all', query: '' });

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            const limit = 10;
            const data = await mockApi.getUsers(filters, currentPage, limit);
            setUsers(data.data);
            setTotalPages(Math.ceil(data.total / limit));
            setLoading(false);
        };
        const timer = setTimeout(() => {
            fetchUsers();
        }, 300); // Debounce search

        return () => clearTimeout(timer);
    }, [currentPage, filters]);
    
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCurrentPage(1); // Reset to first page on new filter
        setFilters(prev => ({...prev, [name]: value}));
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
                <h1 className="text-3xl font-bold text-gray-800">Gestão de Usuários</h1>
                <div className="flex space-x-2 items-center">
                    <input
                        type="text"
                        name="query"
                        value={filters.query}
                        onChange={handleFilterChange}
                        placeholder="Pesquisar por nome ou email..."
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    />
                    <select name="role" value={filters.role} onChange={handleFilterChange} className="w-full md:w-40 px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500">
                        <option value="all">Todo Perfil</option>
                        {Object.values(UserRole).filter(r => r !== UserRole.ADMIN).map(role => (
                           <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                    <button className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700">Adicionar</button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Usuário</th>
                                <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Empresa/Loja</th>
                                <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Perfil</th>
                                <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm font-light">
                            {loading ? (
                                <tr><td colSpan={4} className="text-center py-6">A carregar usuários...</td></tr>
                            ) : users.length > 0 ? (
                               users.map(u => <UserRow key={u.id} user={u} />)
                            ) : (
                                <tr><td colSpan={4} className="text-center py-6">Nenhum usuário encontrado.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                 {users.length > 0 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
            </div>
        </div>
    );
};