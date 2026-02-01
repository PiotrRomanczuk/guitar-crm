import Link from 'next/link';

const footerLinks = {
  product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'Roadmap', href: '#' },
  ],
  company: [
    { label: 'About', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  resources: [
    { label: 'Documentation', href: '#' },
    { label: 'Help Center', href: '#' },
    { label: 'Community', href: '#' },
    { label: 'API', href: '#' },
  ],
  legal: [
    { label: 'Privacy', href: '#' },
    { label: 'Terms', href: '#' },
    { label: 'Cookies', href: '#' },
  ],
};

export function LandingFooter() {
  return (
    <footer className="relative border-t border-border/50 bg-card/50">
      {/* Organic wave top */}
      <svg
        className="absolute -top-px left-0 w-full h-4 text-background"
        viewBox="0 0 1440 16"
        preserveAspectRatio="none"
      >
        <path
          d="M0,16 Q360,0 720,8 T1440,0 L1440,16 Z"
          fill="currentColor"
        />
      </svg>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25">
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 text-primary-foreground"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11.5 3.5c.5-1 1.5-1.5 2.5-1.5 2.5 0 4 2.5 4 5.5 0 1-.5 2-1 3l-1 2c-.5 1-.5 2-.5 3v5a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2v-5c0-1 0-2-.5-3l-1-2c-.5-1-1-2-1-3 0-3 1.5-5.5 4-5.5 1 0 2 .5 2.5 1.5" />
                  <circle cx="12" cy="13" r="1" />
                  <circle cx="12" cy="17" r="1" />
                </svg>
              </div>
              <span className="text-xl font-semibold tracking-tight text-foreground">
                Guitar<span className="text-primary">CRM</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-xs">
              The complete studio management platform for guitar teachers and their students.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {[
                {
                  label: 'Twitter',
                  icon: (
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                  ),
                },
                {
                  label: 'GitHub',
                  icon: (
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  ),
                },
                {
                  label: 'LinkedIn',
                  icon: (
                    <>
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                      <rect width="4" height="12" x="2" y="9" />
                      <circle cx="4" cy="4" r="2" />
                    </>
                  ),
                },
                {
                  label: 'YouTube',
                  icon: (
                    <>
                      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                      <path d="m10 15 5-3-5-3z" />
                    </>
                  ),
                },
              ].map((social) => (
                <a
                  key={social.label}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-muted/50 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border transition-colors"
                  aria-label={social.label}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {social.icon}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Guitar CRM. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Crafted with{' '}
            <span className="text-primary" aria-label="love">
              ♪
            </span>{' '}
            for musicians everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
}
