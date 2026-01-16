'use client';

import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options?: { value: string | number; label: string }[];
    uppercase?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, options, children, className = '', uppercase, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <select
                    ref={ref}
                    className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 transition-all ${error
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                        } ${uppercase ? 'uppercase' : ''} ${className}`}
                    style={{ color: '#000000', backgroundColor: '#ffffff' }}
                    {...props}
                >
                    {options ? options.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                            className="text-black bg-white"
                            style={{ color: '#000000', backgroundColor: '#ffffff' }}
                        >
                            {option.label}
                        </option>
                    )) : children}
                </select>
                {error && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';

export default Select;
