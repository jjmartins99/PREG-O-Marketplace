import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ShoppingCartIcon, PackageIcon, TruckIcon, UsersIcon } from '../components/Icons';
import { UserRole } from '../types';
import mockApi from '../services/mockApi';

const DashboardCard: React.FC<{ to: string, icon: React.ReactNode, title: string, description: string, metric?: number, metricLabel?: string }> = ({ to, icon, title, description, metric, metricLabel }) => (
    <Link to={to} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-start group">
        <div className="flex justify-between items-start w-full">
            <div className="bg-primary-100 text-primary-600 p-3 rounded-full mb-4 group-hover:bg-primary-200 transition-colors">
                {icon}
            </div>
            {metric !== undefined && metricLabel && (
                <div className="text-right">
                    <p className="text-3xl font-bold text-gray-800">{metric}</p>
                    <p className="text-sm text-gray-500">{metricLabel}</p>
                </div>
            )}
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-500 text-sm">{description}</p>
    </Link>
);


export const DashboardPage: React.FC = () => {
    const { user } = useAuth();
    const [counts, setCounts] = useState<{products: number, users: number, deliveries: number} | null>(null);

    useEffect(() => {
        mockApi.getSummaryCounts().then(setCounts);
    }, []);
    
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Bem-vindo, {user?.name}!</h1>
            <p className="text-gray-600 mb-8">Selecione um módulo para começar a gerir o seu negócio.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DashboardCard 
                    to="/comprar"
                    icon={<ShoppingCartIcon className="w-7 h-7" />}
                    title="Quero Comprar"
                    description="Navegue no marketplace, encontre produtos e faça as suas compras."
                    metric={counts?.products}
                    metricLabel="Produtos"
                />

                {(user?.role === UserRole.SELLER || user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER) && (
                    <DashboardCard 
                        to="/vender/produtos"
                        icon={<PackageIcon className="w-7 h-7" />}
                        title="Quero Vender"
                        description="Faça a gestão dos seus produtos, stocks e veja as suas vendas."
                    />
                )}

                <DashboardCard 
                    to="/entregas"
                    icon={<TruckIcon className="w-7 h-7" />}
                    title="Entregas"
                    description="Acompanhe o estado das entregas em tempo real."
                    metric={counts?.deliveries}
                    metricLabel="Em trânsito"
                />
                
                {user?.role === UserRole.ADMIN && (
                    <DashboardCard 
                        to="/admin/usuarios"
                        icon={<UsersIcon className="w-7 h-7" />}
                        title="Backoffice"
                        description="Administre usuários, perfis, e configurações globais da plataforma."
                        metric={counts?.users}
                        metricLabel="Usuários"
                    />
                )}

            </div>
        </div>
    );
};
