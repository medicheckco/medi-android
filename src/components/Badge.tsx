import React from 'react';
import { cn } from '../lib/utils';

export const Badge = ({ children, variant = 'default' }: { children: React.ReactNode, variant?: 'default' | 'warning' | 'danger' | 'success' }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-600',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-rose-100 text-rose-700',
    success: 'bg-emerald-100 text-emerald-700',
  };
  return (
    <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant])}>
      {children}
    </span>
  );
};
