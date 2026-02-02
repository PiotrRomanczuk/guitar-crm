import Link from 'next/link';
import { Music, Mail, Globe, Rss } from 'lucide-react';

const footerLinks = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#' },
    { label: 'Integrations', href: '#' },
    { label: 'Updates', href: '#' },
  ],
  Resources: [
    { label: 'Blog', href: '#' },
    { label: 'Community', href: '#' },
    { label: 'Help Center', href: '#' },
    { label: 'API Docs', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
  ],
};

export function LandingFooter() {
  return (
    <footer className="bg-amber-100/50 dark:bg-[#0f0d0a] py-12 px-6 lg:px-8 border-t border-amber-200 dark:border-[#1f1a14]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {/* Brand */}
        <div className="col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <Music className="h-7 w-7 text-[#ec9c13]" />
            <span className="text-gray-900 dark:text-white text-lg font-bold">Guitar CRM</span>
          </div>
          <p className="text-gray-600 dark:text-[#b9af9d] text-sm leading-relaxed">
            The premium platform for music education professionals.
          </p>
        </div>

        {/* Link columns */}
        {Object.entries(footerLinks).map(([category, links]) => (
          <div key={category}>
            <h4 className="text-gray-900 dark:text-white font-bold mb-4">{category}</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-[#b9af9d]">
              {links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-[#ec9c13] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center pt-8 border-t border-amber-200 dark:border-[#1f1a14] gap-4">
        <p className="text-sm text-gray-500 dark:text-[#544b3b]">
          &copy; {new Date().getFullYear()} Guitar CRM. All rights reserved.
        </p>
        <div className="flex gap-6 text-gray-500 dark:text-[#b9af9d]">
          <a
            href="#"
            className="cursor-pointer hover:text-[#ec9c13] transition-colors"
            aria-label="Email"
          >
            <Mail className="h-5 w-5" />
          </a>
          <a
            href="#"
            className="cursor-pointer hover:text-[#ec9c13] transition-colors"
            aria-label="Website"
          >
            <Globe className="h-5 w-5" />
          </a>
          <a
            href="#"
            className="cursor-pointer hover:text-[#ec9c13] transition-colors"
            aria-label="RSS Feed"
          >
            <Rss className="h-5 w-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
