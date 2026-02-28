import Link from 'next/link';

const columns = [
  { title: 'Product', links: ['Features', 'Pricing', 'Changelog'] },
  { title: 'Resources', links: ['Help Center', 'API Docs', 'Blog'] },
  { title: 'Company', links: ['About', 'Contact', 'Careers'] },
  { title: 'Legal', links: ['Privacy', 'Terms'] },
];

export function LandingFooter() {
  return (
    <footer className="bg-[hsl(30_20%_7%)] py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-xl font-bold text-primary">
              Strummy
            </Link>
            <p className="text-sm text-[hsl(36_30%_60%)] mt-2 leading-relaxed">
              Your guitar teaching studio, beautifully organized.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-white/80 mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-[hsl(36_30%_60%)] hover:text-primary transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[hsl(36_30%_60%)]">
            &copy; {new Date().getFullYear()} Strummy. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {['Twitter', 'GitHub', 'YouTube'].map((s) => (
              <a
                key={s}
                href="#"
                className="text-xs text-[hsl(36_30%_60%)] hover:text-primary transition-colors"
              >
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
