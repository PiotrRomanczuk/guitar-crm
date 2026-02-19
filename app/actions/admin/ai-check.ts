'use server';

import { getAvailableModels } from '@/app/actions/ai';
import { requireAIAuth } from '@/lib/ai/auth';
import { createClient } from '@/lib/supabase/server';

export interface AIStatus {
    status: 'connected' | 'error' | 'loading';
    provider: string;
    latency: number;
    modelsCount: number;
    message?: string;
    lastChecked: string;
}

export async function checkOpenRouterStatus(): Promise<AIStatus> {
    const start = Date.now();

    try {
        // 1. Verify User is Admin (Double check)
        // Although the component should only be rendered for admins, we should verify on server action too.
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('Unauthorized');
        }

        // Check role from user_roles table or metadata if necessary, but requireAIAuth handles basic auth
        // Ideally we should check if they are admin.
        const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'admin')
            .single();

        if (!roleData) {
            // Allow teachers to check too if they have access? The user said "admin only".
            // Let's be strict.
            throw new Error('Unauthorized: Admin access required');
        }

        // 2. Check AI Provider & Models
        // This function inside app/actions/ai.ts already handles auth and provider initialization
        const result = await getAvailableModels();

        const latency = Date.now() - start;

        if (result.error) {
            return {
                status: 'error',
                provider: result.providerName || 'Unknown',
                latency,
                modelsCount: 0,
                message: result.error,
                lastChecked: new Date().toISOString(),
            };
        }

        return {
            status: 'connected',
            provider: result.providerName || 'Unknown',
            latency,
            modelsCount: result.models?.length || 0,
            lastChecked: new Date().toISOString(),
        };

    } catch (error) {
        console.error('AI Status Check Failed:', error);
        return {
            status: 'error',
            provider: 'Unknown',
            latency: Date.now() - start,
            modelsCount: 0,
            message: error instanceof Error ? error.message : 'Unknown error',
            lastChecked: new Date().toISOString(),
        };
    }
}
