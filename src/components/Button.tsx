import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60';

  const variantStyles = {
    primary:
      'bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:-translate-y-0.5 hover:bg-blue-700 focus:ring-blue-300',
    secondary: 'bg-slate-700 text-white hover:bg-slate-800 focus:ring-slate-300',
    outline:
      'border border-blue-200 bg-white/80 text-blue-700 hover:bg-blue-50 focus:ring-blue-200',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-300',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-300'
  };

  const sizeStyles = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm sm:text-base',
    lg: 'px-6 py-3 text-base sm:text-lg'
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
