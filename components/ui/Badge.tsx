import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

const variants = {
  default: 'bg-gray-100 text-gray-800',
  primary: 'bg-[#7B3FBD] text-white',
  secondary: 'bg-[#00D9D4] text-gray-900',
  success: 'bg-green-500 text-white',
  warning: 'bg-[#FFB700] text-gray-900',
  danger: 'bg-red-500 text-white',
  info: 'bg-blue-500 text-white',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export function Badge({
  variant = 'default',
  size = 'md',
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

