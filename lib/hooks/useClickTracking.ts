import { useCallback } from 'react';
import {
	logButtonClick,
	logLinkClick,
	logFormSubmit,
	logFormChange,
} from '@/lib/logging';

interface ActivityData {
	[key: string]: string | number | boolean | null | Record<string, unknown>;
}

/**
 * React hook for click tracking in components
 */
export function useClickTracking() {
	const trackButtonClick = useCallback(
		async (buttonId: string, buttonText?: string, data?: ActivityData) => {
			await logButtonClick(buttonId, buttonText, data);
		},
		[],
	);

	const trackLinkClick = useCallback(async (linkHref: string, linkText?: string) => {
		await logLinkClick(linkHref, linkText);
	}, []);

	const trackFormSubmit = useCallback(async (formId: string, formData?: Record<string, unknown>) => {
		await logFormSubmit(formId, formData);
	}, []);

	const trackFormChange = useCallback(
		async (formId: string, fieldName: string, fieldValue?: string | number | boolean | null) => {
			await logFormChange(formId, fieldName, fieldValue);
		},
		[],
	);

	return {
		trackButtonClick,
		trackLinkClick,
		trackFormSubmit,
		trackFormChange,
	};
}
