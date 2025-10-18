import { ReactNode } from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const icons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
};

const styles = {
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-900',
    icon: 'text-blue-500',
  },
  success: {
    container: 'bg-green-50 border-green-200 text-green-900',
    icon: 'text-green-500',
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    icon: 'text-yellow-500',
  },
  error: {
    container: 'bg-red-50 border-red-200 text-red-900',
    icon: 'text-red-500',
  },
};

export function Alert({
  variant = 'info',
  title,
  children,
  dismissible = false,
  onDismiss,
  className,
}: AlertProps) {
  const Icon = icons[variant];
  const style = styles[variant];

  return (
    <div
      className={cn(
        'flex gap-3 p-4 rounded-lg border',
        style.container,
        className
      )}
      role="alert"
    >
      <Icon className={cn('flex-shrink-0 w-5 h-5', style.icon)} />
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

