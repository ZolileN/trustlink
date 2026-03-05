import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`glass-surface rounded-3xl p-6 sm:p-7 ${className}`}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
}

export function CardHeader({ title, subtitle }: CardHeaderProps) {
  return (
    <div className="mb-5">
      <h2 className="hero-title text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h2>
      {subtitle && <p className="mt-2 text-sm text-slate-600 sm:text-base">{subtitle}</p>}
    </div>
  );
}
