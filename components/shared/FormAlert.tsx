import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

interface FormAlertProps {
  type: 'error' | 'success' | 'warning' | 'info';
  message: string;
  title?: string;
  dismissable?: boolean;
  onDismiss?: () => void;
}

const iconMap = { error: AlertCircle, success: CheckCircle2, warning: AlertTriangle, info: Info };
const colorClasses = {
  error: '',
  success: 'text-success [&>svg]:text-success',
  warning: 'text-warning [&>svg]:text-warning',
  info: 'text-primary [&>svg]:text-primary',
};

/**
 * FormAlert - Consistent alert/message display for forms
 * @example
 * <FormAlert type="error" title="Error" message="Something went wrong" />
 * <FormAlert type="success" message="Saved" dismissable onDismiss={() => {}} />
 */
export default function FormAlert({
  type, message, title, dismissable = false, onDismiss,
}: FormAlertProps) {
  const Icon = iconMap[type];

  return (
    <Alert
      variant={type === 'error' ? 'destructive' : 'default'}
      className={colorClasses[type]}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
    >
      <Icon aria-hidden="true" />
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>{message}</AlertDescription>
      {dismissable && (
        <button
          type="button"
          onClick={onDismiss}
          className="absolute right-2 top-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Dismiss alert"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </Alert>
  );
}
