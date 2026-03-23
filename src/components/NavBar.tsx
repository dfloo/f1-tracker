'use client';

import { Monitor, Moon, Settings, Sun } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';

import {
  getFixedYearOptions,
  parseYearQuery,
  resolveYearQuery,
} from '@/lib/year';

const navLinks = [
  { href: '/drivers', label: 'Drivers' },
  { href: '/constructors', label: 'Constructors' },
  { href: '/events', label: 'Events' },
  { href: '/championships', label: 'Championships' },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const fixedYears = getFixedYearOptions();
  const yearParam = searchParams.get('year');
  const selectedYear = resolveYearQuery(yearParam);

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

  useEffect(() => {
    if (parseYearQuery(yearParam) !== null) {
      return;
    }

    const normalizedParams = new URLSearchParams(searchParams.toString());
    normalizedParams.set('year', String(selectedYear));

    const normalizedQuery = normalizedParams.toString();
    const normalizedHref = normalizedQuery
      ? `${pathname}?${normalizedQuery}`
      : pathname;

    router.replace(normalizedHref);
  }, [pathname, router, searchParams, selectedYear, yearParam]);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/');
  }

  function hrefWithYear(targetPath: string) {
    const params = new URLSearchParams({ year: String(selectedYear) });
    return `${targetPath}?${params.toString()}`;
  }

  function resolveYearChangePath(currentPath: string) {
    if (currentPath.startsWith('/drivers/') && currentPath !== '/drivers') {
      return '/drivers';
    }

    if (
      currentPath.startsWith('/constructors/') &&
      currentPath !== '/constructors'
    ) {
      return '/constructors';
    }

    if (currentPath.startsWith('/events/') && currentPath !== '/events') {
      return '/events';
    }

    return currentPath;
  }

  function handleYearChange(nextYear: number) {
    const nextPath = resolveYearChangePath(pathname);
    const params = new URLSearchParams(searchParams.toString());
    params.set('year', String(nextYear));

    const nextQuery = params.toString();
    const href = nextQuery ? `${nextPath}?${nextQuery}` : nextPath;
    router.push(href);
  }

  const selectedTheme = theme ?? 'system';

  function handleThemeChange(nextTheme: 'light' | 'dark' | 'system') {
    setTheme(nextTheme);
  }

  return (
    <header className="border-border bg-surface sticky top-0 z-50 border-b">
      <nav className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
          <Link
            href={hrefWithYear('/')}
            className="text-foreground flex items-center gap-2 text-xl font-bold tracking-tight"
          >
            <span
              className="inline-block h-5 w-1 rounded-sm"
              style={{ backgroundColor: 'var(--f1-red)' }}
              aria-hidden="true"
            />
            F1 Tracker
          </Link>

          <div className="flex items-center gap-2">
            <label
              htmlFor="navbar-year"
              className="text-muted text-sm font-medium"
            >
              Season
            </label>
            <select
              id="navbar-year"
              name="navbar-year"
              value={selectedYear}
              onChange={(event) => handleYearChange(Number(event.target.value))}
              className="border-border bg-surface text-foreground focus:ring-f1-red rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            >
              {fixedYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center justify-end gap-3 sm:w-auto">
          <ul className="flex flex-wrap items-center gap-1">
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={hrefWithYear(href)}
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
                role="dialog"
                aria-label="Theme settings"
                className="bg-surface border-border absolute right-0 mt-2 rounded-md border p-2 shadow-lg"
              >
                <div
                  aria-label="Theme mode"
                  className="bg-surface-hover flex items-center gap-1 rounded-md p-1"
                >
                  <button
                    type="button"
                    title="Light"
                    aria-label="Light mode"
                    aria-pressed={selectedTheme === 'light'}
                    onClick={() => handleThemeChange('light')}
                    className={[
                      'rounded p-2 transition-colors',
                      selectedTheme === 'light'
                        ? 'bg-surface text-foreground'
                        : 'text-muted hover:bg-surface hover:text-foreground',
                    ].join(' ')}
                  >
                    <Sun size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    title="Dark"
                    aria-label="Dark mode"
                    aria-pressed={selectedTheme === 'dark'}
                    onClick={() => handleThemeChange('dark')}
                    className={[
                      'rounded p-2 transition-colors',
                      selectedTheme === 'dark'
                        ? 'bg-surface text-foreground'
                        : 'text-muted hover:bg-surface hover:text-foreground',
                    ].join(' ')}
                  >
                    <Moon size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    title="System"
                    aria-label="System mode"
                    aria-pressed={selectedTheme === 'system'}
                    onClick={() => handleThemeChange('system')}
                    className={[
                      'rounded p-2 transition-colors',
                      selectedTheme === 'system'
                        ? 'bg-surface text-foreground'
                        : 'text-muted hover:bg-surface hover:text-foreground',
                    ].join(' ')}
                  >
                    <Monitor size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </nav>
    </header>
  );
}
