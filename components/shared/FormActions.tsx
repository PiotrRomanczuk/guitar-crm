import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FormActionsProps {
  isSubmitting: boolean;
  submitText?: string;
  submittingText?: string;
  cancelText?: string;
  onCancel?: () => void;
  cancelHref?: string;
  showCancel?: boolean;
  layout?: 'horizontal' | 'vertical' | 'responsive';
}

/**
 * Standardized form submit/cancel button component
 * Used for consistent form actions across the app
 *
 * @example
 * // Basic usage
 * <FormActions isSubmitting={isSubmitting} submitText="Create Student" />
 *
 * @example
 * // With cancel button (link)
 * <FormActions
 *   isSubmitting={isSubmitting}
 *   submitText="Save Changes"
 *   cancelHref="/students"
 *   showCancel
 * />
 *
 * @example
 * // With cancel button (callback)
 * <FormActions
 *   isSubmitting={isSubmitting}
 *   submitText="Update"
 *   onCancel={() => setIsEditing(false)}
 *   showCancel
 * />
 */
export default function FormActions({
  isSubmitting,
  submitText = 'Save',
  submittingText,
  cancelText = 'Cancel',
  onCancel,
  cancelHref,
  showCancel = false,
  layout = 'responsive',
}: FormActionsProps) {
  const resolvedSubmittingText = submittingText ?? `${submitText}...`;

  const layoutClasses: Record<typeof layout, string> = {
    horizontal: 'flex-row',
    vertical: 'flex-col-reverse',
    responsive: 'flex-col-reverse sm:flex-row',
  };

  const renderCancelButton = () => {
    if (!showCancel) return null;

    const buttonContent = (
      <Button
        type="button"
        variant="outline"
        disabled={isSubmitting}
        onClick={onCancel}
        className="w-full sm:w-auto"
      >
        {cancelText}
      </Button>
    );

    if (cancelHref) {
      return (
        <Button asChild variant="outline" disabled={isSubmitting} className="w-full sm:w-auto">
          <Link href={cancelHref}>{cancelText}</Link>
        </Button>
      );
    }

    return buttonContent;
  };

  return (
    <div className={`flex gap-3 ${layoutClasses[layout]}`}>
      {renderCancelButton()}
      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting && <Loader2 className="animate-spin" />}
        {isSubmitting ? resolvedSubmittingText : submitText}
      </Button>
    </div>
  );
}
