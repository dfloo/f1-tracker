'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/drivers', label: 'Drivers' },
  { href: '/teams', label: 'Teams' },
  { href: '/races', label: 'Races' },
  { href: '/championships', label: 'Championships' },
];

export default function NavBar() {
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/');
  }

  return (
    <header className="border-border bg-surface sticky top-0 z-50 border-b">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-foreground flex items-center gap-2 text-xl font-bold tracking-tight"
        >
          <span
            className="inline-block h-5 w-1 rounded-sm"
            style={{ backgroundColor: 'var(--f1-red)' }}
            aria-hidden="true"
          />
          F1 Tracker
        </Link>

        <ul className="flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={[
                  'rounded px-4 py-2 text-sm font-medium transition-colors',
                  isActive(href)
                    ? 'text-foreground'
                    : 'text-muted hover:text-foreground hover:bg-surface-hover',
                ].join(' ')}
                style={
                  isActive(href)
                    ? {
                        color: 'var(--f1-red)',
                        borderBottom: '2px solid var(--f1-red)',
                        borderRadius: 0,
                      }
                    : undefined
                }
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
