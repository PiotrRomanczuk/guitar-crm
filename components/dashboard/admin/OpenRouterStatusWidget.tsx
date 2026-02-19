'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AIStatus, checkOpenRouterStatus } from '@/app/actions/admin/ai-check';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Radio, AlertTriangle, Zap, Server } from 'lucide-react';
import { cn } from '@/lib/utils';

export function OpenRouterStatusWidget() {
    const [status, setStatus] = useState<AIStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const checkStatus = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await checkOpenRouterStatus();
            if (result.modelsCount === 0 && result.provider !== 'Unknown') {
                // Assume failure if 0 models and provider is not unknown
                setStatus({ ...result, status: 'error', message: 'No models available' });
            } else {
                setStatus(result);
            }
        } catch (e) {
            setError('Failed to check status');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkStatus();
    }, []);

    return (
        <Card className="border-l-4 border-l-primary shadow-sm overflow-hidden">
            <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Server className="h-4 w-4 text-muted-foreground" />
                    AI Provider Status
                </CardTitle>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 -mr-2 text-muted-foreground hover:text-foreground"
                    onClick={checkStatus}
                    disabled={loading}
                >
                    <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
                    <span className="sr-only">Refresh Status</span>
                </Button>
            </CardHeader>
            <CardContent className="pb-4 px-4 pt-1">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        {loading ? (
                            <Badge variant="outline" className="text-xs font-normal border-dashed animate-pulse">
                                Checking connection...
                            </Badge>
                        ) : status?.status === 'connected' ? (
                            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 pl-1.5 pr-2.5">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                Connected
                            </Badge>
                        ) : (
                            <Badge variant="destructive" className="flex items-center gap-1.5 pl-1.5 pr-2.5">
                                <AlertTriangle className="h-3 w-3" />
                                Error
                            </Badge>
                        )}

                        {!loading && status?.status === 'connected' && (
                            <div className="flex items-center gap-3 text-xs text-muted-foreground ml-1">
                                <span className="flex items-center gap-1" title="Active Models">
                                    <Radio className="h-3 w-3" />
                                    {status.modelsCount}
                                </span>
                                <span className="flex items-center gap-1" title="Response Latency">
                                    <Zap className="h-3 w-3" />
                                    {status.latency}ms
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Error Message */}
                {!loading && (error || status?.status === 'error') && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="mt-2 text-xs text-destructive bg-destructive/5 p-2 rounded border border-destructive/10"
                    >
                        {error || status?.message || 'Unknown error occurred'}
                    </motion.div>
                )}

                {/* Provider Info */}
                {!loading && status?.status === 'connected' && (
                    <div className="mt-2 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                        Provider: {status.provider}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
