
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input: React.FC<InputProps> = ({ className = '', ...props }) => {
  return (
    <input
      className={`w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition ${className}`}
      {...props}
    />
  );
};

export default Input;
