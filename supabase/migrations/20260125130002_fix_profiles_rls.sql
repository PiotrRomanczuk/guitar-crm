-- Fix: Correct RLS policies for profiles (use user_id instead of id) and optimize
-- The previous policies compared profile.id (uuid) with auth.uid() (auth id), which don't match.
-- Profile.user_id is the correct column to check against auth.uid().

-- Drop existing policies
DROP POLICY IF EXISTS "select_own_or_admin_profile" ON public.profiles;
DROP POLICY IF EXISTS "update_own_or_admin_profile" ON public.profiles;
DROP POLICY IF EXISTS "delete_own_or_admin_profile" ON public.profiles;

-- Create corrected policies with performance optimization (SELECT auth.uid())

CREATE POLICY "select_own_or_admin_profile" ON public.profiles
    FOR SELECT USING (
        user_id = (SELECT auth.uid()) OR is_admin()
    );

CREATE POLICY "update_own_or_admin_profile" ON public.profiles
    FOR UPDATE USING (
        user_id = (SELECT auth.uid()) OR is_admin()
    );

CREATE POLICY "delete_own_or_admin_profile" ON public.profiles
    FOR DELETE USING (
        user_id = (SELECT auth.uid()) OR is_admin()
    );
