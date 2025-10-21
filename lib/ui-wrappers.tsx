// Wrappers para mantener compatibilidad con props personalizados
'use client';

import * as React from "react"
import { Loader2, X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { Button as ShadcnButton } from "@/components/ui/button"
import { Input as ShadcnInput } from "@/components/ui/input"
import { Textarea as ShadcnTextarea } from "@/components/ui/textarea"
import { Alert as ShadcnAlert, AlertDescription } from "@/components/ui/alert"
import {
  Select as ShadcnSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

// ========== BUTTON WRAPPER ==========
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ loading, fullWidth, className, children, disabled, ...props }, ref) => {
    return (
      <ShadcnButton
        ref={ref}
        className={cn(fullWidth && "w-full", className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {children}
          </>
        ) : (
          children
        )}
      </ShadcnButton>
    )
  }
);
Button.displayName = "Button";

// ========== INPUT WRAPPER ==========
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, fullWidth, id, className, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-');

    return (
      <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}>
        {label && (
          <Label htmlFor={inputId}>
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        <ShadcnInput
          ref={ref}
          id={inputId}
          className={cn(
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        {helperText && !error && (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

// ========== TEXTAREA WRAPPER ==========
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, fullWidth, id, className, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s/g, '-');

    return (
      <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}>
        {label && (
          <Label htmlFor={textareaId}>
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        <ShadcnTextarea
          ref={ref}
          id={textareaId}
          className={cn(
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        {helperText && !error && (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

// ========== SELECT WRAPPER ==========
export interface SelectProps {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  ({
    label,
    error,
    helperText,
    fullWidth,
    options,
    value,
    onChange,
    placeholder = "Seleccionar...",
    required,
    disabled,
    className,
  }, ref) => {
    return (
      <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}>
        {label && (
          <Label>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        <ShadcnSelect 
          value={value} 
          onValueChange={(val) => {
            // Convertir a evento sintético para mantener compatibilidad
            if (onChange) {
              const syntheticEvent = {
                target: { value: val },
                currentTarget: { value: val },
              } as React.ChangeEvent<HTMLSelectElement>;
              onChange(syntheticEvent);
            }
          }}
          disabled={disabled}
        >
          <SelectTrigger
            ref={ref}
            className={cn(
              "w-full",
              error && "border-destructive focus-visible:ring-destructive",
              className
            )}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </ShadcnSelect>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {helperText && !error && (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";

// ========== ALERT WRAPPER ==========
export interface AlertWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'error' | 'default' | 'destructive';
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const icons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
  default: Info,
  destructive: AlertCircle,
};

const variantStyles = {
  info: 'bg-blue-50 border-blue-200 text-blue-900 [&>svg]:text-blue-500',
  success: 'bg-green-50 border-green-200 text-green-900 [&>svg]:text-green-500',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-900 [&>svg]:text-yellow-500',
  error: 'bg-red-50 border-red-200 text-red-900 [&>svg]:text-red-500',
  default: '',
  destructive: '',
};

export function Alert({
  variant = 'default',
  title,
  dismissible = false,
  onDismiss,
  className,
  children,
  ...props
}: AlertWrapperProps) {
  const Icon = icons[variant];
  const customVariant = variantStyles[variant];

  // Usar estilos custom para variantes personalizadas
  if (['info', 'success', 'warning', 'error'].includes(variant)) {
    return (
      <div
        className={cn(
          'flex gap-3 p-4 rounded-lg border',
          customVariant,
          className
        )}
        role="alert"
        {...props}
      >
        <Icon className="flex-shrink-0 w-5 h-5" />
        <div className="flex-1">
          {title && <h4 className="font-semibold mb-1">{title}</h4>}
          <div className="text-sm">{children}</div>
        </div>
        {dismissible && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Cerrar alerta"
          >
            <X size={20} />
          </button>
        )}
      </div>
    );
  }

  // Para default y destructive, usar shadcn Alert
  return (
    <ShadcnAlert variant={variant === 'error' ? 'destructive' : variant as 'default' | 'destructive'} className={className} {...props}>
      <Icon className="h-4 w-4" />
      {title && <div className="font-semibold">{title}</div>}
      <AlertDescription>{children}</AlertDescription>
    </ShadcnAlert>
  );
}

