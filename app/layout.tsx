import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';

import Header from '@/components/navigation/Header';
import { Providers } from '@/components/providers/QueryProvider';

import './globals.css';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Guitar CRM - Student Management System',
  description: 'Guitar teacher CRM for managing students, lessons, and progress tracking',
  // viewport removed, now exported separately
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, isAdmin, isTeacher, isStudent } = await getUserWithRolesSSR();
  // console.log(user, isAdmin, isTeacher, isStudent);
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <Header user={user} isAdmin={isAdmin} isTeacher={isTeacher} isStudent={isStudent} />
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
