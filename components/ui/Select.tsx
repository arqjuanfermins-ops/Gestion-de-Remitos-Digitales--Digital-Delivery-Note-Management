
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    children: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({ children, className = '', ...props }) => {
    return (
        <select
            className={`w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition ${className}`}
            {...props}
        >
            {children}
        </select>
    );
};

export default Select;
