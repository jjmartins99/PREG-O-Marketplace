import React, { useEffect, useState } from 'react';
import { Delivery } from '../../types';
import mockApi from '../../services/mockApi';

const DeliveryCard: React.FC<{ delivery: Delivery }> = ({ delivery }) => {
    const getStatusColor = () => {
        switch (delivery.status) {
            case 'Em Trânsito': return 'bg-yellow-100 text-yellow-800';
            case 'Entregue': return 'bg-green-100 text-green-800';
            case 'Aguardando': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }
    
    return (
        <div className="bg-white p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center sm:justify-between transition-all duration-300">
            <div className="flex items-center mb-4 sm:mb-0">
                <img src={delivery.driver.avatarUrl} alt={delivery.driver.name} className="w-12 h-12 rounded-full mr-4" />
                <div>
                    <p className="font-semibold text-gray-800">{delivery.driver.name}</p>
                    <div className="mt-1">
                        <span className="text-sm text-gray-600">{delivery.vehicle.brand} {delivery.vehicle.model}</span>
                        <span className="ml-2 font-mono text-sm bg-gray-200 text-gray-800 px-2 py-0.5 rounded-md">{delivery.vehicle.licensePlate}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5">Pedido #{delivery.orderId}</p>
                </div>
            </div>
            <div className="flex flex-col items-start sm:items-end">
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full mb-2 ${getStatusColor()}`}>{delivery.status}</span>
                <p className="text-sm text-gray-600">Entrega prevista: <span className="font-semibold">{delivery.estimatedDelivery}</span></p>
            </div>
        </div>
    );
};


export const DeliveryTrackingPage: React.FC = () => {
    const [deliveries, setDeliveries] = useState<Delivery[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDeliveries = async () => {
            setLoading(true);
            const data = await mockApi.getDeliveries();
            setDeliveries(data);
            setLoading(false);
        }
        fetchDeliveries();
    }, []);

    // Simulate real-time updates for demonstration
    useEffect(() => {
        const interval = setInterval(() => {
            setDeliveries(prevDeliveries => {
                const deliveryToUpdate = prevDeliveries.find(d => d.status === 'Aguardando');
                if (deliveryToUpdate) {
                    return prevDeliveries.map(d =>
                        d.id === deliveryToUpdate.id ? { ...d, status: 'Em Trânsito' } : d
                    );
                }
                return prevDeliveries;
            });
        }, 7000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            <div className="lg:col-span-1 flex flex-col">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Acompanhar Entregas</h1>
                {loading ? <p>A carregar entregas...</p> : (
                    <div className="space-y-4 overflow-y-auto pr-2">
                        {deliveries.map(d => <DeliveryCard key={d.id} delivery={d} />)}
                    </div>
                )}
            </div>
            <div className="lg:col-span-2 bg-gray-300 rounded-lg shadow-inner flex items-center justify-center min-h-[400px] lg:min-h-0">
                <p className="text-gray-500 font-semibold">Visualização do Mapa</p>
            </div>
        </div>
    );
};