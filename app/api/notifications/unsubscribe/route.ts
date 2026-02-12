import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { NotificationType, NOTIFICATION_TYPE_INFO } from '@/types/notifications';

/**
 * GET /api/notifications/unsubscribe
 *
 * Unsubscribe endpoint that accepts:
 * - userId: User ID (required)
 * - type: NotificationType (required)
 *
 * Updates notification_preferences to disable the specified notification type
 * and redirects to confirmation page.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  const notificationType = searchParams.get('type') as NotificationType;

  // Validate required parameters
  if (!userId || !notificationType) {
    return NextResponse.redirect(
      new URL('/unsubscribe?error=missing_params', request.url)
    );
  }

  // Validate notification type
  if (!NOTIFICATION_TYPE_INFO[notificationType]) {
    return NextResponse.redirect(
      new URL('/unsubscribe?error=invalid_type', request.url)
    );
  }

  try {
    // Create Supabase client with service role for unsubscribe
    // This allows unauthenticated users to unsubscribe via email links
    const supabase = await createClient();

    // Verify user exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error('User not found:', profileError);
      return NextResponse.redirect(
        new URL('/unsubscribe?error=user_not_found', request.url)
      );
    }

    // Update notification preference to disabled
    const { error: updateError } = await supabase
      .from('notification_preferences')
      .update({ enabled: false })
      .eq('user_id', userId)
      .eq('notification_type', notificationType);

    if (updateError) {
      console.error('Error updating notification preference:', updateError);
      return NextResponse.redirect(
        new URL('/unsubscribe?error=update_failed', request.url)
      );
    }

    // Redirect to confirmation page with success
    return NextResponse.redirect(
      new URL(
        `/unsubscribe?success=true&type=${encodeURIComponent(notificationType)}`,
        request.url
      )
    );
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.redirect(
      new URL('/unsubscribe?error=server_error', request.url)
    );
  }
}
