import React, { ReactNode, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { HomeIcon, ShoppingBagIcon, ShoppingCartIcon, TruckIcon, UsersIcon, SettingsIcon, LogOutIcon, PackageIcon, ArchiveIcon } from '../Icons';
import { UserRole } from '../../types';
import { useCart } from '../../hooks/useCart';
import { CartSidebar } from '../CartSidebar';

interface MainLayoutProps {
  children: ReactNode;
}

const NavItem: React.FC<{ to: string; icon: ReactNode; children: ReactNode }> = ({ to, icon, children }) => {
    const location = useLocation();
    const isActive = location.pathname === to || (to === '/vender/produtos' && location.pathname.startsWith('/vender/'));
  return (
    <NavLink
      to={to}
      className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
        isActive
          ? 'bg-primary-600 text-white'
          : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'
      }`}
    >
      <span className="mr-3">{icon}</span>
      {children}
    </NavLink>
  );
};

const Sidebar: React.FC<{}> = () => {
  const { user, logout } = useAuth();

  const getNavItems = () => {
      const role = user?.role;
      const navs = {
          common: [
              { to: "/", icon: <HomeIcon className="w-5 h-5" />, label: "Dashboard" },
              { to: "/comprar", icon: <ShoppingCartIcon className="w-5 h-5" />, label: "Quero Comprar" },
              { to: "/entregas", icon: <TruckIcon className="w-5 h-5" />, label: "Entregas" },
          ],
          seller: [
               { to: "/vender/produtos", icon: <PackageIcon className="w-5 h-5" />, label: "Meus Produtos" },
               { to: "/vender/inventario", icon: <ArchiveIcon className="w-5 h-5" />, label: "Inventário" },
          ],
          admin: [
              { to: "/admin/usuarios", icon: <UsersIcon className="w-5 h-5" />, label: "Gestão de Usuários" },
              { to: "/admin/settings", icon: <SettingsIcon className="w-5 h-5" />, label: "Configurações" },
          ]
      }

      let items = [...navs.common];
      if (role === UserRole.SELLER || role === UserRole.ADMIN || role === UserRole.MANAGER || role === UserRole.GROUP_MANAGER) {
          items.push(...navs.seller);
      }
      if (role === UserRole.ADMIN) {
          items.push(...navs.admin);
      }
      return items;
  }

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
      <div className="h-16 flex items-center justify-center px-4 border-b">
        <ShoppingBagIcon className="h-8 w-8 text-primary-600" />
        <span className="ml-2 text-xl font-bold text-gray-800">PREGÃO</span>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {getNavItems().map(item => (
             <NavItem key={item.to} to={item.to} icon={item.icon}>{item.label}</NavItem>
        ))}
      </nav>
      <div className="p-4 border-t">
        <button onClick={logout} className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600">
           <LogOutIcon className="w-5 h-5 mr-3" />
           Sair
        </button>
      </div>
    </aside>
  );
};

const Header: React.FC<{ onCartClick: () => void }> = ({ onCartClick }) => {
    const { user } = useAuth();
    const { itemCount } = useCart();
    return (
        <header className="h-16 bg-white border-b flex items-center justify-end px-6">
            <div className="flex items-center">
                 <button onClick={onCartClick} className="relative text-gray-500 hover:text-gray-700 mr-6">
                    <ShoppingCartIcon className="w-6 h-6" />
                    {itemCount > 0 && (
                        <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                            {itemCount}
                        </span>
                    )}
                </button>
                <div className="text-right mr-4">
                    <p className="font-semibold text-gray-800 text-sm">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
                <img src={user?.avatarUrl} alt="User Avatar" className="w-10 h-10 rounded-full" />
            </div>
        </header>
    );
};


export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onCartClick={() => setIsCartOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};