'use client

import { cn } from '@/lib/utils';
import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const baseStyles =
  'inline-flex items-center justify-center font-medium transition-colors rounded-xl focus:outline-none';

const variants = {
  default: 'bg-purple-600 text-white hover:bg-purple-700',
  outline: 'border border-white text-white hover:bg-white hover:text-black',
  ghost: 'bg-transparent text-white hover:bg-white/10',
};

const sizes = {
  sm: 'px-3 py-1 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-5 py-3 text-lg',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const baseStyles =
  'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-2xl';

const variants = {
  default: 'bg-purple-600 text-white hover:bg-purple-700',
  outline: 'border border-white text-white hover:bg-white hover:text-black',
  ghost: 'bg-transparent text-white hover:bg-white/10',
};

const sizes = {
  sm: 'px-3 py-1 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-5 py-3 text-lg',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}      </button>
    );
  }
);

Button.displayName = 'Button';
