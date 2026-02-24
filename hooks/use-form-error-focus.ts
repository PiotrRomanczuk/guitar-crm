import { useEffect, useRef, type RefObject } from 'react';

/**
 * Moves focus to the first element with [aria-invalid="true"] inside a form
 * whenever the `errors` object goes from empty to non-empty.
 *
 * @param errors  - Validation error map (field → message)
 * @param formRef - Ref attached to the <form> element
 *
 * @example
 * const formRef = useRef<HTMLFormElement>(null);
 * useFormErrorFocus(validationErrors, formRef);
 * // ...
 * <form ref={formRef}>
 *   <Input aria-invalid={!!errors.title} />
 * </form>
 */
export function useFormErrorFocus(
  errors: Record<string, string | undefined>,
  formRef: RefObject<HTMLFormElement | null>
) {
  const prevErrorCountRef = useRef(0);

  useEffect(() => {
    const errorCount = Object.values(errors).filter(Boolean).length;
    const hadNoErrors = prevErrorCountRef.current === 0;

    if (errorCount > 0 && hadNoErrors && formRef.current) {
      // Allow the DOM to update with aria-invalid attributes before querying
      const frame = requestAnimationFrame(() => {
        const firstInvalid = formRef.current?.querySelector<HTMLElement>(
          '[aria-invalid="true"]'
        );
        firstInvalid?.focus();
      });
      prevErrorCountRef.current = errorCount;
      return () => cancelAnimationFrame(frame);
    }

    prevErrorCountRef.current = errorCount;
  }, [errors, formRef]);
}
