import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-semibold select-none active:scale-98 transition-all duration-100 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500",
          // Variants
          {
            'bg-primary-600 text-white hover:bg-primary-700': variant === 'primary',
            'bg-slate-100 text-slate-700 hover:bg-slate-200': variant === 'secondary',
            'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50': variant === 'outline',
            'text-slate-600 hover:bg-slate-100': variant === 'ghost',
            'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500': variant === 'danger',
          },
          // Sizing
          {
            'px-3 py-1.5 text-xs h-8': size === 'sm',
            'px-4 py-2.5 text-sm h-10': size === 'md',
            'px-6 py-3.5 text-base h-12': size === 'lg',
            'p-2 w-9 h-9': size === 'icon',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
export default Button;
