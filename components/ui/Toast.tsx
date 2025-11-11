import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { ToastMessage } from '../../types';
import { X, CheckCircle, XCircle, Info } from 'lucide-react';

interface ToastContextType {
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const ToastContext = createContext<ToastContextType | null>(null);

const icons = {
  success: <CheckCircle className="text-green-400" />,
  error: <XCircle className="text-red-400" />,
  info: <Info className="text-blue-400" />,
};

const bgColors = {
    success: 'bg-green-500/20 border-green-500',
    error: 'bg-red-500/20 border-red-500',
    info: 'bg-blue-500/20 border-blue-500',
}

const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = (id: number) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };
  
  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now();
    setToasts(prevToasts => [...prevToasts, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] w-full max-w-sm">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center p-4 mb-4 rounded-lg shadow-lg text-white border-l-4 ${bgColors[toast.type]} bg-gray-800 animate-fade-in-right`}
          >
            <div className="mr-3">{icons[toast.type]}</div>
            <div className="flex-grow">{toast.message}</div>
            <button onClick={() => removeToast(toast.id)} className="ml-4 -mr-2 p-1.5 rounded-lg hover:bg-gray-700">
              <X size={20} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
