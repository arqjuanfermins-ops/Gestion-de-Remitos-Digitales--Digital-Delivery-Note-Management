import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { View } from '../../types';
import { Menu } from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
    setView: (view: View) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, setView }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="relative min-h-screen md:flex bg-gray-900 text-gray-100">
            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black opacity-50 z-10 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            <Sidebar setView={setView} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                <div className="container mx-auto max-w-7xl">
                    <button 
                        className="md:hidden p-2 mb-4 -ml-2 text-gray-300 rounded-md hover:bg-gray-700"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu size={24} />
                    </button>
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;