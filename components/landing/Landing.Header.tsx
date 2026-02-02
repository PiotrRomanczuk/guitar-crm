'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Music, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#181511]/95 backdrop-blur-sm border-b border-amber-200 dark:border-[#3a2e22] px-6 lg:px-8 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Music className="h-9 w-9 text-[#ec9c13]" />
          <span className="text-gray-900 dark:text-white text-2xl font-bold tracking-tight">Strummy</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-gray-600 dark:text-[#b9af9d] hover:text-[#ec9c13] transition-colors font-medium"
          >
            Features
          </a>
          <a
            href="#testimonials"
            className="text-gray-600 dark:text-[#b9af9d] hover:text-[#ec9c13] transition-colors font-medium"
          >
            Testimonials
          </a>
          <a
            href="#"
            className="text-gray-600 dark:text-[#b9af9d] hover:text-[#ec9c13] transition-colors font-medium"
          >
            Community
          </a>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/sign-in"
            className="text-gray-900 dark:text-white hover:text-[#ec9c13] transition-colors font-medium"
          >
            Log In
          </Link>
          <Button
            asChild
            className="bg-[#ec9c13] hover:bg-amber-600 text-[#181511] font-bold py-2 px-5 rounded-lg shadow-lg shadow-amber-900/20"
          >
            <Link href="/sign-up">Get Started</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex items-center justify-center p-2 text-gray-900 dark:text-white hover:text-[#ec9c13] transition-colors rounded-lg active:bg-black/5 dark:active:bg-white/5"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-[#181511] border-b border-amber-200 dark:border-[#3a2e22] px-6 py-4 space-y-4">
          <a
            href="#features"
            className="block text-gray-600 dark:text-[#b9af9d] hover:text-[#ec9c13] transition-colors font-medium py-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            Features
          </a>
          <a
            href="#testimonials"
            className="block text-gray-600 dark:text-[#b9af9d] hover:text-[#ec9c13] transition-colors font-medium py-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            Testimonials
          </a>
          <a
            href="#"
            className="block text-gray-600 dark:text-[#b9af9d] hover:text-[#ec9c13] transition-colors font-medium py-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            Community
          </a>
          <div className="pt-4 border-t border-amber-200 dark:border-[#3a2e22] flex flex-col gap-3">
            <Link
              href="/sign-in"
              className="text-gray-900 dark:text-white hover:text-[#ec9c13] transition-colors font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Log In
            </Link>
            <Button
              asChild
              className="bg-[#ec9c13] hover:bg-amber-600 text-[#181511] font-bold w-full"
            >
              <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                Get Started
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
