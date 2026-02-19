import type { Metadata } from 'next';
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from 'next/font/google';

import { AppShell } from '@/components/layout/AppShell';
import { Providers } from '@/components/providers/QueryProvider';

import './globals.css';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { createLogger } from '@/lib/logger';

const log = createLogger('Layout');

export const dynamic = 'force-dynamic';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const plusJakartaSans = Plus_Jakarta_Sans({ variable: '--font-plus-jakarta-sans', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Strummy - Guitar Teaching Studio',
  description: 'The premium platform for guitar teachers to manage students, lessons, and track progress',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Strummy',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover' as const,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  log.debug('RootLayout rendering');
  const { user, isAdmin, isTeacher, isStudent } = await getUserWithRolesSSR();
  log.debug('User roles', { userId: user?.id, isAdmin, isTeacher, isStudent });
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${plusJakartaSans.variable}`} suppressHydrationWarning>
      <body className={`antialiased font-sans`}>
        <Providers>
          <AppShell user={user} isAdmin={isAdmin} isTeacher={isTeacher} isStudent={isStudent}>
            {children}
          </AppShell>
        </Providers>
      </body>
    </html>
  );
}
