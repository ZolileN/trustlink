import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">
          {label}
        </label>
      )}
      <input
        className={`w-full rounded-xl border bg-white/90 px-4 py-2.5 text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:outline-none focus:ring-4 ${
          error ? 'border-rose-400 focus:ring-rose-100' : 'border-blue-100 focus:ring-blue-100'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-rose-600">{error}</p>}
      {helperText && !error && <p className="mt-1 text-sm text-slate-500">{helperText}</p>}
    </div>
  );
}
