'use client';

import { Check, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';

const navLinks = [
  { href: '/drivers', label: 'Drivers' },
  { href: '/teams', label: 'Teams' },
  { href: '/races', label: 'Races' },
  { href: '/championships', label: 'Championships' },
];

export default function NavBar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    function handleDocumentClick(event: MouseEvent) {
      if (!menuRef.current) {
        return;
      }

      if (menuRef.current.contains(event.target as Node)) {
        return;
      }

      setIsMenuOpen(false);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMenuOpen]);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/');
  }

  const selectedTheme = theme ?? 'system';

  function handleThemeChange(nextTheme: 'light' | 'dark' | 'system') {
    setTheme(nextTheme);
    setIsMenuOpen(false);
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

        <div className="flex items-center gap-3">
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

          <div ref={menuRef} className="relative">
            <button
              type="button"
              aria-label="Open settings menu"
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((open) => !open)}
              className="text-muted hover:text-foreground hover:bg-surface-hover rounded p-2 transition-colors"
            >
              <Settings size={18} aria-hidden="true" />
            </button>

            {isMenuOpen ? (
              <div
                role="menu"
                aria-label="Theme settings"
                className="bg-surface border-border absolute right-0 mt-2 w-44 rounded-md border p-1 shadow-lg"
              >
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={selectedTheme === 'light'}
                  onClick={() => handleThemeChange('light')}
                  className="hover:bg-surface-hover text-foreground flex w-full items-center justify-between rounded px-3 py-2 text-sm"
                >
                  Light
                  {selectedTheme === 'light' ? (
                    <Check size={14} aria-hidden="true" />
                  ) : null}
                </button>
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={selectedTheme === 'dark'}
                  onClick={() => handleThemeChange('dark')}
                  className="hover:bg-surface-hover text-foreground flex w-full items-center justify-between rounded px-3 py-2 text-sm"
                >
                  Dark
                  {selectedTheme === 'dark' ? (
                    <Check size={14} aria-hidden="true" />
                  ) : null}
                </button>
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={selectedTheme === 'system'}
                  onClick={() => handleThemeChange('system')}
                  className="hover:bg-surface-hover text-foreground flex w-full items-center justify-between rounded px-3 py-2 text-sm"
                >
                  Follow system
                  {selectedTheme === 'system' ? (
                    <Check size={14} aria-hidden="true" />
                  ) : null}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </nav>
    </header>
  );
}
