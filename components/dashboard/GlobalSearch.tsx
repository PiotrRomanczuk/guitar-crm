'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import {
    Search,
    Users,
    Music,
    Calendar,
    Settings,
    Shield,
    BookOpen,
    Plus,
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export function GlobalSearch() {
    const [open, setOpen] = React.useState(false);
    const router = useRouter();

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const runCommand = React.useCallback((command: () => void) => {
        setOpen(false);
        command();
    }, []);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="relative group flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-background hover:bg-muted/50 transition-all text-sm w-full sm:w-64"
            >
                <Search className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-muted-foreground group-hover:text-foreground transition-colors flex-1 text-left">
                    Search...
                </span>
                <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="overflow-hidden p-0 shadow-2xl border-none">
                    <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
                        <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
                            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                            <Command.Input
                                placeholder="Type a command or search..."
                                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                        <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
                            <Command.Empty className="py-6 text-center text-sm">No results found.</Command.Empty>

                            <Command.Group heading="Navigation">
                                <Command.Item onSelect={() => runCommand(() => router.push('/dashboard'))}>
                                    <Shield className="mr-2 h-4 w-4" />
                                    <span>Dashboard Home</span>
                                </Command.Item>
                                <Command.Item onSelect={() => runCommand(() => router.push('/dashboard/users'))}>
                                    <Users className="mr-2 h-4 w-4" />
                                    <span>Users Management</span>
                                </Command.Item>
                                <Command.Item onSelect={() => runCommand(() => router.push('/dashboard/songs'))}>
                                    <Music className="mr-2 h-4 w-4" />
                                    <span>Song Library</span>
                                </Command.Item>
                                <Command.Item onSelect={() => runCommand(() => router.push('/dashboard/lessons'))}>
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    <span>Lesson Schedule</span>
                                </Command.Item>
                            </Command.Group>

                            <Command.Group heading="Admin Tools">
                                <Command.Item onSelect={() => runCommand(() => router.push('/dashboard/stats'))}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    <span>System Stats</span>
                                </Command.Item>
                                <Command.Item onSelect={() => runCommand(() => router.push('/dashboard/settings'))}>
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </Command.Item>
                            </Command.Group>
                        </Command.List>
                    </Command>
                </DialogContent>
            </Dialog>
        </>
    );
}
