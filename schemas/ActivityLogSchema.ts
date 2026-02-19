import { z } from 'zod';

/**
 * Activity Log Schema - Validation for user activity tracking
 * Tracks clicks, page visits, form interactions, and other user events
 */

// Activity type enum
export const ActivityTypeEnum = z.enum([
  'page_view',
  'button_click',
  'link_click',
  'form_submit',
  'form_change',
  'navigation',
  'scroll',
  'custom_event',
  'auth_redirect',
  'auth_forbidden',
]);

export type ActivityType = z.infer<typeof ActivityTypeEnum>;

/**
 * Base Activity Log Schema - Full validation for activity logs
 */
export const ActivityLogSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  activity_type: ActivityTypeEnum,
  event_name: z.string().min(1, 'Event name is required'),
  event_description: z.string().nullable().optional(),
  page_url: z.string().url('Invalid URL'),
  element_id: z.string().nullable().optional(),
  element_class: z.string().nullable().optional(),
  element_text: z.string().nullable().optional(),
  additional_data: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
  user_agent: z.string().nullable().optional(),
  ip_address: z.string().nullable().optional(),
  referer: z.string().nullable().optional(),
  session_id: z.string().nullable().optional(),
  timestamp: z.date(),
  created_at: z.date(),
});

export type ActivityLog = z.infer<typeof ActivityLogSchema>;

/**
 * Activity Log Input Schema - For creating new activity logs
 * Omits id and timestamps as they're auto-generated
 */
export const ActivityLogInputSchema = z.object({
  activity_type: ActivityTypeEnum,
  event_name: z.string().min(1, 'Event name is required').max(255),
  event_description: z.string().max(500).optional().nullable(),
  page_url: z.string().url('Invalid URL'),
  element_id: z.string().max(255).optional().nullable(),
  element_class: z.string().max(255).optional().nullable(),
  element_text: z.string().max(500).optional().nullable(),
  additional_data: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
  user_agent: z.string().optional().nullable(),
  ip_address: z.string().optional().nullable(),
  referer: z.string().optional().nullable(),
  session_id: z.string().optional().nullable(),
});

export type ActivityLogInput = z.infer<typeof ActivityLogInputSchema>;

/**
 * Activity Log Filter Schema - For querying activity logs
 */
export const ActivityLogFilterSchema = z.object({
  user_id: z.string().uuid().optional(),
  activity_type: ActivityTypeEnum.optional(),
  event_name: z.string().optional(),
  page_url: z.string().optional(),
  start_date: z.date().optional(),
  end_date: z.date().optional(),
  session_id: z.string().optional(),
});

export type ActivityLogFilter = z.infer<typeof ActivityLogFilterSchema>;

/**
 * Activity Log Sort Schema - For sorting results
 */
export const ActivityLogSortSchema = z.object({
  field: z.enum(['timestamp', 'created_at', 'event_name', 'page_url']).default('timestamp'),
  direction: z.enum(['asc', 'desc']).default('desc'),
});

export type ActivityLogSort = z.infer<typeof ActivityLogSortSchema>;

/**
 * Click Event Payload Schema - For tracking button/link clicks
 */
export const ClickEventSchema = z.object({
  elementId: z.string().optional(),
  elementClass: z.string().optional(),
  elementText: z.string().optional(),
  eventName: z.string().min(1, 'Event name required'),
  additionalData: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
});

export type ClickEvent = z.infer<typeof ClickEventSchema>;

/**
 * Page View Event Payload Schema - For tracking page navigation
 */
export const PageViewEventSchema = z.object({
  pageUrl: z.string().url(),
  eventName: z.string().default('page_view'),
  additionalData: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
});

export type PageViewEvent = z.infer<typeof PageViewEventSchema>;
