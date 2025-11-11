import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { View } from '../../types';
import { LogOut, Home, Shield, FileText } from 'lucide-react';

interface SidebarProps {
    setView: (view: View) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ setView, isOpen, setIsOpen }) => {
    const { user, logout } = useAuth();

    const handleNavigate = (page: View['page']) => {
        setView({ page });
        setIsOpen(false);
    };

    const navItems = [
        { name: 'Dashboard', page: 'dashboard', icon: Home, role: ['admin', 'user'] },
        { name: 'Nuevo Remito', page: 'remito_new', icon: FileText, role: ['admin', 'user'] },
        { name: 'Admin', page: 'admin', icon: Shield, role: ['admin'] },
    ];

    return (
        <aside className={`bg-gray-800 w-64 p-4 flex flex-col justify-between fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-200 ease-in-out z-20`}>
            <div>
                <h1 className="text-2xl font-bold text-white mb-8">Remitos App</h1>
                <nav>
                    <ul>
                        {navItems.map(item => (
                            user && item.role.includes(user.role) && (
                                <li key={item.name} className="mb-2">
                                    <button
                                        onClick={() => handleNavigate(item.page as any)}
                                        className="w-full flex items-center p-2 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors duration-200"
                                    >
                                        <item.icon className="w-5 h-5 mr-3" />
                                        {item.name}
                                    </button>
                                </li>
                            )
                        ))}
                    </ul>
                </nav>
            </div>
            <div>
                 <div className="border-t border-gray-700 pt-4 mt-4">
                    <p className="text-sm text-gray-400">Logueado como:</p>
                    <p className="font-semibold text-white">{user?.name}</p>
                 </div>
                <button
                    onClick={logout}
                    className="w-full flex items-center p-2 mt-4 text-gray-300 rounded-lg hover:bg-red-800/50 hover:text-white transition-colors duration-200"
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    Cerrar Sesión
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;